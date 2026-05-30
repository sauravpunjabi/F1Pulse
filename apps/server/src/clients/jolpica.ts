/**
 * Jolpica (Ergast-compatible) HTTP client. SERVER-ONLY — the browser never calls
 * this (see CLAUDE.md HARD RULES). Jolpica is volunteer-run and rate-limited, so we
 * treat it as a scarce shared resource:
 *
 *   - all requests are serialized (concurrency = 1) with a polite minimum interval
 *   - 429 / 5xx responses are retried with exponential backoff (honoring Retry-After)
 *   - results are paginated with limit=100 (the API max) + offset
 */
import { env } from '../config/env.js';
import type {
  ErgastConstructorStanding,
  ErgastDriverStanding,
  ErgastMRData,
  ErgastRace,
  ErgastResponse,
  ErgastSeason,
  ErgastStandingsList,
} from '../ingest/ergast-types.js';

const PAGE_LIMIT = 100; // Ergast hard max
const MIN_INTERVAL_MS = 300; // polite spacing between successive requests
const MAX_RETRIES = 5;
const USER_AGENT = 'F1Pulse/0.1 (server-side ingestion)';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Serial request queue (concurrency 1) ─────────────────────────────────────
let chain: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const wait = MIN_INTERVAL_MS - (Date.now() - lastRequestAt);
    if (wait > 0) await sleep(wait);
    try {
      return await task();
    } finally {
      lastRequestAt = Date.now();
    }
  });
  // Keep the chain alive regardless of success/failure of this task.
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run as Promise<T>;
}

function buildUrl(path: string, params: Record<string, string | number>): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const url = new URL(`${env.jolpicaBaseUrl}/${clean}/`);
  url.searchParams.set('format', 'json');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/** Fetch a single MRData page, with rate limiting + retry/backoff. */
function fetchPage(path: string, params: Record<string, string | number>): Promise<ErgastMRData> {
  return enqueue(async () => {
    let attempt = 0;
    for (;;) {
      const response = await fetch(buildUrl(path, params), {
        headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      });

      if (response.ok) {
        const body = (await response.json()) as ErgastResponse;
        return body.MRData;
      }

      const retryable = response.status === 429 || response.status >= 500;
      if (retryable && attempt < MAX_RETRIES) {
        const retryAfter = Number(response.headers.get('retry-after'));
        const backoff =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : Math.min(30_000, 1000 * 2 ** attempt);
        attempt += 1;
        // eslint-disable-next-line no-console
        console.warn(
          `  ↻ Jolpica ${response.status} on ${path} — retry ${attempt}/${MAX_RETRIES} in ${backoff}ms`,
        );
        await sleep(backoff);
        continue;
      }

      throw new Error(
        `Jolpica request failed: ${response.status} ${response.statusText} (${path})`,
      );
    }
  });
}

/**
 * Generic paginator: repeatedly fetch pages and accumulate a leaf array until
 * `total` items have been collected.
 */
async function paginate<Item>(
  path: string,
  extract: (page: ErgastMRData) => Item[],
  params: Record<string, string | number> = {},
): Promise<Item[]> {
  const items: Item[] = [];
  let offset = 0;
  for (;;) {
    const page = await fetchPage(path, { ...params, limit: PAGE_LIMIT, offset });
    const batch = extract(page);
    items.push(...batch);
    const total = Number(page.total);
    offset += PAGE_LIMIT;
    if (!Number.isFinite(total) || offset >= total || batch.length === 0) break;
  }
  return items;
}

// ── Resource helpers ─────────────────────────────────────────────────────────

/** All seasons (years) Ergast knows about. */
export function fetchSeasons(): Promise<ErgastSeason[]> {
  return paginate('seasons', (page) => page.SeasonTable?.Seasons ?? []);
}

/** Full race schedule for a season (accepts the "current" alias). */
export function fetchSchedule(season: string): Promise<ErgastRace[]> {
  return paginate(`${season}/races`, (page) => page.RaceTable?.Races ?? []);
}

/**
 * Standings list for a season (optionally as of a specific round). Merges any
 * paginated overflow into the single StandingsList wrapper. Returns null when the
 * season/round has no standings yet.
 */
