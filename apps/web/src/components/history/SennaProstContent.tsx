'use client';

/**
 * Chapter 04 — Senna / Prost (1988–1993)
 *
 * Data:
 *   /api/driver/senna          → career stats + year-by-year points
 *   /api/driver/prost          → career stats + year-by-year points
 *   /api/era/range?from=1988&to=1993 → who won each season
 *
 * Layout: true split-screen — Senna left, Prost right, year + championship
 * delta bar at centre. Scroll advances the years 1988 → 1989 → 1990 → 1991
 * driven by GSAP scrub tied to the parent section's pin.
 *
 * Pin duration must match the EraChapter config in page.tsx (SENNA_PROST_PIN_DURATION).
 * The rain overlay div is empty — user adds CSS on .senna-prost-rain-overlay.
 * All narrative copy is empty — user writes every word.
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDriverProfile, useEraRange } from '@/lib/api';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/** Must match pinDuration for the Senna/Prost EraChapter in page.tsx */
export const SENNA_PROST_PIN_DURATION = 2400;

const RIVALRY_YEARS = [1988, 1989, 1990, 1991] as const;
type RivalryYear = (typeof RIVALRY_YEARS)[number];

// Senna: yellow-green; Prost: tricolore blue
const SENNA_COLOR = '#00D449';
const PROST_COLOR  = '#0055A4';

