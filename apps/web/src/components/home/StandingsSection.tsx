'use client';

/**
 * <StandingsSection> — shared presentational list for both championships.
 *
 * Drivers and Constructors map their DTOs to a common StandingRowData shape
 * and render through this one component, so the motion + layout stay identical.
 *
 * Animation architecture — one IntersectionObserver for the whole rows block:
 *   - A single useInView ref on the rows container replaces the previous
 *     per-row MaskReveal (20 IOs) + per-GapBar whileInView (20 IOs).
 *   - All 20 rows stagger via Framer Motion variants driven by that single IO.
 *   - GapBar receives inView as a prop; it animates on the same trigger.
 *   - CountUp still has its own IO (lightweight; runs once after reveal).
 *
 * The leader row carries `data-leader` + the `home-standings-row--leader`
 * class hook — visually distinct styling is left to the art director.
 */

import { useRef } from 'react';
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
  tempo: Tempo;
  status: SectionStatus;
  rows: StandingRowData[];
  /** Highest points in the table — denominator for the gap bars. */
  leaderPoints: number;
  errorLabel: string;
  emptyLabel: string;
}

const containerVariants = staggerContainerVariants(0.04);
const rowVariants = fadeUpVariants('measured', 16);

export function StandingsSection({
  title,
  tempo,
  status,
  rows,
  leaderPoints,
  errorLabel,
  emptyLabel,
}: StandingsSectionProps) {
  // Single IO for all rows — fires once when the top of the list enters view.
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.1 });

  return (
    <section
      className="home-standings px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
      data-tempo={tempo}
    >
      <ScanlineReveal className="mx-auto mb-10 max-w-3xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-off-white sm:text-5xl">
          {title}
        </h2>
      </ScanlineReveal>

      {status === 'loading' && <LoadingState label={`Loading ${title.toLowerCase()}…`} />}
      {status === 'error' && <ErrorState label={errorLabel} />}
      {status === 'empty' && <EmptyState label={emptyLabel} />}

      {status === 'ready' && (
        <motion.div
          ref={containerRef}
          className="mx-auto max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {rows.map((row, i) => (
            <motion.div key={row.key} variants={rowVariants}>
              <StandingRow
                row={row}
                leaderPoints={leaderPoints}
                index={i}
                inView={inView}
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
      className={`home-standings-row grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-steel/40 py-4${
        isLeader ? ' home-standings-row--leader' : ''
      }`}
      data-leader={isLeader || undefined}
    >
      <span className="font-mono text-sm tabular-nums text-silver">
        {row.positionText}
      </span>

      <div className="min-w-0">
        <p className="truncate font-sans text-base text-off-white">{row.primary}</p>
        {row.secondary && (
          <p className="truncate font-mono text-xs text-silver">{row.secondary}</p>
        )}
        <div className="mt-2">
          <GapBar ratio={ratio} inView={inView} />
        </div>
      </div>

      <div className="text-right">
        <p className="font-mono text-base tabular-nums text-off-white">
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

// ── Gap-to-leader bar ─────────────────────────────────────────────────────────
// Receives inView from the parent container — no per-bar IO.
// Animates via scaleX (transformOrigin left) rather than width to stay
// GPU-friendly. The percentage IS the data.

function GapBar({ ratio, inView }: { ratio: number; inView: boolean }) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, ratio));

  return (
    <div
      className="home-gapbar-track relative h-1 w-full overflow-hidden rounded-full bg-iron"
      aria-hidden="true"
    >
      <motion.div
        className="home-gapbar-fill absolute inset-y-0 left-0 w-full origin-left rounded-full bg-accent"
        initial={{ scaleX: 0 }}
        animate={inView || reduced ? { scaleX: clamped } : { scaleX: 0 }}
        transition={reduced ? { duration: 0.01 } : transitions.measured}
      />
    </div>
  );
}
