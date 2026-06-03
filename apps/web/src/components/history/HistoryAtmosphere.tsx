'use client';

import type { CSSProperties } from 'react';

/**
 * HistoryAtmosphere — two fixed overlays layered above the history page.
 *
 * Layer 1: Horizontal scanlines
 *   repeating-linear-gradient creates 2px dark bands at 4px pitch.
 *   The scanlines-drift animation slides them 4px vertically every 8 s so
 *   they don't appear frozen against static content.
 *
 * Layer 2: Projector flicker
 *   A near-transparent white rect that pulses via the projector-flicker
 *   keyframe (defined in globals.css). Amplitude ≤0.022 opacity — at arm's
 *   length this reads as "old film" rather than "broken screen".
 *
 * Both layers sit at z-atmosphere (same as <Atmosphere>) so they composite
 * above page content without disrupting the existing vignette or grain.
 * Neither captures pointer events.
 */

const FIXED_LAYER: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 'var(--z-atmosphere)' as unknown as number,
  pointerEvents: 'none',
};

export function HistoryAtmosphere() {
  return (
    <>
      {/* Scanlines */}
      <div
        aria-hidden="true"
        style={{
          ...FIXED_LAYER,
          background:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.035) 2px, rgba(0,0,0,0.035) 4px)',
          animation: 'scanline-drift 8s linear infinite',
        }}
      />

      {/* Projector flicker */}
      <div
        aria-hidden="true"
        style={{
          ...FIXED_LAYER,
          background: 'rgba(255,255,255,1)',
          opacity: 0,
          animation: 'projector-flicker 3.7s ease-in-out infinite',
        }}
      />
    </>
  );
}
