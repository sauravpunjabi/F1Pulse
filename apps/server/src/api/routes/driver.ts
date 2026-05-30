import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import { mapConstructorRef, type DriverProfileDto } from '../dtos.js';

const router = Router();

/**
 * GET /api/driver/:driverId
 * Driver profile + per-season career progression.
 *
 * Career is built from DriverStanding rows (one row = one season snapshot).
 * 2026 (current season) has per-round snapshots; 1950–2025 have only the final
 * season snapshot — the career array safely uses the MAX round per season for both.
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

      // For each season, take only the final round snapshot so historical (one-row-per-season)
      // and current-season (multiple rounds) are represented the same way.
      const allStandings = await prisma.driverStanding.findMany({
        where: { driverId },
        orderBy: [{ seasonYear: 'asc' }, { round: 'desc' }],
        include: { constructorLinks: { include: { constructor: true } } },
      });

      // Dedupe to one row per season (highest round = the "final" snapshot).
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

      return {
        id: driver.driverId,
        givenName: driver.givenName,
        familyName: driver.familyName,
        code: driver.code,
        permanentNumber: driver.permanentNumber,
        nationality: driver.nationality,
        dateOfBirth: driver.dateOfBirth?.toISOString().slice(0, 10) ?? null,
        career,
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

export { router as driverRouter };
