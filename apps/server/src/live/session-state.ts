/**
 * Two-source weekend-status derivation.
 *
 * Source 1 (always available): Postgres schedule — tells us if there is a race
 *   weekend within the current ±5 day window and whether the race has already run.
 *
 * Source 2 (best-effort): OpenF1 — tells us if a session is CURRENTLY active and
 *   which type it is.  When OpenF1's circuit breaker is open, we fall back to the
 *   schedule-only result (race-week | post-race | off-season).
 *
 * Granularity contract (as spec'd in CLAUDE.md):
 *   OpenF1 available  → full 7-state WeekendStatus
 *   OpenF1 unavailable → off-season | race-week | post-race  only
 */
import { prisma } from '../lib/prisma.js';
import { fetchLatestSession, isOpenF1Available } from '../clients/openf1.js';
import type { WeekendStatus, LiveStatusDto, LiveSessionInfo } from './types.js';

// A race weekend window spans from 5 days before race day to 6 hours after.
const WEEKEND_LOOKBACK_MS = 5 * 24 * 60 * 60 * 1000; // 5 days before race
const WEEKEND_LOOKAHEAD_MS = 6 * 24 * 60 * 60 * 1000; // 6 days after today to find upcoming race
const POST_RACE_GRACE_MS = 6 * 60 * 60 * 1000; // race counts as "post-race" for 6 h after

// ── OpenF1 session_type → WeekendStatus ─────────────────────────────────────

function mapSessionType(type: string, name: string): WeekendStatus {
  const t = type.toLowerCase();
  const n = name.toLowerCase();
  if (t === 'race') return 'race-live';
  if (t === 'sprint') return 'sprint';
  if (t === 'qualifying' || n.includes('qualifying')) return 'qualifying';
  if (t === 'practice') return 'practice';
  return 'race-week'; // unknown session type — stay conservative
}

// ── Schedule-based fallback ──────────────────────────────────────────────────

interface ScheduleWeekend {
  round: number;
  name: string;
  circuitName: string;
  raceDate: Date;
}

async function findCurrentWeekend(): Promise<ScheduleWeekend | null> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - WEEKEND_LOOKBACK_MS);
  const windowEnd = new Date(now.getTime() + WEEKEND_LOOKAHEAD_MS);

  const race = await prisma.race.findFirst({
    where: {
      date: { gte: windowStart, lte: windowEnd },
      seasonYear: now.getUTCFullYear(),
    },
    orderBy: { date: 'asc' },
    include: { circuit: true },
  });

  if (!race) return null;
  return {
    round: race.round,
    name: race.name,
    circuitName: race.circuit.name,
    raceDate: race.date,
  };
}

function scheduleOnlyStatus(weekend: ScheduleWeekend | null): WeekendStatus {
  if (!weekend) return 'off-season';
  const now = Date.now();
  const raceMs = weekend.raceDate.getTime();
  if (now > raceMs + POST_RACE_GRACE_MS) return 'post-race';
  return 'race-week';
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Derives the current weekend status from Postgres schedule + OpenF1 (if available).
 * Never throws — always returns a valid LiveStatusDto.
 */
export async function deriveWeekendStatus(): Promise<LiveStatusDto> {
  const now = new Date();

  // Source 1: always query schedule.
  const weekend = await findCurrentWeekend();
  const weekendPayload = weekend
    ? { round: weekend.round, name: weekend.name, circuitName: weekend.circuitName }
    : null;

  // Source 2: attempt OpenF1 (may be null if circuit is open).
  const openf1Available = isOpenF1Available();
  let session: LiveSessionInfo | null = null;
  let status: WeekendStatus = scheduleOnlyStatus(weekend);

  if (openf1Available) {
    const latestSession = await fetchLatestSession();

    if (latestSession) {
      const sessionStart = new Date(latestSession.date_start);
      const sessionEnd = new Date(latestSession.date_end);
      const isActive = now >= sessionStart && now <= sessionEnd;

      if (isActive) {
        status = mapSessionType(latestSession.session_type, latestSession.session_name);
        session = {
          key: latestSession.session_key,
          name: latestSession.session_name,
          type: latestSession.session_type,
          startedAt: latestSession.date_start,
          endsAt: latestSession.date_end,
        };
      }
      // If session exists but is not active now, keep the schedule-based status.
    }
    // If fetchLatestSession returned null (still a request error), circuit breaker
    // has already been updated. isOpenF1Available() reflects the real state.
  }

  return {
    status,
    openf1Available: isOpenF1Available(), // re-check after the request
    weekend: weekendPayload,
    session,
    cachedAt: now.toISOString(),
  };
}

/** Returns true for states where live polling is meaningful. */
export function isLiveSession(status: WeekendStatus): boolean {
  return (
    status === 'race-live' ||
    status === 'practice' ||
    status === 'qualifying' ||
    status === 'sprint'
  );
}
