/**
 * Fetch a whole season from Jolpica into an in-memory SeasonBundle, using the
 * bulk season-level endpoints (schedule, all results, all qualifying) so a season
 * costs ~a handful of calls instead of one per round. Network stays serial +
 * rate-limited inside the Jolpica client.
 *
 * Standings have no bulk endpoint, so:
 *   - default: store only the FINAL standings snapshot (cheap — 2 calls/season),
 *   - `progression: true`: fetch per-round standings snapshots (current season, or
 *     `ingest:history --progression` — heavier, ~2 calls per round).
 */
import * as jolpica from '../clients/jolpica.js';
import type {
  ErgastConstructorStanding,
  ErgastDriverStanding,
  ErgastQualifyingResult,
  ErgastResult,
} from './ergast-types.js';
import type { RoundBundle, SeasonBundle } from './persist.js';
import { int } from './parse.js';

export interface Gap {
  seasonYear: number;
  round: number;
  kind: 'results' | 'standings';
}

export interface FetchOptions {
  /** Fetch per-round standings snapshots (progression), not just the final table. */
  progression?: boolean;
  /** Include qualifying results (sparse before ~1994). */
  qualifying?: boolean;
  /** Called when a completed round is missing data — logged, never fabricated. */
  onGap?: (gap: Gap) => void;
}

export async function fetchSeasonBundle(
  season: string,
  opts: FetchOptions = {},
): Promise<SeasonBundle | null> {
  const scheduleRaces = await jolpica.fetchSchedule(season);
  const first = scheduleRaces[0];
  if (!first) return null;
  const seasonYear = int(first.season);
  const seasonStr = String(seasonYear);

  // Bulk results (+ optional qualifying) for the entire season.
  const resultRaces = await jolpica.fetchSeasonResults(seasonStr);
  const resultsByRound = new Map<number, ErgastResult[]>(
    resultRaces.map((r) => [int(r.round), r.Results ?? []]),
  );

  const qualByRound = new Map<number, ErgastQualifyingResult[]>();
  if (opts.qualifying) {
    const qualRaces = await jolpica.fetchSeasonQualifying(seasonStr);
    for (const r of qualRaces) qualByRound.set(int(r.round), r.QualifyingResults ?? []);
  }

  // Final standings + the latest completed round.
  const finalDs = await jolpica.fetchDriverStandings(seasonStr);
  const finalCs = await jolpica.fetchConstructorStandings(seasonStr);
  const latestRound = finalDs ? int(finalDs.round) : 0;

  const rounds: RoundBundle[] = [];
  for (const sched of scheduleRaces) {
    const round = int(sched.round);
    const results = resultsByRound.get(round) ?? [];
    const qualifying = qualByRound.get(round) ?? [];
    let driverStandings: ErgastDriverStanding[] = [];
    let constructorStandings: ErgastConstructorStanding[] = [];

    if (opts.progression && round <= latestRound) {
      driverStandings =
        (await jolpica.fetchDriverStandings(seasonStr, String(round)))?.standings ?? [];
      constructorStandings =
        (await jolpica.fetchConstructorStandings(seasonStr, String(round)))?.standings ?? [];
      if (driverStandings.length === 0) opts.onGap?.({ seasonYear, round, kind: 'standings' });
    }

    // A completed round with no results is a genuine data gap — log it, store empty.
    if (round <= latestRound && results.length === 0) {
      opts.onGap?.({ seasonYear, round, kind: 'results' });
    }

    rounds.push({ round, results, qualifying, driverStandings, constructorStandings });
  }

  // Default mode: store ONLY the final standings, attached to the latest round.
  if (!opts.progression && latestRound > 0) {
    const last = rounds.find((rb) => rb.round === latestRound);
    if (last) {
      last.driverStandings = finalDs?.standings ?? [];
      last.constructorStandings = finalCs?.standings ?? [];
    }
  }

  return { seasonYear, scheduleRaces, rounds };
}
