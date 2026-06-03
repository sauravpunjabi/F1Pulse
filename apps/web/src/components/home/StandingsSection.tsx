'use client';

/**
 * <StandingsSection> — shared presentational list for both championships.
 *
 * Single IntersectionObserver on the rows container — all rows stagger
 * via Framer Motion variants driven by that single IO.
 *
 * Visual spec:
 *   - Driver/constructor name: font-display, 24px+
 *   - Row min-height: 64px
 *   - Leader row: 2px red left border + name in accent colour
 *   - Border between rows: #222226 solid (not opacity-dimmed)
 *   - Section index label in accent red
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { Tempo } from './adaptive';
import { CountUp, ScanlineReveal } from '@/components/primitives';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  transitions,
  staggerContainerVariants,
  fadeUpVariants,
} from '@/lib/motion';
import {
  LoadingState,
  ErrorState,
  EmptyState,
  type SectionStatus,
} from './SectionState';

export interface StandingRowData {
  key: string;
  positionText: string;
  primary: string;
  secondary?: string;
  points: number;
  wins: number;
}

export interface StandingsSectionProps {
  title: string;
  sectionIndex: string; // e.g. "02"
  tempo: Tempo;
  status: SectionStatus;
  rows: StandingRowData[];
  leaderPoints: number;
  errorLabel: string;
  emptyLabel: string;
}

const containerVariants = staggerContainerVariants(0.04);
const rowVariants = fadeUpVariants('measured', 16);

export function StandingsSection({
  title,
  sectionIndex,
  tempo,
  status,
  rows,
  leaderPoints,
  errorLabel,
  emptyLabel,
}: StandingsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0 });

  const [forceReveal, setForceReveal] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceReveal(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const shouldReveal = inView || forceReveal;

  return (
    <section
      className="home-standings px-6 py-24 sm:px-10 sm:py-32 lg:px-20"
      data-tempo={tempo}
    >
      <ScanlineReveal className="mx-auto mb-12 max-w-3xl">
        <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.35em] text-accent">
          {sectionIndex} /
        </p>
        <h2 className="font-display text-5xl font-black uppercase leading-none tracking-tight text-off-white sm:text-6xl">
          {title}
        </h2>
      </ScanlineReveal>

      {status === 'loading' && <LoadingState label={`Loading ${title.toLowerCase()}…`} />}
      {status === 'error'   && <ErrorState label={errorLabel} />}
      {status === 'empty'   && <EmptyState label={emptyLabel} />}

      {status === 'ready' && (
        <motion.div
          ref={containerRef}
          className="mx-auto max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate={shouldReveal ? 'visible' : 'hidden'}
        >
          {rows.map((row, i) => (
            <motion.div key={row.key} variants={rowVariants}>
              <StandingRow
                row={row}
                leaderPoints={leaderPoints}
                index={i}
                inView={shouldReveal}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function StandingRow({
  row,
  leaderPoints,
  index,
  inView,
}: {
  row: StandingRowData;
  leaderPoints: number;
  index: number;
  inView: boolean;
}) {
  const isLeader = index === 0;
  const ratio = leaderPoints > 0 ? row.points / leaderPoints : 0;
  const decimals = Number.isInteger(row.points) ? 0 : 1;

  return (
    <div
      className={`home-standings-row grid min-h-[64px] grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b py-4${
        isLeader
          ? ' home-standings-row--leader border-l-2 border-l-accent pl-3'
          : ''
      }`}
      style={{ borderBottomColor: '#222226' }}
      data-leader={isLeader || undefined}
    >
      {/* Position */}
      <span
        className="font-mono text-sm tabular-nums"
        style={{ color: isLeader ? 'var(--accent)' : 'var(--color-silver)' }}
      >
        {row.positionText}
      </span>

      {/* Name + team + gap bar */}
      <div className="min-w-0">
        <p
          className="truncate font-display font-black uppercase leading-tight"
          style={{
            fontSize: 'clamp(18px, 2vw, 26px)',
            color: isLeader ? 'var(--accent)' : 'var(--color-off-white)',
          }}
        >
          {row.primary}
        </p>
        {row.secondary && (
          <p className="truncate font-mono text-xs text-silver">{row.secondary}</p>
        )}
        <div className="mt-2">
          <GapBar ratio={ratio} inView={inView} isLeader={isLeader} />
        </div>
      </div>

      {/* Points + wins */}
      <div className="text-right">
        <p className="font-mono text-lg tabular-nums text-off-white">
          <CountUp to={row.points} decimals={decimals} duration={1.4} />{' '}
          <span className="text-xs text-silver">pts</span>
        </p>
        <p className="font-mono text-xs tabular-nums text-silver">
          {row.wins} {row.wins === 1 ? 'win' : 'wins'}
        </p>
      </div>
    </div>
  );
}

// ── Gap bar ───────────────────────────────────────────────────────────────────

function GapBar({
  ratio,
  inView,
  isLeader,
}: {
  ratio: number;
  inView: boolean;
  isLeader: boolean;
}) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, ratio));

  return (
    <div
      className="relative h-[2px] w-full overflow-hidden bg-iron"
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-y-0 left-0 w-full origin-left"
        style={{ background: isLeader ? 'var(--accent)' : 'var(--color-silver)' }}
        initial={{ scaleX: 0 }}
        animate={inView || reduced ? { scaleX: clamped } : { scaleX: 0 }}
        transition={reduced ? { duration: 0.01 } : transitions.measured}
      />
    </div>
  );
}
