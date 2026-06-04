'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import type { SeasonCurrentDto, StandingsDto } from '@/lib/api';
import type { Tempo } from './adaptive';
import { motion } from 'framer-motion';
import { SplitTextReveal } from '@/components/primitives';

export interface HeroProps {
  season: UseQueryResult<SeasonCurrentDto>;
  drivers: UseQueryResult<StandingsDto>;
  revealed: boolean;
  tempo: Tempo;
}

export function Hero({ season, revealed, tempo }: HeroProps) {
  const nextRace = season.data?.nextRace;
  const raceLabel = nextRace 
    ? `NEXT UP: ROUND ${nextRace.round} — ${nextRace.name.toUpperCase()}`
    : 'NEXT UP: CALENDAR EN ROUTE';

  return (
    <section
      className="home-hero relative flex h-dvh w-full flex-col justify-between overflow-hidden bg-off-white px-8 py-10 text-black md:px-16"
      data-tempo={tempo}
    >
      {/* ── Top Header Strip ────────────────────────────────────────────────── */}
      <div className="z-10 flex w-full justify-between items-center border-b border-steel/20 pb-4 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-silver">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span>F1Pulse — Chronos</span>
        </div>
        <div>
          <span>Vol. I — Editorial Archive</span>
        </div>
      </div>

      {/* ── Giant Centered Typography Statement ────────────────────────────── */}
      <div className="z-10 flex flex-1 flex-col justify-center items-center">
        {revealed && (
          <div className="flex flex-col items-center text-center max-w-4xl">
            <span className="font-serif italic text-accent text-lg sm:text-2xl md:text-3xl tracking-wide mb-3 block select-none">
              A luxury motorsport chronicle
            </span>
            <h1
              className="font-display font-black uppercase leading-[0.85] tracking-tight text-black select-none text-center"
              style={{ fontSize: 'clamp(55px, 11vw, 160px)' }}
            >
              <SplitTextReveal text="FORMULA ONE" delay={0.1} stagger={0.03} />
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 mt-6"
            >
              <span className="h-[1px] w-12 bg-steel/40" />
              <span className="font-mono text-sm sm:text-base tracking-[0.5em] text-silver font-medium select-none">
                1950 → 2026
              </span>
              <span className="h-[1px] w-12 bg-steel/40" />
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Bottom Information Row ──────────────────────────────────────────── */}
      <div className="z-10 flex flex-col sm:flex-row w-full justify-between items-start sm:items-center border-t border-steel/20 pt-4 gap-4 sm:gap-0 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-silver">
        <div>
          {revealed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {raceLabel}
            </motion.p>
          )}
        </div>
        <div className="flex items-center gap-2 text-accent">
          {revealed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex items-center gap-2 font-semibold"
            >
              <span>Scroll to Begin</span>
              <span className="animate-bounce">↓</span>
            </motion.span>
          )}
        </div>
      </div>

      {/* Subtle light-tone grid accent in background */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(#d2d0c9_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />
    </section>
  );
}
