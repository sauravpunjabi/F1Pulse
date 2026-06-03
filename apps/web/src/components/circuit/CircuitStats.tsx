'use client';

/**
 * <CircuitStats> — aggregate numbers for this circuit.
 *
 * Numbers animate in via CountUp on scroll intersection.
 * All values computed server-side from the DB — zero hardcoding.
 */

import { CountUp } from '@/components/primitives';
import { SectionReveal } from '@/components/primitives';
import type { CircuitProfileDto } from '@/lib/api';

interface CircuitStatsProps {
  profile: CircuitProfileDto;
}

export function CircuitStats({ profile }: CircuitStatsProps) {
  return (
    <section className="circuit-stats px-6 py-16 md:px-16">
      <p className="mb-10 font-mono text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
        Circuit Stats
      </p>

      <SectionReveal
        staggerDelay={0.08}
        preset="measured"
        className="grid grid-cols-2 gap-8 md:grid-cols-4"
      >
        {/* Total races */}
        <div className="circuit-stat">
          <p
            className="font-display font-black tabular-nums leading-none text-off-white"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            <CountUp to={profile.totalRaces} duration={2.0} />
          </p>
          <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/35">
            Races Held
          </p>
        </div>

        {/* First race year */}
        <div className="circuit-stat">
          <p
            className="font-display font-black tabular-nums leading-none text-off-white"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            {profile.firstRaceYear > 0 ? (
              <CountUp to={profile.firstRaceYear} from={1950} duration={2.2} />
            ) : (
              '—'
            )}
          </p>
          <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/35">
            First Race
          </p>
        </div>

        {/* Most wins — driver name + count */}
        {profile.mostWins ? (
          <>
            <div className="circuit-stat">
              <p
                className="font-display font-black tabular-nums leading-none text-off-white"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
              >
                <CountUp to={profile.mostWins.wins} duration={2.0} />
              </p>
              <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/35">
                Record Wins
              </p>
            </div>

            <div className="circuit-stat">
              <p
                className="font-display font-black uppercase leading-none text-off-white"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 3rem)' }}
              >
                {profile.mostWins.familyName}
              </p>
              <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/35">
                Most Wins
              </p>
            </div>
          </>
        ) : (
          <div className="circuit-stat col-span-2">
            <p className="font-mono text-sm text-white/25">No winner data</p>
          </div>
        )}
      </SectionReveal>
    </section>
  );
}
