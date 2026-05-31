'use client';

/**
 * / — Home page (Day 8 gate)
 *
 * Renders the atmosphere layer (inherited from layout) and makes one live call
 * to /api/season/current. Shows the season year and next race name from real
 * API data. No hardcoded values.
 *
 * This is intentionally sparse — the cinematic hero, navigation, and all
 * visual design land in subsequent days. The gate is:
 *   ✓ Atmosphere visible (grain + vignette from layout)
 *   ✓ Real data on screen (year + next race from Postgres)
 *   ✗ No hardcoded race data anywhere
 */

import { useSeasonCurrent } from '@/lib/api';

export default function HomePage() {
  const { data, isLoading, isError } = useSeasonCurrent();

  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center"
      // TODO: Art director — replace this placeholder layout with the cinematic
      // hero design. This file exists only to prove the data pipeline works.
    >
      {/* Wordmark / logotype placeholder */}
      {/* TODO: Replace with SVG logotype once the identity is locked */}
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-silver">
        Est. 1950 — Live 2026
      </p>

      <h1
        className="font-display text-7xl font-semibold tracking-tight text-off-white sm:text-9xl"
        // TODO: Typography — set font-display to the chosen display face in
        // globals.css --font-display and wire the optical size / weight here.
      >
        F1Pulse
      </h1>

      {/* Live data readout — the Day 8 gate */}
      <div className="flex flex-col items-center gap-3">
        {isLoading && (
          <p className="font-mono text-xs text-steel">
            {/* TODO: Replace with skeleton shimmer once design is defined */}
            Loading season data…
          </p>
        )}

        {isError && (
          <p className="font-mono text-xs text-red">
            {/* TODO: Design error state — retry button, degraded message */}
            API unavailable — check server
          </p>
        )}

        {data && (
          <>
            <p className="font-mono text-sm tabular-nums text-off-white/80">
              {/* Real season year from Postgres — never hardcoded */}
              Season{' '}
              <span className="text-off-white font-medium">{data.year}</span>
            </p>

            {data.nextRace ? (
              <div className="flex flex-col items-center gap-1">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-silver">
                  Next Race
                </p>
                <p className="font-sans text-base font-medium text-off-white">
                  {/* Real race name from Postgres — never hardcoded */}
                  {data.nextRace.name}
                </p>
                <p className="font-mono text-xs text-silver">
                  Round {data.nextRace.round} ·{' '}
                  {data.nextRace.circuit.locality ?? data.nextRace.circuit.name},{' '}
                  {data.nextRace.circuit.country}
                </p>
                <p className="font-mono text-[0.65rem] tabular-nums text-steel">
                  {new Date(data.nextRace.date).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ) : (
              <p className="font-mono text-xs text-silver">
                Season complete
              </p>
            )}

            {data.leader && (
              <div className="mt-2 flex flex-col items-center gap-1">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-silver">
                  Championship Leader
                </p>
                <p className="font-sans text-base font-medium text-off-white">
                  {data.leader.driver.givenName} {data.leader.driver.familyName}
                </p>
                <p className="font-mono text-xs text-silver">
                  {data.leader.points} pts · {data.leader.wins}{' '}
                  {data.leader.wins === 1 ? 'win' : 'wins'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Day marker — remove once real hero design lands */}
      <p className="absolute bottom-6 font-mono text-[0.6rem] uppercase tracking-[0.4em] text-steel">
        Foundation · Day 8 Gate
      </p>
    </main>
  );
}
