'use client';

/**
 * /circuits — all F1 circuits ever used, sorted alphabetically.
 *
 * Displays a grid of CircuitCards with MaskReveal heading + SectionReveal stagger.
 * All data from /api/circuits — no hardcoded values.
 */

import { useCircuitsList } from '@/lib/api';
import { MaskReveal, SectionReveal } from '@/components/primitives';
import { CircuitCard } from '@/components/circuit/CircuitCard';

export default function CircuitsPage() {
  const circuits = useCircuitsList();

  return (
    <main className="min-h-dvh bg-[--bg] px-6 py-24 text-[--text-primary] md:px-16">
      {/* Page heading */}
      <MaskReveal direction="bottom" preset="cinematic" trigger="mount">
        <h1 className="mb-2 font-display text-[clamp(2.5rem,8vw,7rem)] font-black uppercase leading-none tracking-tight">
          Circuits
        </h1>
      </MaskReveal>
      <MaskReveal direction="bottom" preset="measured" delay={0.2} trigger="mount">
        <p className="mb-16 font-mono text-xs uppercase tracking-[0.25em] text-white/40">
          Every venue in Formula 1 history
        </p>
      </MaskReveal>

      {/* Loading skeleton */}
      {circuits.isLoading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden border border-white/[0.05] bg-white/[0.02]"
              aria-hidden="true"
            >
              <div className="aspect-video bg-white/[0.03]" />
              <div className="p-4">
                <div className="mb-2 h-4 w-3/4 rounded-sm bg-white/[0.05]" />
                <div className="h-2.5 w-1/2 rounded-sm bg-white/[0.03]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {circuits.isError && (
        <p className="font-mono text-sm text-white/40">
          Could not load circuits. Check your API connection.
        </p>
      )}

      {/* Grid */}
      {circuits.data && (
        <>
          <p className="mb-8 font-mono text-[0.65rem] tabular-nums uppercase tracking-[0.25em] text-white/25">
            {circuits.data.length} venues
          </p>
          <SectionReveal
            staggerDelay={0.04}
            preset="measured"
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            {circuits.data.map((circuit, i) => (
              <CircuitCard
                key={circuit.id}
                circuit={circuit}
                delay={(i % 8) * 0.06}
              />
            ))}
          </SectionReveal>
        </>
      )}
    </main>
  );
}
