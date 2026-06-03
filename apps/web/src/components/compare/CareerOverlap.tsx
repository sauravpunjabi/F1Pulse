'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { DriverSeasonsDto } from '@/lib/api';

interface CareerOverlapProps {
  seasonsA: DriverSeasonsDto;
  seasonsB: DriverSeasonsDto;
  nameA: string;
  nameB: string;
}

export function CareerOverlap({
  seasonsA,
  seasonsB,
  nameA,
  nameB,
}: CareerOverlapProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const yearsA = new Set(seasonsA.map((s) => s.season));
  const yearsB = new Set(seasonsB.map((s) => s.season));
  const champA = new Set(
    seasonsA.filter((s) => s.position === 1).map((s) => s.season),
  );
  const champB = new Set(
    seasonsB.filter((s) => s.position === 1).map((s) => s.season),
  );

  const allYears = [...new Set([...yearsA, ...yearsB])].sort((a, b) => a - b);
  if (!allYears.length) return null;

  const minYear = allYears[0]!;
  const maxYear = allYears[allYears.length - 1]!;
  // Full range including any gap years between careers
  const fullRange = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i,
  );

  const overlapCount = fullRange.filter(
    (y) => yearsA.has(y) && yearsB.has(y),
  ).length;

  return (
    <section
      ref={ref}
      className="px-6 py-16 md:px-16"
      aria-label="Career overlap timeline"
    >
      <p className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-white/30">
        Career Overlap
      </p>
      <p className="mb-8 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white/20">
        {overlapCount > 0
          ? `${overlapCount} shared season${overlapCount !== 1 ? 's' : ''}`
          : 'No shared seasons'}
      </p>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-5 rounded-[1px]"
            style={{ background: 'var(--compare-a, #E10600)' }}
          />
          <span className="font-mono text-[0.58rem] uppercase tracking-widest text-white/40">
            {nameA}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-5 rounded-[1px] bg-white/25" />
          <span className="font-mono text-[0.58rem] uppercase tracking-widest text-white/40">
            {nameB}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-5 rounded-[1px]"
            style={{
              background:
                'linear-gradient(90deg, var(--compare-a, #E10600), rgba(245,245,245,0.4))',
            }}
          />
          <span className="font-mono text-[0.58rem] uppercase tracking-widest text-white/40">
            Shared
          </span>
        </div>
      </div>

      {/* Timeline bar grid */}
      <div className="overflow-x-auto pb-2">
        <div
          className="flex gap-[3px]"
          style={{ minWidth: `${fullRange.length * 36}px` }}
          role="list"
          aria-label="Year by year career timeline"
        >
          {fullRange.map((year, i) => {
            const hasA = yearsA.has(year);
            const hasB = yearsB.has(year);
            const isOverlap = hasA && hasB;
            const isEmpty = !hasA && !hasB;
            const isChampA = champA.has(year);
            const isChampB = champB.has(year);

            let bg: string;
            if (isOverlap) {
              bg = 'linear-gradient(90deg, var(--compare-a, #E10600) 0%, rgba(245,245,245,0.35) 100%)';
            } else if (hasA) {
              bg = 'var(--compare-a, #E10600)';
            } else if (hasB) {
              bg = 'rgba(245,245,245,0.22)';
            } else {
              bg = 'rgba(255,255,255,0.03)';
            }

            // Show year label on first, last, and every 5th year
            const showLabel =
              year === minYear ||
              year === maxYear ||
              year % 5 === 0;

            return (
              <motion.div
                key={year}
                role="listitem"
                aria-label={`${year}${hasA && hasB ? ': both' : hasA ? `: ${nameA}` : hasB ? `: ${nameB}` : ': neither'}`}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={inView ? { opacity: 1, scaleY: 1 } : {}}
                transition={{
                  duration: 0.35,
                  delay: i * 0.015,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col items-center"
                style={{ transformOrigin: 'bottom' }}
              >
                {/* Championship indicators above bar */}
                <div className="mb-1 flex h-3 items-end gap-0.5">
                  {isChampA && (
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: 'var(--compare-a, #E10600)' }}
                      aria-label={`${nameA} championship`}
                    />
                  )}
                  {isChampB && (
                    <div
                      className="h-2 w-2 rounded-full bg-white/60"
                      aria-label={`${nameB} championship`}
                    />
                  )}
                </div>

                {/* Year bar */}
                <div
                  className="w-7 rounded-[1px]"
                  style={{
                    height: isEmpty ? '28px' : '44px',
                    background: bg,
                    border: isEmpty
                      ? '1px solid rgba(255,255,255,0.05)'
                      : 'none',
                  }}
                />

                {/* Year label */}
                <div className="mt-1.5 h-4">
                  {showLabel && (
                    <span
                      className="font-mono text-[0.48rem] text-white/25"
                      style={{ writingMode: 'horizontal-tb' }}
                    >
                      {year}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
