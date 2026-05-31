'use client';

/**
 * <StandingsSection> — shared presentational list for both championships.
 *
 * Drivers and Constructors map their DTOs to a common StandingRowData shape
 * and render through this one component, so the motion + layout stay identical.
 *
 * Per row:
 *   - <MaskReveal> staggered entrance
 *   - <CountUp> on the points
 *   - animated gap-to-leader bar (scaleX = points / leaderPoints)
 *
 * The leader row carries `data-leader` + the `home-standings-row--leader`
 * class hook — visually distinct styling is left to the art director.
 */

import { motion } from 'framer-motion';
import type { Tempo } from './adaptive';
import { MaskReveal, CountUp, ScanlineReveal } from '@/components/primitives';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { transitions } from '@/lib/motion';
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

export function StandingsSection({
  title,
  tempo,
  status,
  rows,
  leaderPoints,
  errorLabel,
  emptyLabel,
}: StandingsSectionProps) {
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
        <div className="mx-auto max-w-3xl">
          {rows.map((row, i) => (
            <StandingRow key={row.key} row={row} leaderPoints={leaderPoints} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────

function StandingRow({
  row,
  leaderPoints,
  index,
}: {
  row: StandingRowData;
  leaderPoints: number;
  index: number;
}) {
  const isLeader = index === 0;
  const ratio = leaderPoints > 0 ? row.points / leaderPoints : 0;
  const decimals = Number.isInteger(row.points) ? 0 : 1;

  return (
    <MaskReveal
      trigger="scroll"
      preset="measured"
      direction="left"
      delay={Math.min(index, 12) * 0.04}
    >
      <div
        className={`home-standings-row grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-steel/40 py-4${
          isLeader ? ' home-standings-row--leader' : ''
        }`}
        data-leader={isLeader || undefined}
      >
        <span className="font-mono text-sm tabular-nums text-silver">{row.positionText}</span>

        <div className="min-w-0">
          <p className="truncate font-sans text-base text-off-white">{row.primary}</p>
          {row.secondary && (
            <p className="truncate font-mono text-xs text-silver">{row.secondary}</p>
          )}
          <div className="mt-2">
            <GapBar ratio={ratio} />
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
    </MaskReveal>
  );
}

// ── Gap-to-leader bar ─────────────────────────────────────────────────────
// Animates via scaleX (transformOrigin left) rather than width, so it reads as
// a growing bar while staying GPU-friendly. The percentage IS the data.

function GapBar({ ratio }: { ratio: number }) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, ratio));

  return (
    <div
      className="home-gapbar-track relative h-1 w-full overflow-hidden rounded-full bg-iron"
      aria-hidden="true"
    >
      <motion.div
        className="home-gapbar-fill absolute inset-y-0 left-0 w-full origin-left rounded-full bg-accent"
        initial={{ scaleX: reduced ? clamped : 0 }}
        whileInView={{ scaleX: clamped }}
        viewport={{ once: true, amount: 0.6 }}
        transition={reduced ? { duration: 0.01 } : transitions.measured}
      />
    </div>
  );
}
