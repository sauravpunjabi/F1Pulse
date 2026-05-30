/**
 * Shared types for the live session layer.
 *
 * WeekendStatus is the canonical state machine for a race weekend:
 *
 *   off-season   — no race weekend within the next/past ~5 days
 *   race-week    — weekend window is open but no active session (schedule-only fallback)
 *   practice     — FP1 / FP2 / FP3 is running (from OpenF1)
 *   qualifying   — qualifying or sprint qualifying is running (from OpenF1)
 *   sprint       — sprint race is running (from OpenF1)
 *   race-live    — grand prix is currently running (from OpenF1)
 *   post-race    — race weekend is over (race.date has passed)
 *
 * When OpenF1 is unavailable, status falls back to one of: off-season | race-week | post-race.
 */

export type WeekendStatus =
  | 'off-season'
  | 'race-week'
  | 'practice'
  | 'qualifying'
  | 'sprint'
  | 'race-live'
  | 'post-race';

/** The active OpenF1 session (when live). */
export interface LiveSessionInfo {
  key: number;
  name: string; // "Race", "Qualifying", "Practice 1" …
  type: string; // OpenF1 session_type: "Race" | "Practice" | "Qualifying" | "Sprint"
  startedAt: string; // ISO datetime
  endsAt: string; // ISO datetime
}

/** DTO returned by GET /api/live/status */
export interface LiveStatusDto {
  status: WeekendStatus;
  openf1Available: boolean;
  weekend: {
    round: number;
    name: string;
    circuitName: string;
  } | null;
  session: LiveSessionInfo | null;
  cachedAt: string; // ISO datetime of when this snapshot was computed
}

/** WebSocket message types broadcast to subscribers. */
export type LiveMessage =
  | { type: 'status'; data: LiveStatusDto }
  | {
      type: 'positions';
      data: {
        sessionKey: number;
        timestamp: string;
        positions: PositionEntry[];
      };
    }
  | { type: 'ping' };

export interface PositionEntry {
  driverNumber: number;
  position: number;
  gap: number | null; // seconds to leader (null for leader or no data yet)
  interval: number | null; // seconds to the car ahead
}
