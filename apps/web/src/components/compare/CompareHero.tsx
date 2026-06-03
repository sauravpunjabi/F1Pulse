'use client';

import { motion } from 'framer-motion';
import { MaskReveal } from '@/components/primitives';
import type { DriverProfileDto, DriverSeasonsDto } from '@/lib/api';

interface CompareHeroProps {
  driverA: DriverProfileDto;
  driverB: DriverProfileDto;
  seasonsA: DriverSeasonsDto;
  seasonsB: DriverSeasonsDto;
}

function eraSpan(seasons: DriverSeasonsDto): string {
  if (!seasons.length) return '';
  const years = seasons.map((s) => s.season);
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? String(min) : `${min}–${max}`;
}

function latestTeam(seasons: DriverSeasonsDto): string {
  if (!seasons.length) return '';
  const sorted = [...seasons].sort((a, b) => b.season - a.season);
  return sorted[0]?.constructors[0]?.name ?? '';
}

export function CompareHero({
  driverA,
  driverB,
  seasonsA,
  seasonsB,
}: CompareHeroProps) {
  return (
    <section
      className="relative flex min-h-dvh w-full overflow-hidden"
      aria-label="Driver comparison hero"
    >
      {/* ── Driver A — left ────────────────────────────────────── */}
      <div
        className="relative flex w-1/2 flex-col justify-end px-8 pb-20 pt-32 md:px-16"
        data-driver-a={driverA.id}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-5 font-mono text-[0.6rem] uppercase tracking-[0.28em] text-white/30"
        >
          {driverA.nationality ?? ''}
          {eraSpan(seasonsA) && (
            <span className="ml-4 text-white/20">{eraSpan(seasonsA)}</span>
          )}
        </motion.p>

        <MaskReveal direction="left" preset="cinematic" trigger="mount">
          <h2
            className="font-display font-black uppercase leading-[0.9] tracking-tight"
            style={{ fontSize: 'clamp(2.8rem,7.5vw,7rem)' }}
          >
            {driverA.familyName}
          </h2>
        </MaskReveal>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-5 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-white/25"
        >
          {latestTeam(seasonsA)}
        </motion.p>
      </div>

      {/* ── Centre divider ────────────────────────────────────── */}
      <motion.div
        className="absolute inset-y-0 left-1/2 w-px -translate-x-px bg-[--border]"
        initial={{ scaleY: 0, originY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.0, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />

      {/* ── Driver B — right ───────────────────────────────────── */}
      <div
        className="relative flex w-1/2 flex-col items-end justify-end px-8 pb-20 pt-32 md:px-16"
        data-driver-b={driverB.id}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-5 text-right font-mono text-[0.6rem] uppercase tracking-[0.28em] text-white/30"
        >
          {eraSpan(seasonsB) && (
            <span className="mr-4 text-white/20">{eraSpan(seasonsB)}</span>
          )}
          {driverB.nationality ?? ''}
        </motion.p>

        <MaskReveal direction="right" preset="cinematic" trigger="mount">
          <h2
            className="text-right font-display font-black uppercase leading-[0.9] tracking-tight"
            style={{ fontSize: 'clamp(2.8rem,7.5vw,7rem)' }}
          >
            {driverB.familyName}
          </h2>
        </MaskReveal>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-5 text-right font-mono text-[0.58rem] uppercase tracking-[0.22em] text-white/25"
        >
          {latestTeam(seasonsB)}
        </motion.p>
      </div>
    </section>
  );
}
