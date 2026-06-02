'use client';

/**
 * TeamEraContext — era membership badges for a constructor.
 *
 * Derived from firstSeason / lastSeason span. Each badge links to /history.
 * Uses the same eraBands definition as DriverEraContext.
 *
 * TODO: /history page doesn't exist yet — update links once it does.
 */

import Link from 'next/link';
import { SectionReveal } from '@/components/primitives';
import { getConstructorEras, type EraBand } from '@/lib/constructorThemes';

interface TeamEraContextProps {
  firstSeason: number | null;
  lastSeason: number | null;
}

function EraBadge({ era }: { era: EraBand }) {
  const years = era.to === 9999 ? `${era.from} –` : `${era.from} – ${era.to}`;

  return (
    <Link
      href="/history"
      className="group inline-flex flex-col gap-1 rounded border border-white/10 px-5 py-4 transition-colors hover:border-white/25"
      aria-label={`${era.label} era, view in history`}
    >
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-white/30 transition-colors group-hover:text-white/50">
        {years}
      </span>
      <span className="text-sm text-white/70 transition-colors group-hover:text-white/90">
        {era.label}
      </span>
    </Link>
  );
}

export function TeamEraContext({ firstSeason, lastSeason }: TeamEraContextProps) {
  const eras = getConstructorEras(firstSeason, lastSeason);
  if (eras.length === 0) return null;

  return (
    <section className="team-era-context px-6 py-16 md:px-16" aria-label="Era context">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-white/40">Era</p>
      <SectionReveal staggerDelay={0.06} className="flex flex-wrap gap-3">
        {eras.map((era) => (
          <EraBadge key={era.label} era={era} />
        ))}
      </SectionReveal>
    </section>
  );
}
