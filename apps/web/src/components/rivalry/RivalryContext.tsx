'use client';

/**
 * Act 2 — Context section.
 * Era, years they competed together, championships won during that period.
 * All data from API — useDriverProfile for both drivers.
 */

import { motion } from 'framer-motion';
import { MaskReveal } from '@/components/primitives/MaskReveal';
import type { DriverProfileDto } from '@/lib/api';
import type { RivalryConfig } from '@/config/rivalries';

interface RivalryContextProps {
  config: RivalryConfig;
  profileA: DriverProfileDto;
  profileB: DriverProfileDto;
}

function overlapYears(
  profileA: DriverProfileDto,
  profileB: DriverProfileDto,
  eraStart: number,
  eraEnd: number,
): number[] {
  const seasonsA = new Set(profileA.career.map((s) => s.season));
  const seasonsB = new Set(profileB.career.map((s) => s.season));
  const years: number[] = [];
  for (let y = eraStart; y <= eraEnd; y++) {
    if (seasonsA.has(y) && seasonsB.has(y)) years.push(y);
  }
  return years;
}

function champsDuring(
  profile: DriverProfileDto,
  years: number[],
): number {
  const yearSet = new Set(years);
  return profile.career.filter((s) => yearSet.has(s.season) && s.position === 1).length;
}

export function RivalryContext({ config, profileA, profileB }: RivalryContextProps) {
  const years = overlapYears(profileA, profileB, config.eraStart, config.eraEnd);
  const champsA = champsDuring(profileA, years);
  const champsB = champsDuring(profileB, years);

  const firstYear = years[0] ?? config.eraStart;
  const lastYear = years[years.length - 1] ?? config.eraEnd;

  return (
    <section
      className="relative px-6 py-24 md:px-16 md:py-32"
      aria-label="Rivalry context"
    >
      {/* Era label */}
      <MaskReveal direction="top" preset="measured">
        <p className="mb-12 font-mono text-[0.48rem] uppercase tracking-[0.4em] text-white/20">
          {firstYear} — {lastYear} · {years.length} seasons
        </p>
      </MaskReveal>

      {/* Side-by-side context grid */}
      <div className="grid gap-12 md:grid-cols-2 md:gap-24">
        {/* Driver A */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col gap-6"
        >
          <h2
            className="font-display font-black uppercase leading-none text-white"
            style={{ fontSize: 'clamp(1.4rem, 3.5vw, 3rem)' }}
          >
            {profileA.familyName}
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <span className="font-mono text-[0.42rem] uppercase tracking-widest text-white/25">
                Nationality
              </span>
              <p className="mt-1 font-mono text-[0.52rem] uppercase tracking-wide text-white/60">
                {profileA.nationality ?? '—'}
              </p>
            </div>
            <div>
              <span className="font-mono text-[0.42rem] uppercase tracking-widest text-white/25">
                Championships during rivalry
              </span>
              <p
                className="mt-1 font-display font-black leading-none"
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
                  color: '#E10600',
                }}
              >
                {champsA}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Driver B */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col gap-6 md:text-right"
        >
          <h2
            className="font-display font-black uppercase leading-none text-white"
            style={{ fontSize: 'clamp(1.4rem, 3.5vw, 3rem)' }}
          >
            {profileB.familyName}
          </h2>
          <div className="flex flex-col gap-4 md:items-end">
            <div>
              <span className="font-mono text-[0.42rem] uppercase tracking-widest text-white/25">
                Nationality
              </span>
              <p className="mt-1 font-mono text-[0.52rem] uppercase tracking-wide text-white/60">
                {profileB.nationality ?? '—'}
              </p>
            </div>
            <div>
              <span className="font-mono text-[0.42rem] uppercase tracking-widest text-white/25">
                Championships during rivalry
              </span>
              <p
                className="mt-1 font-display font-black leading-none"
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {champsB}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
