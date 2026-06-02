import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import { type ConstructorsListDto } from '../dtos.js';

const router = Router();

/**
 * GET /api/constructors
 * List of constructors active in the current season with aggregate stats.
 * Scoped to the current year's race results; total championships and wins
 * span all history.
 */
router.get('/', async (_req, res, next) => {
  try {
    const key = cacheKey('constructors', 'list');
    const dto = await cacheAside<ConstructorsListDto>(key, TTL.SHORT, async () => {
      const currentYear = new Date().getUTCFullYear();

      // Constructors that have a race result in the current season.
      const activeGroups = await prisma.raceResult.groupBy({
        by: ['constructorId'],
        where: { race: { seasonYear: currentYear } },
        orderBy: { constructorId: 'asc' },
      });
      const activeIds = activeGroups.map((r) => r.constructorId);
      if (activeIds.length === 0) return [];

      const ctors = await prisma.constructor.findMany({
        where: { constructorId: { in: activeIds } },
        orderBy: { name: 'asc' },
      });

      // Per-constructor: total wins + championship count.
      const list = await Promise.all(
        ctors.map(async (c) => {
          const [totalWins, champYears, maxRoundRows] = await Promise.all([
            prisma.raceResult.count({ where: { constructorId: c.constructorId, position: 1 } }),
            // Full model to avoid TS conflict on "constructor" field in partial select.
            prisma.constructorStanding.findMany({
              where: { constructorId: c.constructorId, position: 1 },
            }),
            prisma.constructorStanding.groupBy({
              by: ['seasonYear'],
              where: { constructorId: c.constructorId },
              _max: { round: true },
            }),
          ]);

          const finalRound = new Map(maxRoundRows.map((r) => [r.seasonYear, r._max.round ?? 0]));
          const totalChampionships = champYears.filter(
            (s) => s.round === finalRound.get(s.seasonYear),
          ).length;

          return {
            id: c.constructorId,
            name: c.name,
            nationality: c.nationality,
            totalChampionships,
            totalWins,
          };
        }),
      );

      return list;
    });

    res.json(dto);
  } catch (err) {
    next(err);
  }
});

export { router as constructorsRouter };
