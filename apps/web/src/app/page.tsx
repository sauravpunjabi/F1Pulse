'use client';

/**
 * / — Homepage: cinematic editorial experience.
 *
 * Choreographed top to bottom:
 *   1. StartLightsLoader — F1 start-light sequence while initial data loads.
 *   2. Hero             — elegant, minimal fullscreen title scene.
 *   3. CurrentEra       — live timing, standings, next race schedules in a magazine grid.
 *   4. SpeedSequence    — fast-paced telemetry parallax divider.
 *   5. HistoryTransition— shifts mood from modern off-white to vintage dark serif.
 *   6. EraTimeline      — signature pinned horizontal scroll decadal history (1950 → 2026).
 *
 * All data flows from our own API via React Query (lib/api). Zero hardcoded
 * race data — every value on screen is fetched.
 *
 * Loader gate: the loader holds until the hero-critical queries SETTLE
 * (success or error) AND ≥2.5s has elapsed — "until data resolves or 2.5s,
 * whichever is longer."
 *
 * Adaptive state: useSyncLiveStatus mirrors /api/live/status into Zustand;
 * useTempo derives 'live' | 'normal' | 'calm' and every section reads it
 * (data-tempo + class hooks) for the art director to diverge visually.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  useSeasonCurrent,
  useDriverStandings,
} from '@/lib/api';
import {
  StartLightsLoader,
  Hero,
  CurrentEra,
  SpeedSequence,
  HistoryTransition,
  EraTimeline,
  useSyncLiveStatus,
  useTempo,
} from '@/components/home';

const MAX_LOADER_MS = 8_000; // ceiling: never trap the user on a short feed

export default function HomePage() {
  // ── Adaptive live status → Zustand → tempo ────────────────────────────────
  useSyncLiveStatus();
  const tempo = useTempo();

  // ── Data (all client-side via React Query) ────────────────────────────────
  const season = useSeasonCurrent();
  const drivers = useDriverStandings('current');

  // ── Loader gate ───────────────────────────────────────────────────────────
  // Hero-critical = season + driver standings. A query is "settled" once it has
  // either data or an error — we don't wait forever on a dead backend.
  const heroSettled =
    (season.isSuccess || season.isError) && (drivers.isSuccess || drivers.isError);

  const [minLoaderMs, setMinLoaderMs] = useState(2500);
  const [minElapsed, setMinElapsed] = useState(false);
  const [maxElapsed, setMaxElapsed] = useState(false);

  useEffect(() => {
    try {
      const visited = localStorage.getItem('f1pulse-visited');
      if (visited) {
        setMinLoaderMs(1200);
      } else {
        localStorage.setItem('f1pulse-visited', 'true');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const min = window.setTimeout(() => setMinElapsed(true), minLoaderMs);
    const max = window.setTimeout(() => setMaxElapsed(true), MAX_LOADER_MS);
    return () => {
      window.clearTimeout(min);
      window.clearTimeout(max);
    };
  }, [minLoaderMs]);

  const ready = minElapsed && (heroSettled || maxElapsed);

  // ── Loader → hero handoff ─────────────────────────────────────────────────
  const [revealed, setRevealed] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);

  const handleRevealStart = useCallback(() => setRevealed(true), []);
  const handleComplete = useCallback(() => setLoaderGone(true), []);

  return (
    <>
      <main className="relative">
        <Hero season={season} drivers={drivers} revealed={revealed} tempo={tempo} />
        {revealed && (
          <>
            <CurrentEra />
            <SpeedSequence />
            <HistoryTransition />
            <EraTimeline />
          </>
        )}
      </main>

      {!loaderGone && (
        <StartLightsLoader
          ready={ready}
          onRevealStart={handleRevealStart}
          onComplete={handleComplete}
          nextRace={season.data?.nextRace}
        />
      )}
    </>
  );
}