export function SennaProstContent() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [yearIndex, setYearIndex] = useState(0);

  const { data: sennaProfile } = useDriverProfile('senna');
  const { data: prostProfile }  = useDriverProfile('prost');
  const { data: eraData }       = useEraRange(1988, 1993);

  // Scroll-driven year progression within the GSAP-pinned parent section
  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduced) return;

    // Nearest <section> is the EraChapter's pinned element
    const section = el.closest<HTMLElement>('section');
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${SENNA_PROST_PIN_DURATION}`,
        scrub: 1,
        onUpdate(self) {
          // 4 equal bands across the pin duration
          const idx = Math.min(3, Math.floor(self.progress * 4));
          setYearIndex(idx);
        },
      });
    });

    return () => ctx.revert();
  }, [reduced]);

  const activeYear: RivalryYear = RIVALRY_YEARS[yearIndex] ?? 1988;

  const sennaCareer = useMemo(() => sennaProfile?.career ?? [], [sennaProfile]);
  const prostCareer = useMemo(() => prostProfile?.career ?? [], [prostProfile]);

  const sennaYearData = useMemo(
    () => sennaCareer.find((s) => s.season === activeYear),
    [sennaCareer, activeYear],
  );
  const prostYearData = useMemo(
    () => prostCareer.find((s) => s.season === activeYear),
    [prostCareer, activeYear],
  );

  const eraYear = useMemo(
    () => eraData?.find((d) => d.season === activeYear),
    [eraData, activeYear],
  );

  const sennaPoints = sennaYearData?.points ?? 0;
  const prostPoints  = prostYearData?.points  ?? 0;
  const totalPoints  = sennaPoints + prostPoints || 1;
  const sennaRatio   = sennaPoints / totalPoints;

  const pointsGap = Math.abs(sennaPoints - prostPoints);
  const leaderName =
    sennaPoints >= prostPoints
      ? (sennaProfile?.familyName ?? 'Senna')
      : (prostProfile?.familyName  ?? 'Prost');

  const yearVariants = {
    enter: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } },
    exit:  { opacity: 0, y: -14, transition: { duration: 0.2 } },
  };

  return (
    <div ref={containerRef} className="w-full text-left">

      {/* Rain overlay — user styles .senna-prost-rain-overlay with CSS */}
      <div className="senna-prost-rain-overlay pointer-events-none" aria-hidden="true" />

      {/* ── Year progress bar ─────────────────────────────────────────────── */}
      <div className="relative mb-4 h-px w-full bg-white/8">
        <motion.div
          className="absolute left-0 top-0 h-full"
          style={{ background: 'var(--era-accent, #FF1801)' }}
          animate={{ width: `${((yearIndex + 1) / 4) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        />
      </div>

      {/* ── Year tabs ─────────────────────────────────────────────────────── */}
      <div className="mb-6 flex justify-center gap-8 md:gap-14">
        {RIVALRY_YEARS.map((year, i) => (
          <span
            key={year}
            className="font-mono text-[0.5rem] uppercase tracking-[0.3em] transition-colors duration-300"
            style={{
              color:
                i === yearIndex
                  ? 'var(--era-accent, #FF1801)'
                  : 'rgba(255,255,255,0.18)',
            }}
          >
            {year}
          </span>
        ))}
      </div>

      {/* ── Main 3-column split layout ────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 md:gap-8">

        {/* LEFT — Senna ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-end border-r border-white/8 pr-4 md:pr-8">
          <span className="mb-3 font-mono text-[0.42rem] uppercase tracking-[0.3em] text-white/30">
            Ayrton Senna
          </span>

          {sennaProfile ? (
            <>
              <span
                className="font-display font-black leading-none text-white"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 4rem)' }}
              >
                {sennaProfile.stats.championships}
              </span>
              <span className="mt-0.5 font-mono text-[0.4rem] uppercase tracking-[0.2em] text-white/35">
                Championships
              </span>

              <span
                className="mt-4 font-display font-black leading-none text-white/70"
                style={{ fontSize: 'clamp(1.2rem, 2.5vw, 2.5rem)' }}
              >
                {sennaProfile.stats.wins}
              </span>
              <span className="mt-0.5 font-mono text-[0.4rem] uppercase tracking-[0.2em] text-white/35">
                Career Wins
              </span>

              {/* Year-specific stats */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`senna-${activeYear}`}
                  variants={yearVariants}
                  initial="enter"
                  animate="visible"
                  exit="exit"
                  className="mt-5 flex flex-col items-end"
                >
                  {sennaYearData ? (
                    <>
                      <span
                        className="font-display font-black leading-none"
                        style={{
                          fontSize: 'clamp(1rem, 2vw, 2rem)',
                          color: SENNA_COLOR,
                        }}
                      >
                        {sennaPoints.toFixed(0)}
                      </span>
                      <span className="mt-0.5 font-mono text-[0.4rem] uppercase tracking-[0.15em] text-white/30">
                        {activeYear} pts
                      </span>
                      <span className="mt-1 font-mono text-[0.38rem] text-white/20">
                        {sennaYearData.wins} wins · P{sennaYearData.position}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-[0.4rem] text-white/20">—</span>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            <div className="h-24 w-24 animate-pulse rounded bg-white/5" />
          )}
        </div>

        {/* CENTRE — Active year + championship delta bar ─────────────────── */}
        <div className="flex min-w-[120px] flex-col items-center md:min-w-[160px]">
          {/* Giant year number */}
          <AnimatePresence mode="wait">
            <motion.span
              key={activeYear}
              className="font-mono font-bold leading-none text-white/12"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.35 } }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            >
              {activeYear}
            </motion.span>
          </AnimatePresence>

          {/* Champion of that year */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`winner-${activeYear}`}
              className="mb-5 mt-2 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              {eraYear?.champion ? (
                <>
                  <span
                    className="font-mono text-[0.38rem] uppercase tracking-[0.25em]"
                    style={{ color: 'var(--era-accent, #FF1801)' }}
                  >
                    Champion
                  </span>
                  <span className="mt-0.5 font-display text-xs font-black uppercase text-white">
                    {eraYear.champion.driver.familyName}
                  </span>
                </>
              ) : (
                <div className="h-6" />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Championship delta bar */}
          <div className="w-full">
            <div className="flex h-px w-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full"
                style={{ background: SENNA_COLOR }}
                animate={{ width: `${sennaRatio * 100}%` }}
                transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              />
              <motion.div
                className="ml-auto h-full"
                style={{ background: PROST_COLOR }}
                animate={{ width: `${(1 - sennaRatio) * 100}%` }}
                transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              />
            </div>
            <div className="mt-1 flex justify-between">
              <span className="font-mono text-[0.35rem] uppercase tracking-[0.15em] text-white/20">S</span>
              <span className="font-mono text-[0.35rem] uppercase tracking-[0.15em] text-white/20">P</span>
            </div>

            {/* Points gap */}
            <AnimatePresence mode="wait">
              {sennaPoints > 0 && prostPoints > 0 && (
                <motion.div
                  key={`gap-${activeYear}`}
                  className="mt-2 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="font-mono text-[0.42rem] uppercase tracking-[0.2em] text-white/35">
                    {pointsGap.toFixed(0)} pt gap
                  </span>
                  <div className="mt-0.5 font-mono text-[0.38rem] text-white/20">
                    {leaderName} leads
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT — Prost ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-start border-l border-white/8 pl-4 md:pl-8">
          <span className="mb-3 font-mono text-[0.42rem] uppercase tracking-[0.3em] text-white/30">
            Alain Prost
          </span>

          {prostProfile ? (
            <>
              <span
                className="font-display font-black leading-none text-white"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 4rem)' }}
              >
                {prostProfile.stats.championships}
              </span>
              <span className="mt-0.5 font-mono text-[0.4rem] uppercase tracking-[0.2em] text-white/35">
                Championships
              </span>

              <span
                className="mt-4 font-display font-black leading-none text-white/70"
                style={{ fontSize: 'clamp(1.2rem, 2.5vw, 2.5rem)' }}
              >
                {prostProfile.stats.wins}
              </span>
              <span className="mt-0.5 font-mono text-[0.4rem] uppercase tracking-[0.2em] text-white/35">
                Career Wins
              </span>

              {/* Year-specific stats */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`prost-${activeYear}`}
                  variants={yearVariants}
                  initial="enter"
                  animate="visible"
                  exit="exit"
                  className="mt-5 flex flex-col items-start"
                >
                  {prostYearData ? (
                    <>
                      <span
                        className="font-display font-black leading-none"
                        style={{
                          fontSize: 'clamp(1rem, 2vw, 2rem)',
                          color: PROST_COLOR,
                        }}
                      >
                        {prostPoints.toFixed(0)}
                      </span>
                      <span className="mt-0.5 font-mono text-[0.4rem] uppercase tracking-[0.15em] text-white/30">
                        {activeYear} pts
                      </span>
                      <span className="mt-1 font-mono text-[0.38rem] text-white/20">
                        {prostYearData.wins} wins · P{prostYearData.position}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-[0.4rem] text-white/20">—</span>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            <div className="h-24 w-24 animate-pulse rounded bg-white/5" />
          )}
        </div>
      </div>

      {/* ── Era range summary ─────────────────────────────────────────────── */}
      {eraData && (
        <div className="mt-6 flex gap-6 border-t border-white/8 pt-4 opacity-50">
          {eraData.slice(0, 6).map((s) => (
            <div key={s.season} className="flex flex-col items-center">
              <span className="font-mono text-[0.38rem] text-white/20">{s.season}</span>
              <span className="font-mono text-[0.4rem] font-bold text-white/40">
                {s.champion?.driver.code ?? s.champion?.driver.familyName?.slice(0, 3).toUpperCase() ?? '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
