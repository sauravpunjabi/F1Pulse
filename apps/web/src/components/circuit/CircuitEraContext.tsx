'use client';

/**
 * <CircuitEraContext> — which F1 eras this circuit has hosted.
 *
 * Era badges stagger in via SectionReveal.
 * Links to /history for full era exploration.
 */

import { SectionReveal } from '@/components/primitives';

interface CircuitEraContextProps {
  eras: string[];
  firstYear: number;
}

const ERA_YEARS: Record<string, string> = {
  'Pioneer Era': '1950 – 1966',
  'Classic Era': '1967 – 1979',
  'Turbo & Ground Effect': '1980 – 1993',
  'Modern Era': '1994 – 2009',
  'Hybrid Era': '2010 – 2021',
  'Ground Effect Revival': '2022 – present',
};

export function CircuitEraContext({ eras, firstYear }: CircuitEraContextProps) {
  if (eras.length === 0) return null;

  return (
    <section className="circuit-era-context px-6 py-16 md:px-16">
      <p className="mb-8 font-mono text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
        Eras Hosted
      </p>

      <SectionReveal staggerDelay={0.07} preset="measured" className="flex flex-wrap gap-4">
        {eras.map((era) => (
          <div
            key={era}
            className="circuit-era-badge border border-white/[0.08] px-5 py-4"
          >
            <p className="font-display text-base font-black uppercase leading-none text-off-white">
              {era}
            </p>
            <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/30">
              {ERA_YEARS[era] ?? ''}
            </p>
          </div>
        ))}
      </SectionReveal>

      {firstYear > 0 && (
        <p className="mt-8 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/20">
          On the calendar since {firstYear}
        </p>
      )}
    </section>
  );
}
