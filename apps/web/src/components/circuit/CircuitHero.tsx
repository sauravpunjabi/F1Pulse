'use client';

/**
 * <CircuitHero> — full-viewport opening for /circuit/[circuitId].
 *
 * Layout:
 *   - Placeholder image via ImageReveal (art director swaps in real photography)
 *   - Bottom gradient overlay for text legibility
 *   - Circuit name (giant) via MaskReveal
 *   - Locality · country in mono below
 *
 * data-circuit="{circuitId}" is set on the parent <main> — this component
 * inherits it for per-circuit CSS cascade.
 */

import { MaskReveal } from '@/components/primitives';
import { ImageReveal } from '@/components/history/ImageReveal';
import type { CircuitProfileDto } from '@/lib/api';

interface CircuitHeroProps {
  circuit: CircuitProfileDto;
  circuitId: string;
}

export function CircuitHero({ circuit, circuitId }: CircuitHeroProps) {
  const location = [circuit.locality, circuit.country].filter(Boolean).join(' · ');

  return (
    <section
      className="circuit-hero relative flex min-h-dvh w-full items-end overflow-hidden"
      aria-label={`${circuit.name} hero`}
    >
      {/* Placeholder image — art director replaces via [data-circuit] CSS */}
      <ImageReveal
        src={`https://placehold.co/1920x1080/0c0c0d/222226`}
        alt={`${circuit.name} circuit`}
        fill
        parallax
        priority
        className="circuit-image absolute inset-0"
      />

      {/* Bottom vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
        aria-hidden="true"
      />

      {/* Text — anchored bottom-left */}
      <div className="relative z-10 w-full px-6 pb-12 md:px-16 md:pb-20">
        {location && (
          <MaskReveal direction="bottom" preset="measured" delay={0.1} trigger="mount">
            <p className="mb-1 font-mono text-sm uppercase tracking-[0.25em] text-white/60">
              {location}
            </p>
          </MaskReveal>
        )}

        <MaskReveal direction="bottom" preset="cinematic" delay={0.2} trigger="mount">
          <h1
            className="circuit-name font-display font-black uppercase leading-none tracking-tight text-white"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 10rem)' }}
            data-circuit={circuitId}
          >
            {circuit.name}
          </h1>
        </MaskReveal>

        <MaskReveal direction="bottom" preset="measured" delay={0.45} trigger="mount">
          <div className="mt-4 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-white/50">
            {circuit.firstRaceYear > 0 && <span>Since {circuit.firstRaceYear}</span>}
            {circuit.firstRaceYear > 0 && circuit.totalRaces > 0 && (
              <span aria-hidden="true">·</span>
            )}
            {circuit.totalRaces > 0 && <span>{circuit.totalRaces} Races</span>}
          </div>
        </MaskReveal>
      </div>
    </section>
  );
}
