'use client';

/**
 * /drivers — current season driver listing page.
 *
 * Displays all drivers in the current standings as MaskReveal cards.
 * Each card links to /driver/[driverId].
 * Data: /api/standings/drivers?season=current
 *
 * TODO: Add grid-level entrance choreography (stagger rows via SectionReveal).
 * TODO: Add portrait thumbnails once photography is sourced.
 * TODO: Sort/filter controls (by team, by nationality) if needed.
 */

import Link from 'next/link';
import { useDriverStandings } from '@/lib/api';
import { MaskReveal, SectionReveal } from '@/components/primitives';

export default function DriversPage() {
  const standings = useDriverStandings('current');

  return (
    <main className="min-h-dvh bg-[--bg] px-6 py-24 text-[--text-primary] md:px-16">
      {/* Page heading */}
      <MaskReveal direction="bottom" preset="cinematic" trigger="mount">
        <h1 className="mb-2 font-display text-[clamp(2.5rem,8vw,7rem)] font-black uppercase leading-none tracking-tight">
          Drivers
        </h1>
      </MaskReveal>
      <MaskReveal direction="bottom" preset="measured" delay={0.2} trigger="mount">
        <p className="mb-16 font-mono text-xs uppercase tracking-[0.25em] text-white/40">
          {/* TODO: Replace with dynamic season year once wired from store. */}
          Current Season
        </p>
      </MaskReveal>

      {/* Loading */}
      {standings.isLoading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded border border-white/5 bg-white/[0.03]"
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {standings.isError && (
        <p className="font-mono text-sm text-white/40">
          Could not load standings. Check your API connection.
        </p>
      )}

      {/* Grid */}
      {standings.data && (
        <SectionReveal
          staggerDelay={0.04}
          preset="measured"
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {standings.data.standings.map((entry) => {
            const { driver, position, points, constructors } = entry;
            const team = constructors[0]?.name ?? '';

            return (
              <Link
                key={driver.id}
                href={`/driver/${driver.id}`}
                className="driver-card group relative flex flex-col justify-end overflow-hidden rounded border border-white/10 p-5 transition-colors hover:border-white/25 hover:bg-white/[0.03]"
                // TODO: add data-driver-accent={driver.id} once per-card colors are wired
                aria-label={`${driver.givenName} ${driver.familyName}, P${position}`}
              >
                {/*
                 * Portrait placeholder — art director replaces with imagery.
                 * TODO: <Image> once per-driver thumbnails exist.
                 */}
                <div
                  className="driver-portrait pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />

                {/* Position badge */}
                <span className="mb-auto self-start font-mono text-xs text-white/25">
                  P{position}
                </span>

                {/* Driver name */}
                <MaskReveal direction="bottom" preset="measured" once>
                  <div className="mt-8">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                      {driver.givenName}
                    </p>
                    <p className="font-display text-xl font-black uppercase leading-tight">
                      {driver.familyName}
                    </p>
                  </div>
                </MaskReveal>

                {/* Team + stats */}
                <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] text-white/30">
                  <span>{team}</span>
                  <span>{points} pts</span>
                </div>
              </Link>
            );
          })}
        </SectionReveal>
      )}
    </main>
  );
}
