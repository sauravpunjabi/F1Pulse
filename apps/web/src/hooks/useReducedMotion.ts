'use client';

import { useEffect, useState } from 'react';

/**
 * useReducedMotion — SSR-safe prefers-reduced-motion hook.
 *
 * Returns true if the user has requested reduced motion via their OS.
 * Defaults to false on the server (no window/matchMedia available) and
 * on first render, then hydrates to the real value after mount.
 *
 * Usage:
 *   const reduced = useReducedMotion();
 *   const duration = reduced ? 0.01 : 1.2;
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
