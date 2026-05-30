import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import { mapDriverRef, type ConstructorProfileDto } from '../dtos.js';

const router = Router();

/**
 * GET /api/constructor/:id
 * Constructor profile, championship years, and recent drivers (by race results).
 */
router.get('/:constructorId', async (req, res, next) => {
  try {
    const { constructorId } = req.params;
    if (!constructorId) {
      res.status(400).json({ error: 'constructorId is required' });
      return;
    }

    const key = cacheKey('constructor', constructorId);
    const dto = await cacheAside<ConstructorProfileDto | null>(key, TTL.SHORT, async () => {
      const constructor = await prisma.constructor.findUnique({ where: { constructorId } });
      if (!constructor) return null;

      // Championship years: ConstructorStanding position=1 at the final round of each season.
      const allStandings = await prisma.constructorStanding.findMany({
        where: { constructorId, position: 1 },
        orderBy: { seasonYear: 'asc' },
      });

      // Find the max round per season (the "final" snapshot).
      const maxRoundBySeason = await prisma.constructorStanding.groupBy({
        by: ['seasonYear'],
        where: { constructorId },
        _max: { round: true },
      });
      const finalRound = new Map(maxRoundBySeason.map((r) => [r.seasonYear, r._max.round ?? 0]));
      const championshipYears = allStandings
        .filter((s) => s.round === finalRound.get(s.seasonYear))
        .map((s) => s.seasonYear);

      // Recent drivers: groupBy driverId for this constructor in the last 3 seasons,
      // then fetch profiles. groupBy avoids the Prisma `constructor` field name clash.
      const currentYear = new Date().getUTCFullYear();
      const grouped = await prisma.raceResult.groupBy({
        by: ['driverId'],
        where: {
          constructorId,
          race: { seasonYear: { gte: currentYear - 2 } },
        },
        orderBy: { driverId: 'asc' },
      });
      const recentDriverIds = grouped.map((r) => r.driverId);
      const recentDrivers = recentDriverIds.length
        ? await prisma.driver.findMany({ where: { driverId: { in: recentDriverIds } } })
        : [];

      return {
        id: constructor.constructorId,
        name: constructor.name,
        nationality: constructor.nationality,
        championshipYears,
        recentDrivers: recentDrivers.map(mapDriverRef),
      };
    });

    if (!dto) {
      res.status(404).json({ error: `Constructor "${constructorId}" not found` });
      return;
    }
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

export { router as constructorRouter };
