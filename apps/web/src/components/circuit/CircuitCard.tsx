'use client';

/**
 * <CircuitCard> — grid card for the /circuits listing.
 *
 * Displays: circuit name, country, first race year, total races.
 * Placeholder image via ImageReveal — art director replaces.
 * Links to /circuit/[id].
 */

import Link from 'next/link';
import { ImageReveal } from '@/components/history/ImageReveal';
import type { CircuitListItemDto } from '@/lib/api';

interface CircuitCardProps {
  circuit: CircuitListItemDto;
  delay?: number;
}

export function CircuitCard({ circuit, delay = 0 }: CircuitCardProps) {
  const location = [circuit.locality, circuit.country].filter(Boolean).join(', ');

  return (
    <Link
      href={`/circuit/${circuit.id}`}
      className="circuit-card group relative flex flex-col overflow-hidden border border-white/[0.07] transition-colors hover:border-white/20"
      data-circuit-id={circuit.id}
    >
      {/* Placeholder image */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0c0c0d]">
        <ImageReveal
          src={`https://placehold.co/640x360/0c0c0d/1a1a1d`}
          alt={circuit.name}
          fill
          delay={delay}
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {/* Country label overlay */}
        {circuit.country && (
          <span className="absolute right-2 top-2 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-white/30">
            {circuit.country}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p
            className="font-display font-black uppercase leading-tight text-off-white transition-opacity group-hover:opacity-80"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
          >
            {circuit.name}
          </p>
          {location && (
            <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-white/35">
              {location}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[0.6rem] tabular-nums text-white/25">
            {circuit.firstRaceYear > 0 ? `Since ${circuit.firstRaceYear}` : '—'}
          </span>
          <span className="font-mono text-[0.6rem] tabular-nums text-white/25">
            {circuit.totalRaces} {circuit.totalRaces === 1 ? 'race' : 'races'}
          </span>
        </div>
      </div>
    </Link>
  );
}
