'use client';

/**
 * Chapter 06 — Hybrid Dominance (2014–2020)
 *
 * Data:
 *   /api/era/range?from=2014&to=2021  → season-by-season champions
 *   /api/driver/hamilton              → Hamilton career stats + highlights
 *
 * Layout: ultra-clean, cold CSS var theme (--era-accent: #00D2BE / Mercedes teal).
 * Data-heavy display — championship years highlighted.
 * All copy is empty — user writes every word.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEraRange, useDriverProfile } from '@/lib/api';
import { MaskReveal } from '@/components/primitives/MaskReveal';
import { ScanlineReveal } from '@/components/primitives/ScanlineReveal';
import { ImageReveal } from '@/components/history/ImageReveal';
import { staggerContainerVariants, fadeUpVariants } from '@/lib/motion';

export function HybridEraContent() {
  const { data: eraData, isLoading } = useEraRange(2014, 2021);
  const { data: hamilton }           = useDriverProfile('hamilton');

  // Years Hamilton won the championship (from era data).
  // Match by id or family name for schema flexibility.
  const hamiltonChampionYears = useMemo(
    () =>
      (eraData ?? [])
        .filter(
          (s) =>
            s.champion?.driver.id === 'hamilton' ||
            s.champion?.driver.id === 'lewis_hamilton' ||
            s.champion?.driver.familyName.toLowerCase() === 'hamilton',
        )
        .map((s) => s.season),
    [eraData],
  );

  // All stats
  const stats = hamilton?.stats;

  return (
    <div className="w-full text-left">

      {/* ── Mercedes era photo ────────────────────────────────────────────── */}
      <div className="relative mb-8 h-36 w-full overflow-hidden md:h-44">
        {/* TODO: replace with real photography */}
        <ImageReveal
          src="https://placehold.co/1200x600/0c0c0d/222226"
          alt="Lewis Hamilton Mercedes AMG Hybrid Era 2014–2020"
          fill
          parallax
          className="h-full w-full"
        />
      </div>

      {/* ── Hamilton career headline stats ───────────────────────────────── */}
      <MaskReveal direction="left" className="mb-3">
        <span className="font-mono text-[0.45rem] uppercase tracking-[0.4em] text-white/30">
          Lewis Hamilton · Mercedes AMG
        </span>
      </MaskReveal>

      {stats ? (
        <motion.div
          className="mb-8 grid grid-cols-4 gap-px border border-white/8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, staggerChildren: 0.06 }}
        >
          {[
            { label: 'Championships', value: stats.championships, accent: true },
            { label: 'Wins',          value: stats.wins          },
            { label: 'Podiums',       value: stats.podiums       },
            { label: 'Poles',         value: stats.poles         },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="flex flex-col items-center border-r border-white/8 px-3 py-5 last:border-r-0"
            >
              <span
                className="font-mono font-bold leading-none"
                style={{
                  fontSize: 'clamp(1.5rem, 3.5vw, 3.2rem)',
                  color: accent ? 'var(--era-accent, #00D2BE)' : 'white',
                }}
              >
                {value}
              </span>
              <span className="mt-1.5 font-mono text-[0.4rem] uppercase tracking-[0.22em] text-white/30">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="mb-8 grid grid-cols-4 gap-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-white/5" />
          ))}
        </div>
      )}

      {/* ── Season-by-season champion timeline ───────────────────────────── */}
      <ScanlineReveal className="mb-3">
        <span className="font-mono text-[0.45rem] uppercase tracking-[0.4em] text-white/30">
          Champions · 2014–2021
        </span>
      </ScanlineReveal>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-px">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-4 gap-px border border-white/8"
          variants={staggerContainerVariants(0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {(eraData ?? []).map((s) => {
            const isHAM = hamiltonChampionYears.includes(s.season);
            return (
              <motion.div
                key={s.season}
                variants={fadeUpVariants('measured', 10)}
                className={`flex flex-col border-r border-white/8 px-3 py-4 last:border-r-0 transition-colors duration-200 ${
                  isHAM ? 'bg-[var(--era-accent,#00D2BE)]/[0.04]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <span
                  className="font-mono font-bold leading-none"
                  style={{
                    fontSize: 'clamp(1.2rem, 2.5vw, 2.2rem)',
                    color: isHAM ? 'var(--era-accent, #00D2BE)' : 'rgba(255,255,255,0.15)',
                  }}
                >
                  {s.season}
                </span>
                <span className="mt-1.5 font-display text-xs font-black uppercase leading-tight text-white/80">
                  {s.champion?.driver.familyName ?? '—'}
                </span>
                {s.champion && (
                  <>
                    <span className="mt-0.5 font-mono text-[0.38rem] uppercase tracking-[0.15em] text-white/25">
                      {s.champion.constructors[0]?.name ?? ''}
                    </span>
                    <span
                      className="mt-auto pt-2 font-mono text-[0.45rem] tabular-nums"
                      style={{
                        color: isHAM ? 'var(--era-accent, #00D2BE)' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {s.champion.points.toFixed(0)} pts
                    </span>
                  </>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Hamilton championship years visual callout ────────────────────── */}
      {hamiltonChampionYears.length > 0 && (
        <MaskReveal direction="left" delay={0.2} className="mt-6">
          <div className="flex items-center gap-3 border-t border-white/8 pt-4">
            <span className="font-mono text-[0.4rem] uppercase tracking-[0.25em] text-white/20">
              Hamilton titles:
            </span>
            <div className="flex gap-2">
              {hamiltonChampionYears.map((year) => (
                <span
                  key={year}
                  className="font-mono text-[0.5rem] font-bold tabular-nums"
                  style={{ color: 'var(--era-accent, #00D2BE)' }}
                >
                  {year}
                </span>
              ))}
            </div>
          </div>
        </MaskReveal>
      )}
    </div>
  );
}
