import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import type { CircuitsListDto, CircuitListItemDto } from '../dtos.js';

const router = Router();

/**
 * GET /api/circuits
 * All circuits ever used in F1, sorted by name, with first race year + total races.
 * Aggregated from the Race table — no extra ingestion needed.
 */
router.get('/', async (_req, res, next) => {
  try {
    const key = cacheKey('circuits', 'list');
    const dto = await cacheAside<CircuitsListDto>(key, TTL.LONG, async () => {
      const [circuits, raceCounts] = await Promise.all([
        prisma.circuit.findMany({ orderBy: { name: 'asc' } }),
        prisma.race.groupBy({
          by: ['circuitId'],
          _count: { id: true },
          _min: { seasonYear: true },
        }),
      ]);

      const statsMap = new Map(
        raceCounts.map((r) => [
          r.circuitId,
          { total: r._count.id, firstYear: r._min.seasonYear ?? 0 },
        ]),
      );

      return circuits
        .map((c): CircuitListItemDto => {
          const stats = statsMap.get(c.circuitId) ?? { total: 0, firstYear: 0 };
          return {
            id: c.circuitId,
            name: c.name,
            locality: c.locality,
            country: c.country,
            firstRaceYear: stats.firstYear,
            totalRaces: stats.total,
          };
        })
        .filter((c) => c.totalRaces > 0); // only circuits that hosted at least one race
    });

    res.json(dto);
  } catch (err) {
    next(err);
  }
});

export { router as circuitsRouter };
