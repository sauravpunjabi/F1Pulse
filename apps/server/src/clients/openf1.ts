/**
 * Server-only OpenF1 client — race-weekend telemetry and session data.
 *
 * Wraps every outbound fetch in a circuit breaker:
 *   3 consecutive failures → circuit opens for 30 s (degraded mode).
 *   After 30 s the next call is tried (half-open); success resets the counter.
 *
 * All methods return `null` on any error — callers must handle absence gracefully.
 * Never throws; never lets OpenF1 errors propagate to other routes.
 */
import { env } from '../config/env.js';

/* eslint-disable no-console */

// ── Circuit-breaker state ─────────────────────────────────────────────────────

const FAILURE_THRESHOLD = 3;
const RECOVERY_MS = 30_000; // 30 s
const REQUEST_TIMEOUT_MS = 5_000;

let failCount = 0;
let openUntil = 0; // epoch ms; circuit closes when Date.now() > openUntil

export function isOpenF1Available(): boolean {
  return Date.now() >= openUntil;
}

function recordFailure(): void {
  failCount += 1;
  if (failCount >= FAILURE_THRESHOLD) {
    openUntil = Date.now() + RECOVERY_MS;
    failCount = 0;
    console.warn('[openf1] circuit breaker OPEN — pausing for 30 s');
  }
}

function recordSuccess(): void {
  if (failCount > 0) {
    console.log('[openf1] circuit breaker CLOSED');
  }
  failCount = 0;
  openUntil = 0;
}

// ── Typed response shapes (from real API inspection) ─────────────────────────

export interface OpenF1Session {
  session_key: number;
  session_name: string; // "Practice 1" | "Qualifying" | "Sprint" | "Race" …
  session_type: string; // "Practice" | "Qualifying" | "Sprint" | "Race"
  date_start: string; // ISO datetime UTC
  date_end: string; // ISO datetime UTC
  meeting_key: number;
  location: string;
  country_name: string;
  circuit_short_name: string;
  year: number;
}

export interface OpenF1Position {
  driver_number: number;
  position: number;
  date: string;
  session_key: number;
}

export interface OpenF1Interval {
  driver_number: number;
  gap_to_leader: number | null;
  interval: number | null;
  date: string;
  session_key: number;
}

export interface OpenF1Lap {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  date_start: string;
  session_key: number;
}

export interface OpenF1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string | null;
  session_key: number;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T | null> {
  if (!isOpenF1Available()) return null;

  const url = `${env.openf1BaseUrl}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as T;
    recordSuccess();
    return data;
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[openf1] request failed (${url}): ${msg}`);
    recordFailure();
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the latest session (or null if unavailable / circuit open).
 * `session_key=latest` is OpenF1's sentinel for "most recent session".
 */
export async function fetchLatestSession(): Promise<OpenF1Session | null> {
  const sessions = await get<OpenF1Session[]>('/sessions?session_key=latest');
  return sessions?.[0] ?? null;
}

/**
 * Latest position snapshot for all drivers in a session.
 * OpenF1 returns one row per driver-position-change; we grab the very last
 * timestamp's worth by sorting client-side on `date` descending.
 */
export async function fetchLatestPositions(
  sessionKey: number,
): Promise<OpenF1Position[] | null> {
  const data = await get<OpenF1Position[]>(
    `/position?session_key=${sessionKey}&order=-date`,
  );
  if (!data) return null;

  // Keep only the most recent position entry per driver.
  const byDriver = new Map<number, OpenF1Position>();
  for (const row of data) {
    const existing = byDriver.get(row.driver_number);
    if (!existing || row.date > existing.date) {
      byDriver.set(row.driver_number, row);
    }
  }
  return [...byDriver.values()].sort((a, b) => a.position - b.position);
}

/**
 * Latest interval (gap) snapshot for each driver.
 */
export async function fetchLatestIntervals(
  sessionKey: number,
): Promise<OpenF1Interval[] | null> {
  const data = await get<OpenF1Interval[]>(
    `/intervals?session_key=${sessionKey}&order=-date`,
  );
  if (!data) return null;

  const byDriver = new Map<number, OpenF1Interval>();
  for (const row of data) {
    const existing = byDriver.get(row.driver_number);
    if (!existing || row.date > existing.date) {
      byDriver.set(row.driver_number, row);
    }
  }
  return [...byDriver.values()];
}

/**
 * Drivers registered for a session.
 */
export async function fetchDrivers(
  sessionKey: number,
): Promise<OpenF1Driver[] | null> {
  return get<OpenF1Driver[]>(`/drivers?session_key=${sessionKey}`);
}
