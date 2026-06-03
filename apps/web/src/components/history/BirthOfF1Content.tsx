'use client';

/**
 * Chapter 01 — Birth of F1 (1950–1959)
 *
 * Data: /api/era/range?from=1950&to=1959 → one SeasonSummaryDto per year.
 * Layout: archival newspaper-style — giant year numbers, mono data labels,
 * champion column, stats row. Emotional tone: dangerous, raw, mechanical.
 * All copy fields are empty strings — user writes every word.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEraRange } from '@/lib/api';
import { MaskReveal } from '@/components/primitives/MaskReveal';
import { ScanlineReveal } from '@/components/primitives/ScanlineReveal';
import { ImageReveal } from '@/components/history/ImageReveal';
import { staggerContainerVariants, fadeUpVariants } from '@/lib/motion';

export function BirthOfF1Content() {
  const { data, isLoading } = useEraRange(1950, 1959);

  const seasons = useMemo(() => data ?? [], [data]);

  const totalRaces = useMemo(
    () => seasons.reduce((sum, s) => sum + s.raceCount, 0),
    [seasons],
  );

  return (
    <div className="w-full text-left">

      {/* ── Archival era photograph ────────────────────────────────────────── */}
      <div className="relative mb-10 h-48 w-full md:h-64 lg:h-80">
        {/* TODO: replace with real photography */}
        <ImageReveal
          src="https://placehold.co/1600x900/0c0c0d/222226"
          alt="Formula One 1950s era — archival photograph"
          fill
          parallax
          className="h-full w-full"
        />
        {/* Newspaper-style caption bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
          <span className="font-mono text-[0.45rem] uppercase tracking-[0.35em] text-white/40">
            Formula One World Championship · Inaugural Season 1950
          </span>
        </div>
      </div>

      {/* ── Narrative copy placeholder ─────────────────────────────────────── */}
      {/* User writes copy — leave empty */}

      {/* ── Year-by-year champion grid — newspaper column style ────────────── */}
      <ScanlineReveal className="w-full" scanDuration={0.4} contentDelay={0.35}>
        <div className="mb-6 border-b border-white/10 pb-2">
          <span className="font-mono text-[0.45rem] uppercase tracking-[0.4em] text-white/30">
            Season Champions · 1950–1959
          </span>
        </div>
      </ScanlineReveal>

      {isLoading ? (
        <div className="grid grid-cols-5 gap-px">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-5 gap-px border border-white/8"
          variants={staggerContainerVariants(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {seasons.map((s) => {
            const champion = s.champion;
            return (
              <motion.div
                key={s.season}
                variants={fadeUpVariants('measured', 12)}
                className="group flex flex-col border-r border-white/8 px-3 py-4 last:border-r-0 hover:bg-white/[0.03] transition-colors duration-200"
              >
                {/* Giant year number */}
                <span
                  className="font-mono font-bold leading-none text-white/15 group-hover:text-white/25 transition-colors duration-300"
                  style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3.2rem)' }}
                >
                  {s.season}
                </span>

                {/* Champion family name */}
                <span className="mt-2 font-display text-sm font-black uppercase leading-tight text-white/80 group-hover:text-white transition-colors duration-200">
                  {champion?.driver.familyName ?? '—'}
                </span>

                {/* Constructor */}
                <span className="mt-1 font-mono text-[0.42rem] uppercase tracking-[0.2em] text-white/30">
                  {champion?.constructors[0]?.name ?? ''}
                </span>

                {/* Points */}
                {champion && (
                  <span
                    className="mt-auto pt-3 font-mono text-[0.5rem] tabular-nums"
                    style={{ color: 'var(--era-accent, var(--text-secondary))' }}
                  >
                    {champion.points.toFixed(0)} pts
                  </span>
                )}

                {/* Races that season */}
                <span className="font-mono text-[0.4rem] uppercase tracking-[0.15em] text-white/20">
                  {s.raceCount} races
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Era stats bar ─────────────────────────────────────────────────── */}
      <MaskReveal direction="left" delay={0.2} className="mt-8">
        <div className="flex gap-12 border-t border-white/8 pt-5">
          <div className="flex flex-col">
            <span
              className="font-mono font-bold leading-none text-white"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2.8rem)' }}
            >
              {isLoading ? '—' : totalRaces}
            </span>
            <span className="mt-1 font-mono text-[0.45rem] uppercase tracking-[0.3em] text-white/30">
              Total Races
            </span>
          </div>

          <div className="flex flex-col">
            <span
              className="font-mono font-bold leading-none text-white"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 2.8rem)' }}
            >
              {isLoading ? '—' : seasons.length}
            </span>
            <span className="mt-1 font-mono text-[0.45rem] uppercase tracking-[0.3em] text-white/30">
              Seasons
            </span>
          </div>

          <div className="flex flex-col">
            <span
              className="font-mono font-bold leading-none"
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 2.8rem)',
                color: 'var(--era-accent, #909090)',
              }}
            >
              {isLoading
                ? '—'
                : (data?.find((s) => s.champion)?.champion?.driver.familyName ?? '—')}
            </span>
            <span className="mt-1 font-mono text-[0.45rem] uppercase tracking-[0.3em] text-white/30">
              First Champion
            </span>
          </div>
        </div>
      </MaskReveal>
    </div>
  );
}
