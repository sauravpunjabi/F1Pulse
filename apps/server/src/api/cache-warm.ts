/**
 * Cache pre-warmer: populates Redis for key eras on server start so the first
 * real user request returns instantly from cache rather than waiting on Neon.
 *
 * Runs async (via setImmediate) — never blocks server startup.
 * Failures are logged and swallowed — pre-warming is best-effort.
 */
import { buildChampionDto, buildDriverStandingsDto } from './routes/era.js';
import { cacheAside, cacheKey, TTL } from './cache.js';
import { prisma } from '../lib/prisma.js';

/* eslint-disable no-console */

const SIGNATURE_ERAS = [1950, 1967, 1976, 1984, 1988, 1994, 2000, 2009, 2021];

async function warmYear(year: number): Promise<void> {
  await Promise.all([
    cacheAside(cacheKey('era', year, 'champion'), TTL.LONG, () => buildChampionDto(year)),
    cacheAside(cacheKey('era', year, 'drivers'), TTL.LONG, () => buildDriverStandingsDto(year)),
  ]);
}

async function warmCurrentSeason(year: number): Promise<void> {
  // Current season uses short TTL — champion + driver standings.
  await Promise.all([
    cacheAside(cacheKey('era', year, 'champion'), TTL.SHORT, () => buildChampionDto(year)),
    cacheAside(cacheKey('era', year, 'drivers'), TTL.SHORT, () => buildDriverStandingsDto(year)),
    cacheAside(cacheKey('season', 'current'), TTL.SHORT, async () => {
      const season = await prisma.season.findFirst({ orderBy: { year: 'desc' } });
      return season ? { year: season.year } : null;
    }),
  ]);
}

export function schedulePrewarm(): void {
  setImmediate(async () => {
    const currentYear = new Date().getUTCFullYear();
    const years = [...SIGNATURE_ERAS, currentYear];

    console.log(`[cache-warm] pre-warming ${years.length} eras: ${years.join(', ')}`);

    for (const year of years) {
      try {
        if (year === currentYear) {
          await warmCurrentSeason(year);
        } else {
          await warmYear(year);
        }
        console.log(`[cache-warm] ✓ ${year}`);
      } catch (err) {
        console.warn(`[cache-warm] ✗ ${year}:`, (err as Error).message);
      }
    }

    console.log('[cache-warm] pre-warming complete');
  });
}
