import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import { mapRaceSchedule, type RaceScheduleDto } from '../dtos.js';

const router = Router();

async function resolveYear(param: string | undefined): Promise<number> {
  if (!param || param === 'current') {
    const s = await prisma.season.findFirst({ orderBy: { year: 'desc' } });
    return s?.year ?? new Date().getUTCFullYear();
  }
  return Number.parseInt(param, 10);
}

interface ScheduleDto {
  season: number;
  races: RaceScheduleDto[];
}

/**
 * GET /api/schedule?season=current|<year>
 * Full race calendar for a season, ordered by round.
 */
router.get('/', async (req, res, next) => {
  try {
    const year = await resolveYear(req.query['season'] as string | undefined);
    const isCurrentYear = year >= new Date().getUTCFullYear();
    const key = cacheKey('schedule', year);
    const dto = await cacheAside<ScheduleDto>(
      key,
      isCurrentYear ? TTL.SHORT : TTL.LONG,
      async () => {
        const races = await prisma.race.findMany({
          where: { seasonYear: year },
          orderBy: { round: 'asc' },
          include: { circuit: true },
        });
        return { season: year, races: races.map(mapRaceSchedule) };
      },
    );

    res.json(dto);
  } catch (err) {
    next(err);
  }
});

export { router as scheduleRouter };
