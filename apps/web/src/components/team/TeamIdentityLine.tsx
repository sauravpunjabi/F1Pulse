'use client';

/**
 * TeamIdentityLine — one oversized prose sentence.
 *
 * Reads from teamCopy[constructorId]. If the art director hasn't written
 * copy yet (empty string), falls back to "The story of {name}."
 *
 * TODO: Art director fills in teamCopy entries in constructorThemes.ts.
 */

import { MaskReveal } from '@/components/primitives';
import { teamCopy } from '@/lib/constructorThemes';

interface TeamIdentityLineProps {
  constructorId: string;
  name: string;
}

export function TeamIdentityLine({ constructorId, name }: TeamIdentityLineProps) {
  const copy = teamCopy[constructorId] || `The story of ${name}.`;

  return (
    <section
      className="team-identity px-6 py-16 md:px-16"
      aria-label="Team identity"
    >
      <MaskReveal direction="bottom" preset="cinematic" trigger="scroll">
        <p className="max-w-4xl font-display text-[clamp(1.5rem,4vw,3.5rem)] font-black uppercase leading-tight tracking-tight text-white/90">
          {copy}
        </p>
      </MaskReveal>
    </section>
  );
}
