/**
 * Era-aware endpoints — read from Postgres, cached 24h (historical data is immutable
 * post-ingest). No hardcoded data: every value comes from the database.
 *
 * Routes (note: /range must be declared before /:year to avoid param collision):
 *   GET /api/era/range?from=&to=   → champions + summaries for a year range
 *   GET /api/era/:year/drivers     → that season's final driver standings
 *   GET /api/era/:year/races       → that season's schedule + results (podium per race)
 *   GET /api/era/:year/champion    → that season's champion
 */
import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import {
  mapDriverRef,
  mapConstructorRef,
  mapDriverStanding,
  mapCircuit,
  type SeasonChampionDto,
  type StandingsDto,
  type DriverStandingRow,
} from '../dtos.js';

const router = Router();

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Resolve the max (final) round for a season from DriverStanding rows. */
async function finalRoundFor(seasonYear: number): Promise<number> {
  const agg = await prisma.driverStanding.aggregate({
    where: { seasonYear },
    _max: { round: true },
  });
  return agg._max.round ?? 0;
}

/** Build the champion DTO for a season. Returns null when no standings exist. */
export async function buildChampionDto(seasonYear: number): Promise<SeasonChampionDto | null> {
  const round = await finalRoundFor(seasonYear);
  if (!round) return null;

  const row = await prisma.driverStanding.findFirst({
    where: { seasonYear, round, position: 1 },
    include: { driver: true, constructorLinks: { include: { constructor: true } } },
  });
  if (!row) return null;

  return {
    season: seasonYear,
    driver: mapDriverRef(row.driver),
    constructors: row.constructorLinks.map((l) => mapConstructorRef(l.constructor)),
    points: row.points,
    wins: row.wins,
  };
}

/** Build the driver standings DTO for a season (final round). */
export async function buildDriverStandingsDto(seasonYear: number): Promise<StandingsDto | null> {
  const round = await finalRoundFor(seasonYear);
  if (!round) return null;

  const rows = await prisma.driverStanding.findMany({
    where: { seasonYear, round },
    orderBy: { position: 'asc' },
    include: { driver: true, constructorLinks: { include: { constructor: true } } },
  });

  return {
    season: seasonYear,
    round,
    standings: rows.map((r) => mapDriverStanding(r as DriverStandingRow)),
  };
}

// ── GET /api/era/range?from=&to= ──────────────────────────────────────────────
// IMPORTANT: declared before /:year to prevent "range" being parsed as a year.

interface SeasonSummaryDto {
  season: number;
  raceCount: number;
  champion: SeasonChampionDto | null;
}

router.get('/range', async (req, res, next) => {
  try {
    const from = Number(req.query['from']);
    const to = Number(req.query['to']);
    if (!Number.isInteger(from) || !Number.isInteger(to) || from > to) {
      res.status(400).json({ error: 'from and to must be integers with from ≤ to' });
      return;
    }
    if (to - from > 100) {
      res.status(400).json({ error: 'range cannot exceed 100 seasons' });
      return;
    }

    const key = cacheKey('era', 'range', from, to);
    const dto = await cacheAside<SeasonSummaryDto[]>(key, TTL.LONG, async () => {
      const years = Array.from({ length: to - from + 1 }, (_, i) => from + i);
      const results: SeasonSummaryDto[] = [];

      for (const year of years) {
        const [raceCount, champion] = await Promise.all([
          prisma.race.count({ where: { seasonYear: year } }),
          buildChampionDto(year),
        ]);
        if (raceCount > 0 || champion) {
          results.push({ season: year, raceCount, champion });
        }
      }
      return results;
    });

    res.json(dto);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/era/:year/champion ───────────────────────────────────────────────

router.get('/:year/champion', async (req, res, next) => {
  try {
    const year = Number(req.params['year']);
    if (!Number.isInteger(year)) {
      res.status(400).json({ error: 'year must be an integer' });
      return;
    }

    const key = cacheKey('era', year, 'champion');
    const dto = await cacheAside<SeasonChampionDto | null>(key, TTL.LONG, () =>
      buildChampionDto(year),
    );

    if (!dto) {
      res.status(404).json({ error: `No champion data for ${year}` });
      return;
    }
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/era/:year/drivers ────────────────────────────────────────────────

router.get('/:year/drivers', async (req, res, next) => {
  try {
    const year = Number(req.params['year']);
    if (!Number.isInteger(year)) {
      res.status(400).json({ error: 'year must be an integer' });
      return;
    }

    const key = cacheKey('era', year, 'drivers');
    const dto = await cacheAside<StandingsDto | null>(key, TTL.LONG, () =>
      buildDriverStandingsDto(year),
    );

    if (!dto) {
      res.status(404).json({ error: `No standings data for ${year}` });
      return;
    }
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/era/:year/races ──────────────────────────────────────────────────

interface EraRaceDto {
  round: number;
  name: string;
  date: string;
  circuit: ReturnType<typeof mapCircuit>;
  podium: Array<{
    position: number;
    driver: ReturnType<typeof mapDriverRef>;
    constructor: ReturnType<typeof mapConstructorRef>;
    points: number;
    timeText: string | null;
  }>;
}

interface EraRacesDto {
  season: number;
  raceCount: number;
  races: EraRaceDto[];
}

router.get('/:year/races', async (req, res, next) => {
  try {
    const year = Number(req.params['year']);
    if (!Number.isInteger(year)) {
      res.status(400).json({ error: 'year must be an integer' });
      return;
    }

    const key = cacheKey('era', year, 'races');
    const dto = await cacheAside<EraRacesDto>(key, TTL.LONG, async () => {
      const races = await prisma.race.findMany({
        where: { seasonYear: year },
        orderBy: { round: 'asc' },
        include: { circuit: true },
      });

      const eraRaces: EraRaceDto[] = await Promise.all(
        races.map(async (race) => {
          // Fetch top-3 results; use driver + constructor separately to avoid the
          // Prisma `RaceResultInclude.constructor` name-clash with a select subset.
          const topResults = await prisma.raceResult.findMany({
            where: { raceId: race.id, position: { lte: 3 } },
            orderBy: { position: 'asc' },
            include: { driver: true, constructor: true },
          });

          return {
            round: race.round,
            name: race.name,
            date: race.date.toISOString(),
            circuit: mapCircuit(race.circuit),
            podium: topResults.map((r) => ({
              position: r.position,
              driver: mapDriverRef(r.driver),
              constructor: mapConstructorRef(r.constructor),
              points: r.points,
              timeText: r.timeText,
            })),
          };
        }),
      );

      return { season: year, raceCount: races.length, races: eraRaces };
    });

    res.json(dto);
  } catch (err) {
    next(err);
  }
});

export { router as eraRouter };
