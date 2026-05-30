import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import {
  mapDriverRef,
  mapConstructorRef,
  mapRaceSchedule,
  type SeasonCurrentDto,
} from '../dtos.js';

const router = Router();

/**
 * GET /api/season/current
 * Returns: the live season year, next upcoming race, and the current championship leader.
 * Data reads from Postgres only — never from Jolpica at request time.
 */
router.get('/', async (_req, res, next) => {
  try {
    const key = cacheKey('season', 'current');
    const dto = await cacheAside<SeasonCurrentDto>(key, TTL.SHORT, async () => {
      // Resolve current season = max year in the Season table.
      const season = await prisma.season.findFirst({ orderBy: { year: 'desc' } });
      if (!season) return { year: new Date().getUTCFullYear(), nextRace: null, leader: null };
      const year = season.year;

      const now = new Date();

      // Next race: soonest race not yet started.
      const nextRaceRow = await prisma.race.findFirst({
        where: { seasonYear: year, date: { gt: now } },
        orderBy: { date: 'asc' },
        include: { circuit: true },
      });

      // Current leader: position 1 at the highest ingested round.
      const latestRound = await prisma.driverStanding.aggregate({
        where: { seasonYear: year },
        _max: { round: true },
      });
      const round = latestRound._max.round ?? 0;

      const leaderRow = round
        ? await prisma.driverStanding.findFirst({
            where: { seasonYear: year, round, position: 1 },
            include: {
              driver: true,
              constructorLinks: { include: { constructor: true } },
            },
          })
        : null;

      return {
        year,
        nextRace: nextRaceRow ? mapRaceSchedule(nextRaceRow) : null,
        leader: leaderRow
          ? {
              driver: mapDriverRef(leaderRow.driver),
              constructors: leaderRow.constructorLinks.map((l) => mapConstructorRef(l.constructor)),
              points: leaderRow.points,
              wins: leaderRow.wins,
              round,
            }
          : null,
      };
    });

    res.json(dto);
  } catch (err) {
    next(err);
  }
});

export { router as seasonRouter };
