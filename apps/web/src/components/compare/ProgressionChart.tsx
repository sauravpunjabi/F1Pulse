'use client';

import { useId, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { DriverSeasonsDto } from '@/lib/api';

interface ProgressionChartProps {
  seasonsA: DriverSeasonsDto;
  seasonsB: DriverSeasonsDto;
  nameA: string;
  nameB: string;
}

// ── SVG layout constants ──────────────────────────────────────────────────────
const W = 800;
const H = 260;
const PAD = { l: 52, r: 20, t: 24, b: 44 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

function buildPath(
  data: Array<{ year: number; points: number }>,
  xScale: (y: number) => number,
  yScale: (p: number) => number,
): string {
  if (data.length === 0) return '';
  const [first, ...rest] = data;
  return `M ${xScale(first!.year)},${yScale(first!.points)} ${rest.map((d) => `L ${xScale(d.year)},${yScale(d.points)}`).join(' ')}`;
}

export function ProgressionChart({
  seasonsA,
  seasonsB,
  nameA,
  nameB,
}: ProgressionChartProps) {
  const uid = useId();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  // Find seasons where both drivers competed
  const setA = new Map(seasonsA.map((s) => [s.season, s]));
  const setB = new Map(seasonsB.map((s) => [s.season, s]));
  const overlapYears = [...setA.keys()]
    .filter((y) => setB.has(y))
    .sort((a, b) => a - b);

  if (overlapYears.length < 2) {
    return (
      <section
        ref={ref}
        className="px-6 py-16 md:px-16"
        aria-label="Championship progression"
      >
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-white/30">
          Championship Progression
        </p>
        <p className="font-mono text-[0.6rem] uppercase tracking-widest text-white/20">
          {overlapYears.length === 0
            ? 'No shared seasons — careers never crossed'
            : 'Not enough shared seasons to chart'}
        </p>
      </section>
    );
  }

  const dataA = overlapYears.map((y) => ({
    year: y,
    points: setA.get(y)!.points,
    champ: setA.get(y)!.position === 1,
  }));
  const dataB = overlapYears.map((y) => ({
    year: y,
    points: setB.get(y)!.points,
    champ: setB.get(y)!.position === 1,
  }));

  const minYear = overlapYears[0]!;
  const maxYear = overlapYears[overlapYears.length - 1]!;
  const allPoints = [...dataA, ...dataB].map((d) => d.points);
  const maxPts = Math.max(...allPoints, 1);

  const xScale = (y: number) =>
    PAD.l + ((y - minYear) / (maxYear - minYear || 1)) * plotW;
  const yScale = (p: number) =>
    H - PAD.b - (p / maxPts) * plotH;

  const pathA = buildPath(dataA, xScale, yScale);
  const pathB = buildPath(dataB, xScale, yScale);

  // Subtle horizontal grid at 0%, 50%, 100% of max
  const gridLines = [0, 0.5, 1].map((f) => ({
    y: yScale(maxPts * f),
    label: Math.round(maxPts * f),
  }));

  return (
    <section
      ref={ref}
      className="px-6 py-16 md:px-16"
      aria-label="Championship progression"
    >
      <p className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-white/30">
        Championship Progression
      </p>
      <p className="mb-10 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/20">
        {overlapYears.length} shared season{overlapYears.length !== 1 ? 's' : ''}
        {' '}· {minYear}–{maxYear}
      </p>

      {/* Legend */}
      <div className="mb-6 flex gap-6">
        <div className="flex items-center gap-2">
          <div
            className="h-[2px] w-6"
            style={{ background: 'var(--compare-a, #E10600)' }}
          />
          <span className="font-mono text-[0.58rem] uppercase tracking-widest text-white/40">
            {nameA}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-[2px] w-6 bg-white/30" />
          <span className="font-mono text-[0.58rem] uppercase tracking-widest text-white/40">
            {nameB}
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        aria-hidden="true"
        className="overflow-visible"
      >
        <defs>
          {/* Clip rect that grows left-to-right on reveal */}
          <clipPath id={`${uid}-reveal`}>
            <motion.rect
              x={PAD.l}
              y={0}
              height={H}
              initial={{ width: 0 }}
              animate={inView ? { width: plotW } : { width: 0 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {gridLines.map(({ y, label }) => (
          <g key={label}>
            <line
              x1={PAD.l}
              y1={y}
              x2={W - PAD.r}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={PAD.l - 8}
              y={y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.25)"
              fontSize={10}
              fontFamily="'Courier New', monospace"
            >
              {label}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {overlapYears.map((year, i) => {
          // Show every label if ≤10 seasons, else every other
          if (overlapYears.length > 10 && i % 2 !== 0) return null;
          return (
            <text
              key={year}
              x={xScale(year)}
              y={H - PAD.b + 16}
              textAnchor="middle"
              fill="rgba(255,255,255,0.25)"
              fontSize={10}
              fontFamily="'Courier New', monospace"
            >
              {year}
            </text>
          );
        })}

        {/* Data lines + championship dots — clipped to animate in */}
        <g clipPath={`url(#${uid}-reveal)`}>
          {/* Driver B line (behind A) */}
          <path
            d={pathB}
            fill="none"
            stroke="rgba(245,245,245,0.35)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Driver A line */}
          <path
            d={pathA}
            fill="none"
            stroke="var(--compare-a, #E10600)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Championship markers — Driver A */}
          {dataA
            .filter((d) => d.champ)
            .map((d) => (
              <circle
                key={`a-champ-${d.year}`}
                cx={xScale(d.year)}
                cy={yScale(d.points)}
                r={4}
                fill="var(--compare-a, #E10600)"
                stroke="var(--bg, #050505)"
                strokeWidth={2}
              />
            ))}

          {/* Championship markers — Driver B */}
          {dataB
            .filter((d) => d.champ)
            .map((d) => (
              <circle
                key={`b-champ-${d.year}`}
                cx={xScale(d.year)}
                cy={yScale(d.points)}
                r={4}
                fill="rgba(245,245,245,0.8)"
                stroke="var(--bg, #050505)"
                strokeWidth={2}
              />
            ))}
        </g>

        {/* X axis baseline */}
        <line
          x1={PAD.l}
          y1={H - PAD.b}
          x2={W - PAD.r}
          y2={H - PAD.b}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      </svg>

      <p className="mt-4 font-mono text-[0.55rem] uppercase tracking-widest text-white/15">
        Dots mark championship seasons · Season-end points
      </p>
    </section>
  );
}
