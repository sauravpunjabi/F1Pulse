'use client';

/**
 * TeamDriverGrid — grid of all drivers who raced for this constructor.
 *
 * Data from drivers[] in ConstructorProfileDto. Each card links to /driver/[id].
 * Layout mirrors the drivers listing page pattern.
 */

import Link from 'next/link';
import { SectionReveal } from '@/components/primitives';
import { type DriverRef } from '@/lib/api';

interface TeamDriverGridProps {
  drivers: DriverRef[];
  constructorId: string;
}

function DriverCard({ driver }: { driver: DriverRef }) {
  return (
    <Link
      href={`/driver/${driver.id}`}
      className="team-driver-card group relative flex flex-col justify-end overflow-hidden rounded border border-white/10 p-5 transition-colors hover:border-white/25 hover:bg-white/[0.03]"
      data-driver-id={driver.id}
      aria-label={`${driver.givenName} ${driver.familyName}`}
    >
      {/* Portrait placeholder */}
      <div
        className="driver-portrait pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* Driver name */}
      <div className="mt-8">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
          {driver.givenName}
        </p>
        <p className="font-display text-xl font-black uppercase leading-tight text-white">
          {driver.familyName}
        </p>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] text-white/30">
        {driver.code && <span>{driver.code}</span>}
        {driver.nationality && <span>{driver.nationality}</span>}
      </div>
    </Link>
  );
}

export function TeamDriverGrid({ drivers, constructorId }: TeamDriverGridProps) {
  if (drivers.length === 0) return null;

  return (
    <section
      className="team-driver-grid px-6 py-16 md:px-16"
      data-constructor-id={constructorId}
      aria-label="Notable drivers"
    >
      <p className="mb-8 font-mono text-xs uppercase tracking-[0.25em] text-white/40">
        Drivers
      </p>
      <SectionReveal
        staggerDelay={0.04}
        preset="measured"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        {drivers.map((driver) => (
          <DriverCard key={driver.id} driver={driver} />
        ))}
      </SectionReveal>
    </section>
  );
}
