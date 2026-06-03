'use client';

/**
 * Act 5 — Legacy.
 * Final career stats side by side with CountUp animations.
 * All values from API — zero hardcoded numbers.
 */

import { CountUp } from '@/components/primitives/CountUp';
import { MaskReveal } from '@/components/primitives/MaskReveal';
import type { DriverProfileDto } from '@/lib/api';

interface StatPairProps {
  label: string;
  valueA: number;
  valueB: number;
  nameA: string;
  nameB: string;
}

function StatPair({ label, valueA, valueB, nameA, nameB }: StatPairProps) {
  const aLeads = valueA > valueB;
  const bLeads = valueB > valueA;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 border-b border-white/6 pb-8 pt-6">
      {/* Value A */}
      <div className="flex flex-col items-start gap-1">
        <span
          className="font-display font-black tabular-nums leading-none"
          style={{
            fontSize: 'clamp(1.6rem, 4vw, 3.5rem)',
            color: aLeads ? '#E10600' : 'rgba(255,255,255,0.55)',
          }}
        >
          <CountUp to={valueA} duration={2.0} />
        </span>
        <span
          className="font-mono text-[0.42rem] uppercase tracking-widest text-white/25"
        >
          {nameA}
        </span>
      </div>

      {/* Label */}
      <div className="flex flex-col items-center justify-end pb-1">
        <span className="font-mono text-[0.44rem] uppercase tracking-[0.28em] text-white/20">
          {label}
        </span>
      </div>

      {/* Value B */}
      <div className="flex flex-col items-end gap-1">
        <span
          className="font-display font-black tabular-nums leading-none"
          style={{
            fontSize: 'clamp(1.6rem, 4vw, 3.5rem)',
            color: bLeads ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
          }}
        >
          <CountUp to={valueB} duration={2.0} />
        </span>
        <span className="font-mono text-[0.42rem] uppercase tracking-widest text-white/25">
          {nameB}
        </span>
      </div>
    </div>
  );
}

interface RivalryLegacyProps {
  profileA: DriverProfileDto;
  profileB: DriverProfileDto;
}

export function RivalryLegacy({ profileA, profileB }: RivalryLegacyProps) {
  const nameA = profileA.familyName;
  const nameB = profileB.familyName;

  const stats: { label: string; a: number; b: number }[] = [
    { label: 'Championships', a: profileA.stats.championships, b: profileB.stats.championships },
    { label: 'Race Wins',     a: profileA.stats.wins,          b: profileB.stats.wins },
    { label: 'Pole Positions', a: profileA.stats.poles,         b: profileB.stats.poles },
    { label: 'Podiums',       a: profileA.stats.podiums,       b: profileB.stats.podiums },
    { label: 'Seasons Raced', a: profileA.stats.seasonsRaced,  b: profileB.stats.seasonsRaced },
  ];

  return (
    <section
      className="px-6 pb-32 pt-20 md:px-16"
      aria-label="Career legacy comparison"
    >
      <MaskReveal direction="bottom" preset="measured">
        <p className="mb-12 font-mono text-[0.52rem] uppercase tracking-[0.35em] text-white/25">
          Legacy
        </p>
      </MaskReveal>

      <div className="max-w-2xl">
        {stats.map((s) => (
          <StatPair
            key={s.label}
            label={s.label}
            valueA={s.a}
            valueB={s.b}
            nameA={nameA}
            nameB={nameB}
          />
        ))}
      </div>
    </section>
  );
}
