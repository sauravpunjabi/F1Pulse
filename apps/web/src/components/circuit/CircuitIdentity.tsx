'use client';

/**
 * <CircuitIdentity> — per-circuit character class + empty tagline.
 *
 * Character traits are scaffolded per the art director's list.
 * Tagline is intentionally empty — art director writes copy.
 *
 * data-circuit-character="{key}" exposed for CSS cascade.
 */

import { SectionReveal } from '@/components/primitives';

interface CircuitCharacter {
  traits: string[];
  tagline: string; // intentionally empty — art director fills this in
}

const CIRCUIT_CHARACTERS: Record<string, CircuitCharacter> = {
  monaco: {
    traits: ['Glamorous', 'Compressed', 'Prestige'],
    tagline: '',
  },
  monza: {
    traits: ['Speed', 'Tifosi', 'Heritage'],
    tagline: '',
  },
  spa: {
    traits: ['Elevation', 'Weather', 'Danger'],
    tagline: '',
  },
  suzuka: {
    traits: ['Technical', 'Spiritual', 'Precision'],
    tagline: '',
  },
  silverstone: {
    traits: ['Historic', 'Fast', 'British'],
    tagline: '',
  },
  interlagos: {
    traits: ['Dramatic', 'Passionate', 'Legendary'],
    tagline: '',
  },
};

interface CircuitIdentityProps {
  circuitId: string;
}

export function CircuitIdentity({ circuitId }: CircuitIdentityProps) {
  const character = CIRCUIT_CHARACTERS[circuitId];
  if (!character) return null;

  return (
    <section
      className="circuit-identity px-6 py-16 md:px-16"
      data-circuit-character={circuitId}
    >
      <SectionReveal staggerDelay={0.06} preset="measured">
        {/* Trait pills */}
        <div className="flex flex-wrap gap-3">
          {character.traits.map((trait) => (
            <span
              key={trait}
              className="circuit-trait font-mono text-[0.65rem] uppercase tracking-[0.35em] text-white/40 border border-white/10 px-3 py-1.5"
            >
              {trait}
            </span>
          ))}
        </div>

        {/* Tagline — empty; art director provides copy */}
        <p
          className="circuit-tagline mt-6 max-w-2xl font-display text-[clamp(1.4rem,3vw,2.5rem)] font-black uppercase leading-tight tracking-tight text-off-white"
          data-circuit-tagline={circuitId}
          aria-hidden={!character.tagline}
        >
          {character.tagline}
        </p>
      </SectionReveal>
    </section>
  );
}
