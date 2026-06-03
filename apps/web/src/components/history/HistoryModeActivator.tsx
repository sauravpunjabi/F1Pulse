'use client';

/**
 * HistoryModeActivator — mounts invisible inside history/layout.tsx.
 *
 * On mount it transforms the ENTIRE viewport into a B&W cinematic mode by
 * mutating document.body inline styles directly (not a container wrapper,
 * which would miss the Atmosphere fixed overlay).
 *
 * Mutations:
 *   filter            → grayscale(1) contrast(1.1)
 *   --grain-opacity   → 0.14  (overrides :root 0.035, inherits down to <Atmosphere>)
 *   data-history      → "true" (CSS hook for scanlines / child selectors)
 *
 * All mutations are reverted in the cleanup so navigating away is clean.
 *
 * Note: The ColorTransitionScene will OVERWRITE body.style.filter via GSAP during
 * the 1967 scrub. HistoryModeActivator sets the baseline only.
 */

import { useEffect } from 'react';

export function HistoryModeActivator() {
  useEffect(() => {
    const body = document.body;

    body.setAttribute('data-history', 'true');
    body.style.filter = 'grayscale(1) contrast(1.1)';
    body.style.setProperty('--grain-opacity', '0.14');

    return () => {
      body.removeAttribute('data-history');
      body.style.filter = '';
      body.style.removeProperty('--grain-opacity');
    };
  }, []);

  return null;
}
