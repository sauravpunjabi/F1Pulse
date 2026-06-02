import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import { mapDriverRef, type ConstructorProfileDto } from '../dtos.js';

const router = Router();

/**
 * GET /api/constructor/:id
 * Constructor profile: championship timeline with drivers' champion, total wins,
 * all-time unique driver roster, and active season range.
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
      const ctor = await prisma.constructor.findUnique({ where: { constructorId } });
      if (!ctor) return null;

      // ── Constructor championship seasons ────────────────────────────────────
      // Full model to avoid Prisma's "constructor" field name conflicting with
      // TypeScript's built-in Function.constructor when using partial select.

      const allCsStandings = await prisma.constructorStanding.findMany({
        where: { constructorId, position: 1 },
        orderBy: { seasonYear: 'asc' },
      });

      const maxCsRoundBySeason = await prisma.constructorStanding.groupBy({
        by: ['seasonYear'],
        where: { constructorId },
        _max: { round: true },
      });
      const csFinalRound = new Map(
        maxCsRoundBySeason.map((r) => [r.seasonYear, r._max.round ?? 0]),
      );

      const championshipSeasons = allCsStandings
        .filter((s) => s.round === csFinalRound.get(s.seasonYear))
        .map((s) => s.seasonYear);

      // ── Drivers' champion for each constructor title year ───────────────────

      const driverChampionships = await (async () => {
        if (championshipSeasons.length === 0) return [];

        const maxDsRoundBySeason = await prisma.driverStanding.groupBy({
          by: ['seasonYear'],
          where: { seasonYear: { in: championshipSeasons } },
          _max: { round: true },
        });

        const champions = await Promise.all(
          maxDsRoundBySeason.map(({ seasonYear, _max }) => {
            const finalRound = _max.round;
            if (!finalRound) return null;
            return prisma.driverStanding.findFirst({
              where: { seasonYear, round: finalRound, position: 1 },
              include: { driver: true },
            });
          }),
        );

        return champions
          .filter((c): c is NonNullable<typeof c> => c !== null)
          .map((c) => ({
            year: c.seasonYear,
            driverId: c.driverId,
            driverName: c.driver.familyName,
            driverCode: c.driver.code,
            points: c.points,
          }))
          .sort((a, b) => a.year - b.year);
      })();

      // ── Total race wins ─────────────────────────────────────────────────────

      const totalWins = await prisma.raceResult.count({
        where: { constructorId, position: 1 },
      });

      // ── All-time unique drivers ─────────────────────────────────────────────

      const driverGroups = await prisma.raceResult.groupBy({
        by: ['driverId'],
        where: { constructorId },
        orderBy: { driverId: 'asc' },
      });
      const driverIds = driverGroups.map((r) => r.driverId);
      const drivers = driverIds.length
        ? await prisma.driver.findMany({ where: { driverId: { in: driverIds } } })
        : [];

      // ── Active season range (via Race model to avoid RaceResult include conflict) ─

      const [firstRace, lastRace] = await Promise.all([
        prisma.race.findFirst({
          where: { results: { some: { constructorId } } },
          orderBy: { seasonYear: 'asc' },
          select: { seasonYear: true },
        }),
        prisma.race.findFirst({
          where: { results: { some: { constructorId } } },
          orderBy: { seasonYear: 'desc' },
          select: { seasonYear: true },
        }),
      ]);

      return {
        id: ctor.constructorId,
        name: ctor.name,
        nationality: ctor.nationality,
        totalChampionships: championshipSeasons.length,
        totalWins,
        firstSeason: firstRace?.seasonYear ?? null,
        lastSeason: lastRace?.seasonYear ?? null,
        championships: driverChampionships,
        drivers: drivers.map(mapDriverRef),
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
