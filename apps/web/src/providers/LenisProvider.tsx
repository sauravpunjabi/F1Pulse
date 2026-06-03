'use client';

/**
 * LenisProvider — smooth scroll + GSAP ScrollTrigger sync.
 *
 * INTEGRATION CONTRACT (do not change without re-testing):
 *   1. Lenis runs inside GSAP's ticker — NOT a manual requestAnimationFrame.
 *      gsap.ticker.add((time) => lenis.raf(time * 1000))
 *      GSAP time is in seconds; lenis.raf expects milliseconds.
 *   2. GSAP lag smoothing disabled so the ticker doesn't skip frames on tab
 *      refocus, which would desync Lenis from ScrollTrigger.
 *      gsap.ticker.lagSmoothing(0)
 *   3. ScrollTrigger.update() called on every Lenis scroll event so pinned
 *      elements and scrub animations track the interpolated position, not the
 *      native scroll position.
 *      lenis.on('scroll', ScrollTrigger.update)
 *   4. ScrollTrigger's scroller stays at window (default). Do NOT set a custom
 *      scroller proxy — Lenis writes to native scroll, so ST reads it correctly.
 *
 * Context value uses useState (not useRef) so consumers re-render once the
 * Lenis instance is live after mount.
 */

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePathname } from 'next/navigation';

gsap.registerPlugin(ScrollTrigger);

// ── Context ───────────────────────────────────────────────────────────────────

const LenisContext = createContext<Lenis | null>(null);

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();

  // ── Reset scroll position on every route change ───────────────────────────
  // useLayoutEffect (not useEffect) so the reset runs before the browser
  // paints the new page — no single-frame flash at the wrong scroll depth.
  useLayoutEffect(() => {
    if (!lenis) return;
    // Kill stale ScrollTriggers from the previous page first (e.g. the
    // DriverTimeline pin), then jump to top. Order matters: killing while
    // pinned restores normal flow before the scroll position changes.
    ScrollTrigger.killAll();
    lenis.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
    });

    // ── GSAP ticker sync (the only correct approach) ───────────────────────
    // Store as named reference so cleanup can remove the exact same function.
    const tickerHandler = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tickerHandler); // GSAP = seconds, Lenis = ms

    // Prevent GSAP from batching/smoothing frames on tab-refocus, which would
    // cause a single large jump that desynchronises Lenis and ScrollTrigger.
    gsap.ticker.lagSmoothing(0);

    // Keep ScrollTrigger positions in sync with Lenis's interpolated scroll.
    // This is the only lenis.on('scroll', …) handler we register.
    instance.on('scroll', ScrollTrigger.update);

    // Recalculate scroll height whenever the document body changes size.
    // Without this, Lenis caches the scroll height at init time (when async
    // content is still in loading state / short), and gets stuck once sections
    // expand after data loads. The native `resize` event only fires on viewport
    // changes, not on content-height changes, so we need ResizeObserver here.
    const ro = new ResizeObserver(() => instance.resize());
    ro.observe(document.body);

    setLenis(instance);

    // ── Reduced-motion: destroy Lenis and fall back to native scroll ────────
    // Calling instance.stop() is NOT safe — Lenis's wheel listener remains
    // active and calls preventDefault() even when stopped, which silently
    // blocks all native scroll. Destroying the instance fully restores native
    // scroll behaviour for users who have requested reduced motion.
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      instance.destroy();
      setLenis(null);
      ro.disconnect();
      gsap.ticker.remove(tickerHandler);
      return;
    }

    const handleMq = (e: MediaQueryListEvent) => {
      // Toggling reduced-motion at runtime is rare; reload is acceptable.
      if (e.matches) window.location.reload();
    };
    mq.addEventListener('change', handleMq);

    return () => {
      ro.disconnect();
      gsap.ticker.remove(tickerHandler);
      instance.off('scroll', ScrollTrigger.update);
      mq.removeEventListener('change', handleMq);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
}
