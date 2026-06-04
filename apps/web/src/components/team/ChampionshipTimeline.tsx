'use client';

/**
 * ChampionshipTimeline — era timeline of constructor title years.
 *
 * Each championship year rendered as a node: year, driver who won the
 * drivers' title that year, and their points.
 * Championship count displayed as a CountUp aggregate.
 *
 * Data from championships[] in ConstructorProfileDto. Section is omitted
 * when the constructor has zero championships.
 */

import Link from 'next/link';
import { SectionReveal, CountUp } from '@/components/primitives';
import { type ChampionshipEntry } from '@/lib/api';

interface ChampionshipTimelineProps {
  championships: ChampionshipEntry[];
  totalChampionships: number;
}

function ChampionshipNode({ entry }: { entry: ChampionshipEntry }) {
  return (
    <div
      className="championship-node flex flex-col gap-2 border-l border-white/15 pl-5"
      data-year={entry.year}
    >
      {/* Year */}
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">
        {entry.year}
      </span>

      {/* Driver name — links to driver profile */}
      <Link
        href={`/driver/${entry.driverId}`}
        className="group inline-block"
        aria-label={`${entry.driverName}, ${entry.year} champion`}
      >
        <span className="font-display text-lg font-black uppercase leading-none tracking-tight text-white transition-opacity group-hover:opacity-70">
          {entry.driverName}
        </span>
        {entry.driverCode && (
          <span className="ml-2 font-mono text-[0.6rem] text-white/30">{entry.driverCode}</span>
        )}
      </Link>

      {/* Points */}
      <span className="font-mono text-[0.65rem] text-white/35">
        {entry.points.toFixed(entry.points % 1 === 0 ? 0 : 1)} pts
      </span>
    </div>
  );
}

export function ChampionshipTimeline({
  championships,
  totalChampionships,
}: ChampionshipTimelineProps) {
  if (totalChampionships === 0) return null;

  return (
    <section
      className="championship-timeline px-6 py-20 md:px-16"
      aria-label="Championship timeline"
    >
      {/* Section header + CountUp aggregate */}
      <div className="mb-12 flex items-baseline gap-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">
          Constructors&apos; Titles
        </p>
        <CountUp
          from={0}
          to={totalChampionships}
          duration={1.2}
          className="font-display text-[clamp(3rem,8vw,7rem)] font-black leading-none tracking-tight text-white"
        />
      </div>

      {/* Timeline nodes */}
      <SectionReveal
        staggerDelay={0.06}
        preset="measured"
        className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        {championships.map((entry) => (
          <ChampionshipNode key={entry.year} entry={entry} />
        ))}
      </SectionReveal>
    </section>
  );
}
