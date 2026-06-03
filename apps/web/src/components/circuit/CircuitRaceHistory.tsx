'use client';

/**
 * <CircuitRaceHistory> — last 10 races at this circuit.
 *
 * Each row: year (mono), race winner name (display), constructor (mono).
 * SectionReveal stagger for choreographed entrance.
 */

import Link from 'next/link';
import { SectionReveal } from '@/components/primitives';
import type { CircuitRaceDto } from '@/lib/api';

interface CircuitRaceHistoryProps {
  races: CircuitRaceDto[];
}

export function CircuitRaceHistory({ races }: CircuitRaceHistoryProps) {
  if (races.length === 0) return null;

  return (
    <section className="circuit-race-history px-6 py-16 md:px-16">
      <p className="mb-8 font-mono text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
        Race History
      </p>

      <SectionReveal
        staggerDelay={0.055}
        preset="measured"
        className="mx-auto max-w-3xl"
      >
        {races.map((race) => {
          const hasWinner = race.winnerDriverId !== '';
          return (
            <div
              key={`${race.season}-${race.round}`}
              className="circuit-race-row grid min-h-[56px] grid-cols-[4rem_1fr_auto] items-center gap-4 border-b py-4"
              style={{ borderBottomColor: '#1a1a1d' }}
            >
              {/* Year */}
              <span className="font-mono text-sm tabular-nums text-white/35">
                {race.season}
              </span>

              {/* Winner */}
              <div className="min-w-0">
                {hasWinner ? (
                  <Link
                    href={`/driver/${race.winnerDriverId}`}
                    className="group truncate font-display font-black uppercase text-off-white transition-opacity hover:opacity-70"
                    style={{ fontSize: 'clamp(14px, 1.6vw, 20px)' }}
                  >
                    {race.winnerGivenName} {race.winnerFamilyName}
                  </Link>
                ) : (
                  <span
                    className="truncate font-display font-black uppercase text-white/30"
                    style={{ fontSize: 'clamp(14px, 1.6vw, 20px)' }}
                  >
                    No result recorded
                  </span>
                )}
                <p className="mt-0.5 truncate font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/30">
                  {race.raceName}
                </p>
              </div>

              {/* Constructor */}
              {hasWinner && (
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-white/35 text-right">
                  {race.constructorName}
                </span>
              )}
            </div>
          );
        })}
      </SectionReveal>
    </section>
  );
}
