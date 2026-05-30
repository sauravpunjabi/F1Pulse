/**
 * Full historical backfill, season by season.
 *
 *  - RESUMABLE: each season records an IngestRun (scope `history:season:<year>` —
 *    plus `:progression` when in progression mode). Seasons with a prior `success`
 *    run are skipped (no API calls), so an interrupted backfill resumes cheaply.
 *  - POLITE: reuses the serial, rate-limited Jolpica client + bulk season endpoints.
 *  - HONEST about gaps: missing rounds are logged (onGap) and stored empty, never
 *    fabricated (CLAUDE.md HARD RULES). A failed season is logged and skipped; the
 *    backfill continues rather than aborting.
 */
import { prisma } from '../lib/prisma.js';
import type { Gap } from './fetch-season.js';
import { ingestSeason } from './ingest.js';

export interface HistoryOptions {
  from: number;
  to: number;
  progression?: boolean;
  qualifying?: boolean;
  force?: boolean;
  log?: (message: string) => void;
}

export interface HistoryResult {
  seasonsProcessed: number;
  seasonsSkipped: number;
  seasonsFailed: number;
  gaps: Gap[];
}

function scopeFor(year: number, progression: boolean): string {
  return progression ? `history:season:${year}:progression` : `history:season:${year}`;
}

export async function ingestHistory(opts: HistoryOptions): Promise<HistoryResult> {
  const log = opts.log ?? (() => {});
  const progression = opts.progression ?? false;
  const gaps: Gap[] = [];
  let seasonsProcessed = 0;
  let seasonsSkipped = 0;
  let seasonsFailed = 0;

  for (let year = opts.from; year <= opts.to; year += 1) {
    const scope = scopeFor(year, progression);

    if (!opts.force) {
      const done = await prisma.ingestRun.findFirst({ where: { scope, status: 'success' } });
      if (done) {
        seasonsSkipped += 1;
        log(`↩︎  ${year} already ingested — skipping`);
        continue;
      }
    }

    const run = await prisma.ingestRun.create({
      data: { source: 'jolpica', scope, status: 'pending' },
    });

    try {
      const summary = await ingestSeason(String(year), {
        progression,
        qualifying: opts.qualifying,
        onGap: (gap) => {
          gaps.push(gap);
          log(`   ⚠ gap ${gap.seasonYear} R${gap.round}: missing ${gap.kind}`);
        },
      });

      if (!summary) {
        await prisma.ingestRun.update({
          where: { id: run.id },
          data: { status: 'success', recordCount: 0, finishedAt: new Date() },
        });
        seasonsProcessed += 1;
        log(`•  ${year}: no data in source`);
        continue;
      }

      const total =
        summary.scheduleRaces +
        summary.raceResults +
        summary.qualifyingResults +
        summary.driverStandingRows +
        summary.constructorStandingRows;
      await prisma.ingestRun.update({
        where: { id: run.id },
        data: { status: 'success', recordCount: total, finishedAt: new Date() },
      });
      seasonsProcessed += 1;
      log(
        `✓  ${year}: ${summary.scheduleRaces} races · ${summary.raceResults} results · ` +
          `${summary.driverStandingRows} drv-stand · ${summary.constructorStandingRows} con-stand`,
      );
    } catch (error) {
      await prisma.ingestRun.update({
        where: { id: run.id },
        data: { status: 'failed', error: String(error), finishedAt: new Date() },
      });
      seasonsFailed += 1;
      log(`✗  ${year} FAILED: ${String(error)}`);
    }
  }

  return { seasonsProcessed, seasonsSkipped, seasonsFailed, gaps };
}
