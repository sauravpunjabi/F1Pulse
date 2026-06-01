'use client';

/**
 * DriverStats — animated career aggregate numbers.
 *
 * Renders wins, podiums, poles, championships via <CountUp> with staggered
 * entry via <SectionReveal>. All values come from the API — never hardcoded.
 *
 * TODO: Finalize grid columns once the display typeface is wired.
 */

import { SectionReveal, CountUp } from '@/components/primitives';
import { type DriverStatsDto } from '@/lib/api';

interface DriverStatsProps {
  stats: DriverStatsDto;
}

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
}

export function DriverStats({ stats }: DriverStatsProps) {
  const items: StatItem[] = [
    { label: 'World Championships', value: stats.championships },
    { label: 'Race Wins',           value: stats.wins },
    { label: 'Podiums',             value: stats.podiums },
    { label: 'Pole Positions',      value: stats.poles },
    { label: 'Seasons',             value: stats.seasonsRaced },
  ];

  return (
    <section
      className="driver-stats px-6 py-24 md:px-16 md:py-32"
      aria-label="Career statistics"
    >
      <p className="mb-12 font-mono text-xs uppercase tracking-[0.25em] text-white/40">
        Career Stats
      </p>

      <SectionReveal
        staggerDelay={0.08}
        preset="measured"
        className="grid grid-cols-2 gap-x-8 gap-y-14 md:grid-cols-5"
      >
        {items.map((item) => (
          // SectionReveal wraps each direct child — no extra wrapper needed
          <div key={item.label} className="flex flex-col gap-2">
            <CountUp
              to={item.value}
              duration={2.2}
              suffix={item.suffix}
              className="font-display text-[clamp(2.5rem,6vw,5rem)] font-black leading-none tabular-nums text-white"
            />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
              {item.label}
            </span>
          </div>
        ))}
      </SectionReveal>
    </section>
  );
}
