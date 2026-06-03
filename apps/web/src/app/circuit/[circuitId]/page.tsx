'use client';

/**
 * /circuit/[circuitId] — immersive circuit profile page.
 *
 * Page sequence (choreographed top → bottom):
 *   1. CircuitHero       — full-viewport hero with ImageReveal + MaskReveal name
 *   2. CircuitIdentity   — per-circuit character class + tagline scaffold
 *   3. CircuitTrackMap   — lat/lng projected to minimal SVG dark map
 *   4. CircuitRaceHistory — last 10 race winners, SectionReveal stagger
 *   5. CircuitStats      — total races, first year, most wins — CountUp
 *   6. CircuitEraContext — era badges for every era this circuit hosted
 *
 * data-circuit="{circuitId}" at <main> — art director adds per-circuit CSS.
 * All data from /api/circuit/:circuitId — zero hardcoded values.
 */

import { useCircuitProfile } from '@/lib/api';
import { CircuitHero } from '@/components/circuit/CircuitHero';
import { CircuitIdentity } from '@/components/circuit/CircuitIdentity';
import { CircuitTrackMap } from '@/components/circuit/CircuitTrackMap';
import { CircuitRaceHistory } from '@/components/circuit/CircuitRaceHistory';
import { CircuitStats } from '@/components/circuit/CircuitStats';
import { CircuitEraContext } from '@/components/circuit/CircuitEraContext';

interface PageProps {
  params: { circuitId: string };
}

export default function CircuitPage({ params }: PageProps) {
  const { circuitId } = params;
  const profile = useCircuitProfile(circuitId);

  if (profile.isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <span className="animate-pulse font-mono text-xs uppercase tracking-widest text-white/30">
          Loading
        </span>
      </main>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-white/30">
            Circuit not found
          </p>
          <p className="mt-2 font-display text-2xl text-white/60">{circuitId}</p>
        </div>
      </main>
    );
  }

  const circuit = profile.data;

  return (
    <main
      className="relative bg-[--bg] text-[--text-primary]"
      data-circuit={circuitId}
    >
      {/* 1 — Hero */}
      <CircuitHero circuit={circuit} circuitId={circuitId} />

      {/* 2 — Identity (only for known circuits with scaffolded copy) */}
      <CircuitIdentity circuitId={circuitId} />

      {/* Divider */}
      <div className="mx-6 border-t border-white/[0.06] md:mx-16" aria-hidden="true" />

      {/* 3 — Track map */}
      <CircuitTrackMap
        lat={circuit.lat}
        lng={circuit.lng}
        name={circuit.name}
        locality={circuit.locality}
        country={circuit.country}
      />

      {/* Divider */}
      <div className="mx-6 border-t border-white/[0.06] md:mx-16" aria-hidden="true" />

      {/* 4 — Race history */}
      <CircuitRaceHistory races={circuit.recentRaces} />

      {/* Divider */}
      <div className="mx-6 border-t border-white/[0.06] md:mx-16" aria-hidden="true" />

      {/* 5 — Stats */}
      <CircuitStats profile={circuit} />

      {/* Divider */}
      <div className="mx-6 border-t border-white/[0.06] md:mx-16" aria-hidden="true" />

      {/* 6 — Era context */}
      <CircuitEraContext eras={circuit.eras} firstYear={circuit.firstRaceYear} />
    </main>
  );
}
