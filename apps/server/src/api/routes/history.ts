import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import { mapDriverRef, mapConstructorRef, type SeasonChampionDto } from '../dtos.js';

const router = Router();

/**
 * GET /api/history/champions
 * One row per season from 1950 to the most recent completed season.
 * Uses the per-season final-standings snapshot (position 1, max round per season).
 * Cached 24h — historical champions never change.
 */
router.get('/champions', async (_req, res, next) => {
  try {
    const key = cacheKey('history', 'champions');
    const dto = await cacheAside<SeasonChampionDto[]>(key, TTL.LONG, async () => {
      // Query 1: the final (max) round per season.
      const maxRounds = await prisma.driverStanding.groupBy({
        by: ['seasonYear'],
        _max: { round: true },
      });
      const finalRound = new Map(maxRounds.map((r) => [r.seasonYear, r._max.round ?? 0]));

      // Query 2: every championship-leading row across all seasons, in one shot.
      const leaders = await prisma.driverStanding.findMany({
        where: { position: 1 },
        include: {
          driver: true,
          constructorLinks: { include: { constructor: true } },
        },
        orderBy: { seasonYear: 'asc' },
      });

      // Keep only the leader at each season's FINAL round = that season's champion.
      return leaders
        .filter((s) => s.round === finalRound.get(s.seasonYear))
        .map((s) => ({
          season: s.seasonYear,
          driver: mapDriverRef(s.driver),
          constructors: s.constructorLinks.map((l) => mapConstructorRef(l.constructor)),
          points: s.points,
          wins: s.wins,
        }));
    });

    res.json(dto);
  } catch (err) {
    next(err);
  }
});

export { router as historyRouter };
