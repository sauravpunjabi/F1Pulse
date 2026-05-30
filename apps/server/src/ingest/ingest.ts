/**
 * Ingestion orchestration: fetch a season into memory, then persist it in batched
 * transactions. Idempotent end-to-end (CLAUDE.md HARD RULES) — every persist is a
 * scoped delete+insert / skipDuplicates, so re-running is always safe.
 */
import { prisma } from '../lib/prisma.js';
import { fetchSeasonBundle, type FetchOptions } from './fetch-season.js';
import { persistSeasonBundle, type PersistCounts } from './persist.js';

export interface IngestSummary extends PersistCounts {
  seasonYear: number;
}

function totalRows(counts: PersistCounts): number {
  return (
    counts.scheduleRaces +
    counts.raceResults +
    counts.qualifyingResults +
    counts.driverStandingRows +
    counts.constructorStandingRows
  );
}

/** Fetch + persist a single season. Returns null when the season has no schedule. */
export async function ingestSeason(
  season: string,
  opts: FetchOptions = {},
): Promise<IngestSummary | null> {
  const bundle = await fetchSeasonBundle(season, opts);
  if (!bundle) return null;
  const counts = await persistSeasonBundle(bundle);
  return { seasonYear: bundle.seasonYear, ...counts };
}

/**
 * Ingest the live season via the /current/ alias, WITH per-round progression and
 * qualifying. Records an IngestRun for bookkeeping.
 */
export async function ingestCurrentSeason(
  onProgress?: (message: string) => void,
): Promise<IngestSummary> {
  const log = onProgress ?? (() => {});
  const run = await prisma.ingestRun.create({
    data: { source: 'jolpica', scope: 'current', status: 'pending' },
  });

  try {
    log('fetching schedule + bulk results/qualifying + per-round standings…');
    const summary = await ingestSeason('current', {
      progression: true,
      qualifying: true,
      onGap: (g) => log(`gap: ${g.seasonYear} R${g.round} missing ${g.kind}`),
    });
    if (!summary) throw new Error('No data returned for the current season');

    await prisma.ingestRun.update({
      where: { id: run.id },
      data: { status: 'success', recordCount: totalRows(summary), finishedAt: new Date() },
    });
    return summary;
  } catch (error) {
    await prisma.ingestRun.update({
      where: { id: run.id },
      data: { status: 'failed', error: String(error), finishedAt: new Date() },
    });
    throw error;
  }
}
