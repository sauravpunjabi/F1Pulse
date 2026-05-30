import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import {
  mapDriverStanding,
  mapConstructorStanding,
  type StandingsDto,
  type ConstructorStandingsDto,
} from '../dtos.js';

const router = Router();

/** Resolve "current" → max year in DB; otherwise parse as integer. */
async function resolveYear(param: string | undefined): Promise<number> {
  if (!param || param === 'current') {
    const s = await prisma.season.findFirst({ orderBy: { year: 'desc' } });
    return s?.year ?? new Date().getUTCFullYear();
  }
  return Number.parseInt(param, 10);
}

/** TTL: short for the current calendar year, long for historical seasons. */
function ttlFor(year: number): number {
  return year >= new Date().getUTCFullYear() ? TTL.SHORT : TTL.LONG;
}

/**
 * GET /api/standings/drivers?season=current|<year>
 * Driver championship table at the latest ingested round for that season.
 */
router.get('/drivers', async (req, res, next) => {
  try {
    const year = await resolveYear(req.query['season'] as string | undefined);
    const key = cacheKey('standings', 'drivers', year);
    const dto = await cacheAside<StandingsDto>(key, ttlFor(year), async () => {
      const latest = await prisma.driverStanding.aggregate({
        where: { seasonYear: year },
        _max: { round: true },
      });
      const round = latest._max.round ?? 0;

      const rows = await prisma.driverStanding.findMany({
        where: { seasonYear: year, round },
        orderBy: { position: 'asc' },
        include: {
          driver: true,
          constructorLinks: { include: { constructor: true } },
        },
      });

      return { season: year, round, standings: rows.map(mapDriverStanding) };
    });

    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/standings/constructors?season=current|<year>
 * Constructor championship table at the latest ingested round.
 */
router.get('/constructors', async (req, res, next) => {
  try {
    const year = await resolveYear(req.query['season'] as string | undefined);
    const key = cacheKey('standings', 'constructors', year);
    const dto = await cacheAside<ConstructorStandingsDto>(key, ttlFor(year), async () => {
      const latest = await prisma.constructorStanding.aggregate({
        where: { seasonYear: year },
        _max: { round: true },
      });
      const round = latest._max.round ?? 0;

      const rows = await prisma.constructorStanding.findMany({
        where: { seasonYear: year, round },
        orderBy: { position: 'asc' },
        include: { constructor: true },
      });

      return { season: year, round, standings: rows.map(mapConstructorStanding) };
    });

    res.json(dto);
  } catch (err) {
    next(err);
  }
});

export { router as standingsRouter };
