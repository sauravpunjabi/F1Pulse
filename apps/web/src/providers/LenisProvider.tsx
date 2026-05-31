'use client';

/**
 * Lenis smooth-scroll provider.
 *
 * Initialises a single Lenis instance on mount and exposes it via context.
 * GSAP ScrollTrigger is wired to Lenis's raf loop so scroll-driven animations
 * stay frame-perfect.
 *
 * TODO: When GSAP ScrollTrigger sequences land, import ScrollTrigger here and
 * uncomment the gsap.registerPlugin / ScrollTrigger.update lines.
 *
 * TODO: Tune Lenis options (lerp, duration, easing) once the first scroll
 * sequence is choreographed. Current values are conservative defaults.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';

// ── Context ───────────────────────────────────────────────────────────────────

const LenisContext = createContext<Lenis | null>(null);

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      // TODO: tune these once scroll sequences exist
      duration: 1.2,         // TODO: target feel — snappier = lower, silkier = higher
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      // orientation: 'vertical',
      // gestureOrientation: 'vertical',
      // smoothWheel: true,
      // wheelMultiplier: 1,
    });

    lenisRef.current = lenis;

    // RAF loop — drives Lenis and (when wired) GSAP ScrollTrigger
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      // TODO: when GSAP ScrollTrigger lands, add:
      //   ScrollTrigger.update();
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Respect prefers-reduced-motion: stop smooth scrolling, use native
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) lenis.stop();
    const handleMq = (e: MediaQueryListEvent) => {
      if (e.matches) lenis.stop();
      else lenis.start();
    };
    mq.addEventListener('change', handleMq);

    return () => {
      cancelAnimationFrame(rafId);
      mq.removeEventListener('change', handleMq);
      lenis.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}
