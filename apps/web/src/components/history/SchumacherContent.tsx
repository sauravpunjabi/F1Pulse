'use client';

/**
 * Chapter 05 — The Schumacher Era (2000–2006)
 *
 * Data:
 *   /api/era/range?from=2000&to=2004  → 5 consecutive championships, one node each
 *   /api/driver/michael_schumacher    → career stats + 2004 season detail
 *
 * Layout: telemetry-grid CSS background, 5 championship data-nodes in a row,
 * Michael's dominant 2004 stats as the main hero metric.
 * Metallic CSS var theme via --era-accent: #E10600 (set in page.tsx ERA_CHAPTERS).
 * All copy is empty — user writes every word.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEraRange, useDriverProfile } from '@/lib/api';
import { MaskReveal } from '@/components/primitives/MaskReveal';
import { ScanlineReveal } from '@/components/primitives/ScanlineReveal';
import { ImageReveal } from '@/components/history/ImageReveal';
import { staggerContainerVariants, fadeUpVariants } from '@/lib/motion';

// Telemetry-grid background using CSS gradient lines
const TELEMETRY_GRID_STYLE = {
  backgroundImage: [
    'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: '44px 44px',
} as const;

export function SchumacherContent() {
  const { data: eraData, isLoading } = useEraRange(2000, 2004);
  const { data: michael } = useDriverProfile('michael_schumacher');

  // 2004 season from career data
  const s2004 = useMemo(
    () => michael?.career.find((s) => s.season === 2004),
    [michael],
  );

  return (
    <div className="w-full text-left">

      {/* ── Telemetry-grid background overlay ─────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-100"
        style={TELEMETRY_GRID_STYLE}
        aria-hidden="true"
      />

      {/* Content sits above the grid */}
      <div className="relative z-10">

        {/* ── Ferrari era photo ─────────────────────────────────────────── */}
        <div className="relative mb-8 h-36 w-full overflow-hidden md:h-48">
          {/* TODO: replace with real photography */}
          <ImageReveal
            src="https://placehold.co/1200x600/0c0c0d/222226"
            alt="Michael Schumacher Ferrari 2000–2004 dominance"
            fill
            parallax
            className="h-full w-full"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
            <span className="font-mono text-[0.42rem] uppercase tracking-[0.3em] text-white/35">
              Ferrari · Scuderia Ferrari Marlboro
            </span>
          </div>
        </div>

        {/* ── 5-championship data nodes ─────────────────────────────────── */}
        <ScanlineReveal className="mb-3">
          <span className="font-mono text-[0.45rem] uppercase tracking-[0.4em] text-white/30">
            Five Consecutive Championships · 2000–2004
          </span>
        </ScanlineReveal>

        {isLoading ? (
          <div className="flex gap-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 flex-1 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : (
          <motion.div
            className="mb-8 grid grid-cols-5 gap-px border border-white/8"
            variants={staggerContainerVariants(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {(eraData ?? []).map((s, idx) => (
              <motion.div
                key={s.season}
                variants={fadeUpVariants('measured', 16)}
                className="group flex flex-col border-r border-white/8 px-3 py-5 last:border-r-0 hover:bg-white/[0.03] transition-colors duration-200"
              >
                {/* Year */}
                <span
                  className="font-mono font-bold leading-none text-white/18 group-hover:text-white/28 transition-colors"
                  style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.8rem)' }}
                >
                  {s.season}
                </span>

                {/* Championship number (1st, 2nd, etc.) */}
                <span
                  className="mt-1 font-mono text-[0.38rem] uppercase tracking-[0.25em]"
                  style={{ color: 'var(--era-accent, #E10600)' }}
                >
                  {['1st', '2nd', '3rd', '4th', '5th'][idx] ?? ''} title
                </span>

                {/* Stats from API */}
                {s.champion && (
                  <>
                    <span
                      className="mt-3 font-display text-sm font-black uppercase leading-tight text-white/80"
                    >
                      {s.champion.driver.familyName}
                    </span>
                    <span
                      className="mt-auto pt-3 font-mono text-[0.5rem] tabular-nums"
                      style={{ color: 'var(--era-accent, #E10600)' }}
                    >
                      {s.champion.points.toFixed(0)} pts
                    </span>
                    <span className="font-mono text-[0.38rem] text-white/25">
                      {s.champion.wins} wins
                    </span>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── 2004 Season hero metrics ───────────────────────────────────── */}
        <MaskReveal direction="left" delay={0.15} className="mb-3">
          <span className="font-mono text-[0.45rem] uppercase tracking-[0.4em] text-white/30">
            2004 Season · The Peak
          </span>
        </MaskReveal>

        {michael && s2004 ? (
          <motion.div
            className="grid grid-cols-3 gap-px border border-white/8 bg-white/[0.015]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          >
            {[
              { label: 'Points', value: s2004.points.toFixed(0) },
              { label: 'Wins',   value: s2004.wins.toString() },
              { label: 'Championships', value: michael.stats.championships.toString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center border-r border-white/8 px-4 py-5 last:border-r-0">
                <span
                  className="font-mono font-bold leading-none text-white"
                  style={{ fontSize: 'clamp(1.6rem, 3.5vw, 3.5rem)' }}
                >
                  {value}
                </span>
                <span className="mt-1.5 font-mono text-[0.42rem] uppercase tracking-[0.25em] text-white/30">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 gap-px">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-white/5" />
            ))}
          </div>
        )}

        {/* ── Career totals row ──────────────────────────────────────────── */}
        {michael && (
          <MaskReveal direction="left" delay={0.3} className="mt-5">
            <div className="flex items-center gap-6 border-t border-white/8 pt-4">
              <span className="font-mono text-[0.4rem] uppercase tracking-[0.25em] text-white/20">
                Career:
              </span>
              <span className="font-mono text-[0.42rem] text-white/35">
                {michael.stats.wins} wins · {michael.stats.podiums} podiums
              </span>
              <span
                className="ml-auto font-mono text-[0.42rem] uppercase tracking-[0.2em]"
                style={{ color: 'var(--era-accent, #E10600)' }}
              >
                {michael.stats.championships}× World Champion
              </span>
            </div>
          </MaskReveal>
        )}
      </div>
    </div>
  );
}
