import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { cacheAside, cacheKey, TTL } from '../cache.js';
import type { CircuitProfileDto, CircuitRaceDto, CircuitWinnerDto } from '../dtos.js';

const router = Router();

const ERA_ORDER = [
  'Pioneer Era',
  'Classic Era',
  'Turbo & Ground Effect',
  'Modern Era',
  'Hybrid Era',
  'Ground Effect Revival',
] as const;

function getEra(year: number): string {
  if (year <= 1966) return 'Pioneer Era';
  if (year <= 1979) return 'Classic Era';
  if (year <= 1993) return 'Turbo & Ground Effect';
  if (year <= 2009) return 'Modern Era';
  if (year <= 2021) return 'Hybrid Era';
  return 'Ground Effect Revival';
}

/**
 * GET /api/circuit/:circuitId
 * Full circuit profile: identity, last 10 race winners, stats, eras.
 * All data computed from the DB — zero third-party calls at request time.
 */
router.get('/:circuitId', async (req, res, next) => {
  try {
    const { circuitId } = req.params;
    if (!circuitId) {
      res.status(400).json({ error: 'circuitId is required' });
      return;
    }

    const key = cacheKey('circuit', circuitId);
    const dto = await cacheAside<CircuitProfileDto | null>(key, TTL.LONG, async () => {
      const circuit = await prisma.circuit.findUnique({
        where: { circuitId },
        include: {
          races: {
            orderBy: [{ seasonYear: 'desc' }, { round: 'asc' }],
            include: {
              results: {
                where: { positionText: '1' },
                take: 1,
                orderBy: { position: 'asc' },
                include: { driver: true, constructor: true },
              },
            },
          },
        },
      });

      if (!circuit) return null;

      const races = circuit.races;
      const totalRaces = races.length;
      const firstRaceYear =
        totalRaces > 0
          ? Math.min(...races.map((r) => r.seasonYear))
          : 0;

      // Last 10 races, most-recent first
      const recentRaces: CircuitRaceDto[] = races.slice(0, 10).map((race) => {
        const winner = race.results[0];
        return {
          season: race.seasonYear,
          round: race.round,
          raceName: race.name,
          winnerGivenName: winner?.driver.givenName ?? '',
          winnerFamilyName: winner?.driver.familyName ?? '',
          winnerDriverId: winner?.driver.driverId ?? '',
          constructorName: winner?.constructor.name ?? '',
          constructorId: winner?.constructor.constructorId ?? '',
        };
      });

      // Most wins at this circuit
      const winCounts = new Map<string, CircuitWinnerDto>();
      for (const race of races) {
        const winner = race.results[0];
        if (winner) {
          const { driverId, givenName, familyName } = winner.driver;
          const entry = winCounts.get(driverId);
          if (entry) {
            entry.wins++;
          } else {
            winCounts.set(driverId, { driverId, givenName, familyName, wins: 1 });
          }
        }
      }
      const mostWins =
        [...winCounts.values()].sort((a, b) => b.wins - a.wins)[0] ?? null;

      // Eras this circuit has hosted
      const eraSet = new Set(races.map((r) => getEra(r.seasonYear)));
      const eras = ERA_ORDER.filter((e) => eraSet.has(e));

      return {
        id: circuit.circuitId,
        name: circuit.name,
        locality: circuit.locality,
        country: circuit.country,
        lat: circuit.lat,
        lng: circuit.long,
        firstRaceYear,
        totalRaces,
        recentRaces,
        mostWins,
        eras,
      };
    });

    if (!dto) {
      res.status(404).json({ error: `Circuit "${circuitId}" not found` });
      return;
    }
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

export { router as circuitRouter };
