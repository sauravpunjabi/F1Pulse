'use client';

/**
 * Chapter 03 — The Golden Era (1970s–1980s)
 *
 * Data:
 *   /api/era/range?from=1970&to=1989  → full era champion timeline
 *   /api/standings/drivers?season=1976 → Lauda vs Hunt points that season
 *
 * Layout: warm-toned, VHS-grain class, fast pacing.
 * 1976 Lauda vs Hunt duel is the emotional centrepiece.
 * All copy is empty — user writes every word.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEraRange, useDriverStandings } from '@/lib/api';
import { MaskReveal } from '@/components/primitives/MaskReveal';
import { ImageReveal } from '@/components/history/ImageReveal';
import { staggerContainerVariants, fadeUpVariants } from '@/lib/motion';

export function GoldenEraContent() {
  const { data: eraData, isLoading } = useEraRange(1970, 1989);
  const { data: standings1976 } = useDriverStandings(1976);

  // Extract Lauda and Hunt from the 1976 final standings.
  // Match by id first, then fall back to family name for schema flexibility.
  const lauda = useMemo(
    () =>
      standings1976?.standings.find(
        (s) =>
          s.driver.id === 'lauda' ||
          s.driver.id === 'niki_lauda' ||
          s.driver.familyName.toLowerCase() === 'lauda',
      ),
    [standings1976],
  );
  const hunt = useMemo(
    () =>
      standings1976?.standings.find(
        (s) =>
          s.driver.id === 'hunt' ||
          s.driver.id === 'james_hunt' ||
          s.driver.familyName.toLowerCase() === 'hunt',
      ),
    [standings1976],
  );

  // Points ratio for the delta bar
  const laudaPoints = lauda?.points ?? 0;
  const huntPoints  = hunt?.points ?? 0;
  const totalPoints = laudaPoints + huntPoints || 1;
  const laudaRatio  = laudaPoints / totalPoints;

  return (
    <div className="w-full text-left">

      {/* ── VHS-grain era photo ─────────────────────────────────────────────── */}
      {/* Apply .vhs-grain CSS class to style the texture */}
      <div className="vhs-grain relative mb-8 h-40 w-full overflow-hidden md:h-56">
        {/* TODO: replace with real photography */}
        <ImageReveal
          src="https://placehold.co/1600x900/0c0c0d/222226"
          alt="Formula One 1970s–1980s — archival era photograph"
          fill
          parallax
          className="h-full w-full"
        />
      </div>

      {/* ── 1976 Lauda vs Hunt — emotional centrepiece ──────────────────────── */}
      <MaskReveal direction="left" className="mb-2">
        <span className="font-mono text-[0.45rem] uppercase tracking-[0.4em] text-white/30">
          1976 · The Duel
        </span>
      </MaskReveal>

      <div className="mb-8 rounded border border-white/8 bg-white/[0.02] p-5">
        {/* Driver comparison row */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Lauda */}
          <div className="flex flex-col">
            <span className="font-mono text-[0.4rem] uppercase tracking-[0.3em] text-white/30">
              Niki Lauda · Ferrari
            </span>
            <span
              className="mt-1 font-display font-black uppercase leading-none text-white"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
            >
              {laudaPoints > 0 ? laudaPoints.toFixed(0) : '—'}
            </span>
            <span className="mt-0.5 font-mono text-[0.4rem] uppercase tracking-[0.2em] text-white/30">
              points
            </span>
            {lauda && (
              <span className="mt-1 font-mono text-[0.4rem] text-white/20">
                {lauda.wins} wins · P{lauda.position}
              </span>
            )}
          </div>

          {/* VS divider */}
          <div className="flex flex-col items-center">
            <span
              className="font-mono font-bold text-white/10"
              style={{ fontSize: 'clamp(1rem, 2.5vw, 2rem)' }}
            >
              vs
            </span>
            <span className="mt-1 font-mono text-[0.4rem] uppercase tracking-[0.2em] text-white/20">
              1976
            </span>
          </div>

          {/* Hunt */}
          <div className="flex flex-col items-end">
            <span className="font-mono text-[0.4rem] uppercase tracking-[0.3em] text-white/30">
              James Hunt · McLaren
            </span>
            <span
              className="mt-1 font-display font-black uppercase leading-none text-white"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
            >
              {huntPoints > 0 ? huntPoints.toFixed(0) : '—'}
            </span>
            <span className="mt-0.5 font-mono text-[0.4rem] uppercase tracking-[0.2em] text-white/30">
              points
            </span>
            {hunt && (
              <span className="mt-1 font-mono text-[0.4rem] text-white/20">
                {hunt.wins} wins · P{hunt.position}
              </span>
            )}
          </div>
        </div>

        {/* Championship delta bar */}
        <div className="mt-5">
          <div className="flex h-px w-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full"
              style={{ background: 'var(--era-accent, #C4956A)' }}
              animate={{ width: `${laudaRatio * 100}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
            />
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="font-mono text-[0.38rem] uppercase tracking-[0.2em] text-white/20">
              Lauda {laudaPoints > huntPoints ? '← Champion' : ''}
            </span>
            <span className="font-mono text-[0.38rem] uppercase tracking-[0.2em] text-white/20">
              {huntPoints > laudaPoints ? 'Champion →' : ''} Hunt
            </span>
          </div>
          {laudaPoints > 0 && huntPoints > 0 && (
            <div className="mt-1 text-center">
              <span className="font-mono text-[0.4rem] uppercase tracking-[0.2em] text-white/30">
                Gap: {Math.abs(laudaPoints - huntPoints).toFixed(0)} pts
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Era timeline 1970–1989 ───────────────────────────────────────────── */}
      <div className="mb-4 border-b border-white/8 pb-2">
        <span className="font-mono text-[0.45rem] uppercase tracking-[0.4em] text-white/30">
          Champions · 1970–1989
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-5 gap-px">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-5 gap-px border border-white/8"
          variants={staggerContainerVariants(0.04)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {(eraData ?? []).map((s) => (
            <motion.div
              key={s.season}
              variants={fadeUpVariants('measured', 10)}
              className={`flex flex-col border-r border-white/8 px-2 py-3 last:border-r-0 transition-colors duration-200 hover:bg-white/[0.03] ${
                s.season === 1976 ? 'bg-white/[0.04] ring-1 ring-inset ring-white/10' : ''
              }`}
            >
              <span className="font-mono text-[0.7rem] font-bold leading-none text-white/20">
                {s.season}
              </span>
              <span className="mt-1.5 font-display text-[0.7rem] font-black uppercase leading-tight text-white/75">
                {s.champion?.driver.familyName ?? '—'}
              </span>
              {s.champion && (
                <span
                  className="mt-auto pt-2 font-mono text-[0.38rem] tabular-nums"
                  style={{ color: 'var(--era-accent, #C4956A)' }}
                >
                  {s.champion.points.toFixed(0)}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
