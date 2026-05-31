'use client';

/**
 * / — Homepage: one authored cinematic scene.
 *
 * Choreographed top to bottom:
 *   1. StartLightsLoader — F1 start-light sequence while initial data loads.
 *   2. Hero             — title + season + next-race countdown + leader.
 *   3. DriversChampionship
 *   4. ConstructorsChampionship
 *   5. SeasonCalendar
 *
 * All data flows from our own API via React Query (lib/api). Zero hardcoded
 * race data — every value on screen is fetched, and every section degrades to
 * an honest empty/error state if a feed is unreachable.
 *
 * Loader gate: the loader holds until the hero-critical queries SETTLE
 * (success or error) AND ≥2.5s has elapsed — "until data resolves or 2.5s,
 * whichever is longer." An 8s ceiling guarantees a hung request never traps
 * the user; the hero then shows its own empty states.
 *
 * Adaptive state: useSyncLiveStatus mirrors /api/live/status into Zustand;
 * useTempo derives 'live' | 'normal' | 'calm' and every section reads it
 * (data-tempo + class hooks) for the art director to diverge visually.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  useSeasonCurrent,
  useDriverStandings,
  useConstructorStandings,
  useSchedule,
} from '@/lib/api';
import { AtmosphereLayer } from '@/components/r3f/AtmosphereLayer';
import {
  StartLightsLoader,
  Hero,
  DriversChampionship,
  ConstructorsChampionship,
  SeasonCalendar,
  useSyncLiveStatus,
  useTempo,
} from '@/components/home';

const MIN_LOADER_MS = 2_500; // floor: lights get their full sequence
const MAX_LOADER_MS = 8_000; // ceiling: never trap the user on a hung feed

export default function HomePage() {
  // ── Adaptive live status → Zustand → tempo ────────────────────────────────
  useSyncLiveStatus();
  const tempo = useTempo();

  // ── Data (all client-side via React Query) ────────────────────────────────
  const season = useSeasonCurrent();
  const drivers = useDriverStandings('current');
  const constructors = useConstructorStandings('current');
  const schedule = useSchedule('current');

  // ── Loader gate ───────────────────────────────────────────────────────────
  // Hero-critical = season + driver standings. A query is "settled" once it has
  // either data or an error — we don't wait forever on a dead backend.
  const heroSettled =
    (season.isSuccess || season.isError) && (drivers.isSuccess || drivers.isError);

  const [minElapsed, setMinElapsed] = useState(false);
  const [maxElapsed, setMaxElapsed] = useState(false);

  useEffect(() => {
    const min = window.setTimeout(() => setMinElapsed(true), MIN_LOADER_MS);
    const max = window.setTimeout(() => setMaxElapsed(true), MAX_LOADER_MS);
    return () => {
      window.clearTimeout(min);
      window.clearTimeout(max);
    };
  }, []);

  const ready = minElapsed && (heroSettled || maxElapsed);

  // ── Loader → hero handoff ─────────────────────────────────────────────────
  const [revealed, setRevealed] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);

  const handleRevealStart = useCallback(() => setRevealed(true), []);
  const handleComplete = useCallback(() => setLoaderGone(true), []);

  return (
    <>
      {/*
       * R3F atmospheric backdrop — behind everything, scroll-reactive, and a
       * no-op when WebGL is unavailable. Fixed so it persists across the scroll.
       */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <AtmosphereLayer />
      </div>

      <main className="relative">
        <Hero season={season} drivers={drivers} revealed={revealed} tempo={tempo} />
        <DriversChampionship query={drivers} tempo={tempo} />
        <ConstructorsChampionship query={constructors} tempo={tempo} />
        <SeasonCalendar query={schedule} tempo={tempo} />
      </main>

      {!loaderGone && (
        <StartLightsLoader
          ready={ready}
          onRevealStart={handleRevealStart}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}