async function fetchStandingsList(path: string): Promise<ErgastStandingsList | null> {
  const first = await fetchPage(path, { limit: PAGE_LIMIT, offset: 0 });
  const list = first.StandingsTable?.StandingsLists?.[0];
  if (!list) return null;

  const total = Number(first.total);
  let offset = PAGE_LIMIT;
  while (Number.isFinite(total) && offset < total) {
    const page = await fetchPage(path, { limit: PAGE_LIMIT, offset });
    const more = page.StandingsTable?.StandingsLists?.[0];
    if (!more) break;
    if (more.DriverStandings?.length) {
      list.DriverStandings = [...(list.DriverStandings ?? []), ...more.DriverStandings];
    }
    if (more.ConstructorStandings?.length) {
      list.ConstructorStandings = [
        ...(list.ConstructorStandings ?? []),
        ...more.ConstructorStandings,
      ];
    }
    offset += PAGE_LIMIT;
  }
  return list;
}

export interface DriverStandingsSnapshot {
  season: string;
  round: string;
  standings: ErgastDriverStanding[];
}

export async function fetchDriverStandings(
  season: string,
  round?: string,
): Promise<DriverStandingsSnapshot | null> {
  const path = round ? `${season}/${round}/driverStandings` : `${season}/driverStandings`;
  const list = await fetchStandingsList(path);
  if (!list) return null;
  return { season: list.season, round: list.round, standings: list.DriverStandings ?? [] };
}

export interface ConstructorStandingsSnapshot {
  season: string;
  round: string;
  standings: ErgastConstructorStanding[];
}

export async function fetchConstructorStandings(
  season: string,
  round?: string,
): Promise<ConstructorStandingsSnapshot | null> {
  const path = round ? `${season}/${round}/constructorStandings` : `${season}/constructorStandings`;
  const list = await fetchStandingsList(path);
  if (!list) return null;
  return { season: list.season, round: list.round, standings: list.ConstructorStandings ?? [] };
}

/**
 * Bulk-fetch EVERY race's results for a whole season in ~ceil(total/100) calls
 * (one call per round would be ~20x more — and Jolpica latency is ~2s/call). A
 * single race's results can straddle a 100-row page boundary, so we merge by round.
 */
export async function fetchSeasonResults(season: string): Promise<ErgastRace[]> {
  const byRound = new Map<number, ErgastRace>();
  let offset = 0;
  for (;;) {
    const page = await fetchPage(`${season}/results`, { limit: PAGE_LIMIT, offset });
    const races = page.RaceTable?.Races ?? [];
    for (const race of races) {
      const round = Number(race.round);
      const existing = byRound.get(round);
      if (existing) {
        existing.Results = [...(existing.Results ?? []), ...(race.Results ?? [])];
      } else {
        byRound.set(round, race);
      }
    }
    const total = Number(page.total);
    offset += PAGE_LIMIT;
    if (!Number.isFinite(total) || offset >= total || races.length === 0) break;
  }
  return [...byRound.values()].sort((a, b) => Number(a.round) - Number(b.round));
}

/** Bulk-fetch every race's qualifying for a whole season (merged by round). */
export async function fetchSeasonQualifying(season: string): Promise<ErgastRace[]> {
  const byRound = new Map<number, ErgastRace>();
  let offset = 0;
  for (;;) {
    const page = await fetchPage(`${season}/qualifying`, { limit: PAGE_LIMIT, offset });
    const races = page.RaceTable?.Races ?? [];
    for (const race of races) {
      const round = Number(race.round);
      const existing = byRound.get(round);
      if (existing) {
        existing.QualifyingResults = [
          ...(existing.QualifyingResults ?? []),
          ...(race.QualifyingResults ?? []),
        ];
      } else {
        byRound.set(round, race);
      }
    }
    const total = Number(page.total);
    offset += PAGE_LIMIT;
    if (!Number.isFinite(total) || offset >= total || races.length === 0) break;
  }
  return [...byRound.values()].sort((a, b) => Number(a.round) - Number(b.round));
}
