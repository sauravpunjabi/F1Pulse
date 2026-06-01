import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import {
  mapConstructorRef,
  type DriverProfileDto,
  type DriverWinDto,
  type DriverCareerSeasonDto,
} from '../dtos.js';

const router = Router();

/**
 * GET /api/driver/:driverId
 * Driver profile + per-season career + computed aggregate stats.
 *
 * stats.podiums  — RaceResult rows where positionText IN ('1','2','3')
 * stats.poles    — QualifyingResult rows where position = 1
 * stats.wins     — sum of per-season wins from DriverStanding snapshots
 * stats.championships — seasons where final standing position = 1
 */
router.get('/:driverId', async (req, res, next) => {
  try {
    const { driverId } = req.params;
    if (!driverId) {
      res.status(400).json({ error: 'driverId is required' });
      return;
    }

    const key = cacheKey('driver', driverId);
    const dto = await cacheAside<DriverProfileDto | null>(key, TTL.SHORT, async () => {
      const driver = await prisma.driver.findUnique({ where: { driverId } });
      if (!driver) return null;

      const [allStandings, podiumCount, poleCount] = await Promise.all([
        prisma.driverStanding.findMany({
          where: { driverId },
          orderBy: [{ seasonYear: 'asc' }, { round: 'desc' }],
          include: { constructorLinks: { include: { constructor: true } } },
        }),
        prisma.raceResult.count({
          where: { driverId, positionText: { in: ['1', '2', '3'] } },
        }),
        prisma.qualifyingResult.count({
          where: { driverId, position: 1 },
        }),
      ]);

      const seenSeasons = new Set<number>();
      const career = allStandings
        .filter((s) => {
          if (seenSeasons.has(s.seasonYear)) return false;
          seenSeasons.add(s.seasonYear);
          return true;
        })
        .map((s) => ({
          season: s.seasonYear,
          round: s.round,
          position: s.position,
          positionText: s.positionText,
          points: s.points,
          wins: s.wins,
          constructors: s.constructorLinks.map((l) => mapConstructorRef(l.constructor)),
        }));

      const totalWins = career.reduce((sum, s) => sum + s.wins, 0);
      const championships = career.filter((s) => s.position === 1).length;

      return {
        id: driver.driverId,
        givenName: driver.givenName,
        familyName: driver.familyName,
        code: driver.code,
        permanentNumber: driver.permanentNumber,
        nationality: driver.nationality,
        dateOfBirth: driver.dateOfBirth?.toISOString().slice(0, 10) ?? null,
        career,
        stats: {
          wins: totalWins,
          podiums: podiumCount,
          poles: poleCount,
          championships,
          seasonsRaced: career.length,
        },
      };
    });

    if (!dto) {
      res.status(404).json({ error: `Driver "${driverId}" not found` });
      return;
    }
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/driver/:driverId/seasons
 * Per-season career progression — the same career array from the profile,
 * exposed as a lightweight standalone endpoint for the timeline component.
 */
router.get('/:driverId/seasons', async (req, res, next) => {
  try {
    const { driverId } = req.params;
    if (!driverId) {
      res.status(400).json({ error: 'driverId is required' });
      return;
    }

    const key = cacheKey('driver-seasons', driverId);
    const seasons = await cacheAside<DriverCareerSeasonDto[]>(key, TTL.SHORT, async () => {
      const allStandings = await prisma.driverStanding.findMany({
        where: { driverId },
        orderBy: [{ seasonYear: 'asc' }, { round: 'desc' }],
        include: { constructorLinks: { include: { constructor: true } } },
      });

      const seenSeasons = new Set<number>();
      return allStandings
        .filter((s) => {
          if (seenSeasons.has(s.seasonYear)) return false;
          seenSeasons.add(s.seasonYear);
          return true;
        })
        .map((s) => ({
          season: s.seasonYear,
          round: s.round,
          position: s.position,
          positionText: s.positionText,
          points: s.points,
          wins: s.wins,
          constructors: s.constructorLinks.map((l) => mapConstructorRef(l.constructor)),
        }));
    });

    res.json(seasons);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/driver/:driverId/wins
 * All race wins for a driver, ordered by season and round.
 */
router.get('/:driverId/wins', async (req, res, next) => {
  try {
    const { driverId } = req.params;
    if (!driverId) {
      res.status(400).json({ error: 'driverId is required' });
      return;
    }

    const key = cacheKey('driver-wins', driverId);
    const wins = await cacheAside<DriverWinDto[]>(key, TTL.LONG, async () => {
      const results = await prisma.raceResult.findMany({
        where: { driverId, positionText: '1' },
        orderBy: [{ race: { seasonYear: 'asc' } }, { race: { round: 'asc' } }],
        include: {
          race: { include: { circuit: true } },
          constructor: true,
        },
      });

      return results.map((r) => ({
        season: r.race.seasonYear,
        round: r.race.round,
        raceName: r.race.name,
        circuitName: r.race.circuit.name,
        country: r.race.circuit.country,
        constructor: mapConstructorRef(r.constructor),
        date: r.race.date.toISOString().slice(0, 10),
        laps: r.laps,
        timeText: r.timeText,
      }));
    });

    res.json(wins);
  } catch (err) {
    next(err);
  }
});

export { router as driverRouter };
