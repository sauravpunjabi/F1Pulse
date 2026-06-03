import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import { mapCircuit, mapRaceResult, mapQualifyingResult, type RoundResultsDto } from '../dtos.js';

const router = Router();

/**
 * GET /api/results/current/latest
 * Results for the most recently completed race in the current season.
 * Must be declared before /:season/:round to prevent "current" being parsed as a year.
 */
router.get('/current/latest', async (_req, res, next) => {
  try {
    const key = cacheKey('results', 'current', 'latest');
    const dto = await cacheAside<RoundResultsDto | null>(key, TTL.SHORT, async () => {
      const currentSeason = await prisma.season.findFirst({ orderBy: { year: 'desc' } });
      if (!currentSeason) return null;

      const now = new Date();
      const race = await prisma.race.findFirst({
        where: { seasonYear: currentSeason.year, date: { lte: now } },
        orderBy: { date: 'desc' },
        include: { circuit: true },
      });
      if (!race) return null;

      const [results, qualifying] = await Promise.all([
        prisma.raceResult.findMany({
          where: { raceId: race.id },
          orderBy: { position: 'asc' },
          include: { driver: true, constructor: true },
        }),
        prisma.qualifyingResult.findMany({
          where: { raceId: race.id },
          orderBy: { position: 'asc' },
          include: { driver: true, constructor: true },
        }),
      ]);

      return {
        season: race.seasonYear,
        round: race.round,
        raceName: race.name,
        date: race.date.toISOString(),
        circuit: mapCircuit(race.circuit),
        results: results.map(mapRaceResult),
        qualifying: qualifying.map(mapQualifyingResult),
      };
    });

    if (!dto) {
      res.status(404).json({ error: 'No completed races found' });
      return;
    }

    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/results/:season/:round
 * Race results + qualifying for a single round. Reads from Postgres only.
 */
router.get('/:season/:round', async (req, res, next) => {
  try {
    const seasonYear = Number.parseInt(req.params['season'] ?? '', 10);
    const round = Number.parseInt(req.params['round'] ?? '', 10);

    if (!Number.isInteger(seasonYear) || !Number.isInteger(round)) {
      res.status(400).json({ error: 'season and round must be integers' });
      return;
    }

    const isCurrentYear = seasonYear >= new Date().getUTCFullYear();
    const key = cacheKey('results', seasonYear, round);
    const dto = await cacheAside<RoundResultsDto | null>(
      key,
      isCurrentYear ? TTL.SHORT : TTL.LONG,
      async () => {
        const race = await prisma.race.findUnique({
          where: { seasonYear_round: { seasonYear, round } },
          include: { circuit: true },
        });
        if (!race) return null;

        const [results, qualifying] = await Promise.all([
          prisma.raceResult.findMany({
            where: { raceId: race.id },
            orderBy: { position: 'asc' },
            include: { driver: true, constructor: true },
          }),
          prisma.qualifyingResult.findMany({
            where: { raceId: race.id },
            orderBy: { position: 'asc' },
            include: { driver: true, constructor: true },
          }),
        ]);

        return {
          season: seasonYear,
          round,
          raceName: race.name,
          date: race.date.toISOString(),
          circuit: mapCircuit(race.circuit),
          results: results.map(mapRaceResult),
          qualifying: qualifying.map(mapQualifyingResult),
        };
      },
    );

    if (!dto) {
      res.status(404).json({ error: `No results for season ${seasonYear} round ${round}` });
      return;
    }

    res.json(dto);
  } catch (err) {
    next(err);
  }
});

export { router as resultsRouter };
