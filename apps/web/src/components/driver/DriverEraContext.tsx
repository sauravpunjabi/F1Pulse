'use client';

/**
 * DriverEraContext — era membership badges.
 *
 * Derives which F1 era(s) a driver raced in from their career season list,
 * then renders a badge for each era linking to /history.
 *
 * TODO: /history page doesn't exist yet — update the link once it does.
 * TODO: Era definitions in driverThemes.ts may be revised by the art director.
 */

import Link from 'next/link';
import { SectionReveal } from '@/components/primitives';
import { getDriverEras, type EraBand } from '@/lib/driverThemes';
import { type DriverCareerSeasonDto } from '@/lib/api';

interface DriverEraContextProps {
  career: DriverCareerSeasonDto[];
}

function EraBadge({ era }: { era: EraBand }) {
  const years =
    era.to === 9999
      ? `${era.from} –`
      : `${era.from} – ${era.to}`;

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

export function DriverEraContext({ career }: DriverEraContextProps) {
  const seasons = career.map((s) => s.season);
  const eras = getDriverEras(seasons);

  if (eras.length === 0) return null;

  return (
    <section
      className="driver-era-context px-6 py-16 md:px-16"
      aria-label="Era context"
    >
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-white/40">
        Era
      </p>
      <SectionReveal staggerDelay={0.06} className="flex flex-wrap gap-3">
        {eras.map((era) => (
          <EraBadge key={era.label} era={era} />
        ))}
      </SectionReveal>
    </section>
  );
}
