// @no-external-fetch
// ─────────────────────────────────────────────────────────────────────────────
// F1Pulse API client — talks ONLY to our own backend (/api/*).
// This file MUST NEVER import from or call Jolpica, OpenF1, or any third party.
// All external data flows: third-party → server ingest → Postgres → Redis →
// F1Pulse API → this file → components.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useQuery,
  type UseQueryResult,
  type QueryClient,
} from '@tanstack/react-query';

// ── Base URL (server-side and client-side safe) ───────────────────────────────

function apiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error('NEXT_PUBLIC_API_URL is not set');
  return url;
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    headers: { Accept: 'application/json' },
    // Next.js fetch cache: revalidate every 60s for current-season data.
    // Historical endpoints benefit from a longer TTL — override per call below.
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`F1Pulse API error ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── DTO types (mirrors apps/server/src/api/dtos.ts) ──────────────────────────
// Keep in sync with the server. If the server DTO changes, update here too.
// TODO: Extract to a shared package (packages/types) when the monorepo grows.

export interface CircuitDto {
  id: string;
  name: string;
  locality: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
}

export interface DriverRef {
  id: string;
  givenName: string;
  familyName: string;
  code: string | null;
  nationality: string | null;
}

export interface ConstructorRef {
  id: string;
  name: string;
  nationality: string | null;
}

export interface SessionSchedule {
  fp1: string | null;
  fp2: string | null;
  fp3: string | null;
  qualifying: string | null;
  sprintQualifying: string | null;
  sprint: string | null;
}

export interface RaceScheduleDto {
  round: number;
  name: string;
  date: string;
  isSprintWeekend: boolean;
  circuit: CircuitDto;
  sessions: SessionSchedule;
}

export interface SeasonCurrentDto {
  year: number;
  nextRace: RaceScheduleDto | null;
  leader: {
    driver: DriverRef;
    constructors: ConstructorRef[];
    points: number;
    wins: number;
    round: number;
  } | null;
}

export interface DriverStandingDto {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  round: number;
  driver: DriverRef;
  constructors: ConstructorRef[];
}

export interface StandingsDto {
  season: number;
  round: number;
  standings: DriverStandingDto[];
}

export interface ConstructorStandingDto {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  round: number;
  constructor: ConstructorRef;
}

export interface ConstructorStandingsDto {
  season: number;
  round: number;
  standings: ConstructorStandingDto[];
}

export interface RaceResultDto {
  position: number;
  positionText: string;
  points: number;
  grid: number;
  laps: number;
  status: string;
  timeMillis: number | null;
  timeText: string | null;
  fastestLap: { rank: number; lap: number; time: string } | null;
  driver: DriverRef;
  constructor: ConstructorRef;
}

export interface QualifyingResultDto {
  position: number;
  driver: DriverRef;
  constructor: ConstructorRef;
  q1: string | null;
  q2: string | null;
  q3: string | null;
}

export interface RoundResultsDto {
  season: number;
  round: number;
  raceName: string;
  date: string;
  circuit: CircuitDto;
  results: RaceResultDto[];
  qualifying: QualifyingResultDto[];
}

export interface SeasonChampionDto {
  season: number;
  driver: DriverRef;
  constructors: ConstructorRef[];
  points: number;
  wins: number;
}

/** GET /api/history/champions returns an array of SeasonChampionDto */
export type HistoryChampionsDto = SeasonChampionDto[];

/** Live status — mirrors apps/server/src/live/types.ts */
export type WeekendStatus =
  | 'off-season'
  | 'race-week'
  | 'practice'
  | 'qualifying'
  | 'sprint'
  | 'race-live'
  | 'post-race';

export interface LiveSessionInfo {
  key: number;
  name: string;
  type: string;
  startedAt: string;
  endsAt: string;
}

export interface LiveStatusDto {
  status: WeekendStatus;
  openf1Available: boolean;
  weekend: {
    round: number;
    name: string;
    circuitName: string;
  } | null;
  session: LiveSessionInfo | null;
  cachedAt: string;
}

// ── Fetch functions (used by React Query and by RSCs) ─────────────────────────

export const fetchSeasonCurrent = () =>
  apiFetch<SeasonCurrentDto>('/api/season/current');

export const fetchDriverStandings = (season: 'current' | number = 'current') =>
  apiFetch<StandingsDto>(`/api/standings/drivers?season=${season}`);

export const fetchConstructorStandings = (season: 'current' | number = 'current') =>
  apiFetch<ConstructorStandingsDto>(`/api/standings/constructors?season=${season}`);

export const fetchSchedule = (season: 'current' | number = 'current') =>
  apiFetch<RaceScheduleDto[]>(`/api/schedule?season=${season}`);

export const fetchHistoryChampions = () =>
  apiFetch<HistoryChampionsDto>('/api/history/champions');

export const fetchLiveStatus = () =>
  apiFetch<LiveStatusDto>('/api/live/status');

// ── React Query keys ──────────────────────────────────────────────────────────

export const queryKeys = {
  seasonCurrent:          ['season', 'current'] as const,
  driverStandings:        (s: 'current' | number) => ['standings', 'drivers', s] as const,
  constructorStandings:   (s: 'current' | number) => ['standings', 'constructors', s] as const,
  schedule:               (s: 'current' | number) => ['schedule', s] as const,
  historyChampions:       ['history', 'champions'] as const,
  liveStatus:             ['live', 'status'] as const,
} as const;

// ── React Query hooks ─────────────────────────────────────────────────────────

export function useSeasonCurrent(): UseQueryResult<SeasonCurrentDto> {
  return useQuery({
    queryKey: queryKeys.seasonCurrent,
    queryFn:  fetchSeasonCurrent,
    staleTime: 5 * 60 * 1000, // 5 min — mirrors server short TTL
  });
}

export function useDriverStandings(
  season: 'current' | number = 'current',
): UseQueryResult<StandingsDto> {
  return useQuery({
    queryKey: queryKeys.driverStandings(season),
    queryFn:  () => fetchDriverStandings(season),
    staleTime: season === 'current' ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });
}

export function useConstructorStandings(
  season: 'current' | number = 'current',
): UseQueryResult<ConstructorStandingsDto> {
  return useQuery({
    queryKey: queryKeys.constructorStandings(season),
    queryFn:  () => fetchConstructorStandings(season),
    staleTime: season === 'current' ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });
}

export function useSchedule(
  season: 'current' | number = 'current',
): UseQueryResult<RaceScheduleDto[]> {
  return useQuery({
    queryKey: queryKeys.schedule(season),
    queryFn:  () => fetchSchedule(season),
    staleTime: season === 'current' ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });
}

export function useHistoryChampions(): UseQueryResult<HistoryChampionsDto> {
  return useQuery({
    queryKey: queryKeys.historyChampions,
    queryFn:  fetchHistoryChampions,
    staleTime: 24 * 60 * 60 * 1000, // 24h — history never changes
  });
}

export function useLiveStatus(): UseQueryResult<LiveStatusDto> {
  return useQuery({
    queryKey: queryKeys.liveStatus,
    queryFn:  fetchLiveStatus,
    staleTime: 60 * 1000,            // 60s — mirrors server cache TTL
    refetchInterval: 60 * 1000,      // poll every 60s to catch session state changes
  });
}

// ── Server-side prefetch helper (for RSC / layout prefetching) ────────────────

export async function prefetchSeasonCurrent(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.seasonCurrent,
    queryFn:  fetchSeasonCurrent,
  });
}
