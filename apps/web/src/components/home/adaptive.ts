'use client';

/**
 * Adaptive-state glue for the homepage.
 *
 * The brief: "read live status from Zustand store (populated from
 * /api/live/status). If race-live: accent faster, ticker more prominent. If
 * off-season: calmer pacing."
 *
 * Flow:
 *   useLiveStatus()  (React Query, 60s poll)  →  useSyncLiveStatus()  →  store
 *   store.liveStatus  →  useTempo()  →  sections read `tempo` for pacing
 *
 * `tempo` is the single derived knob the sections branch on. The actual visual
 * differences are left to the art director — sections expose `data-tempo` and
 * class hooks; this module only computes the value.
 */

import { useEffect } from 'react';
import { useLiveStatus, type WeekendStatus } from '@/lib/api';
import { useUIStore, selectLiveStatus } from '@/store/ui';

export type Tempo = 'live' | 'normal' | 'calm';

/**
 * Maps the seven weekend states down to three pacing tiers.
 *   race-live    → 'live'   (fastest accent, ticker prominent)
 *   off-season   → 'calm'   (slow, restrained)
 *   everything else (race-week / practice / qualifying / sprint / post-race)
 *                → 'normal'
 */
export function tempoFromStatus(status: WeekendStatus | undefined): Tempo {
  if (status === 'race-live') return 'live';
  if (status === 'off-season') return 'calm';
  return 'normal';
}

/**
 * Calls the live-status query once and mirrors each fresh snapshot into the
 * Zustand store so the whole tree reads a single source of truth. Call this
 * exactly once, near the top of the page.
 */
export function useSyncLiveStatus(): void {
  const { data } = useLiveStatus();
  const setLiveStatus = useUIStore((s) => s.setLiveStatus);

  useEffect(() => {
    if (data) setLiveStatus(data);
  }, [data, setLiveStatus]);
}

/**
 * Reads the current adaptive tempo from the store (populated by
 * useSyncLiveStatus). Defaults to 'normal' until the first live snapshot lands.
 */
export function useTempo(): Tempo {
  const live = useUIStore(selectLiveStatus);
  return tempoFromStatus(live?.status);
}
