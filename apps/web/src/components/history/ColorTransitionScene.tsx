'use client';

/**
 * ColorTransitionScene — the site's signature moment.
 *
 * As the user scrolls through this section (~2 600 px of pinned scroll),
 * a GSAP ScrollTrigger scrubs a timeline that:
 *
 *   0 % → 80 %   grayscale(1) → grayscale(0)  +  saturate(0) → saturate(1)
 *   10 % → 35 %  Ferrari red overlay grows upward from the bottom (clip-path),
 *                 peaking at ~30 % viewport height — red arrives BEFORE full colour
 *   35 % → 65 %  red overlay recedes back down
 *   60 % → 90 %  grain opacity 0.14 → 0.035 (history grain lightens)
 *   82 %          "BRITISH GRAND PRIX / 1967" text reveals via MaskReveal
 *
 * Architecture: single element, ref on it, GSAP pins it directly.
 * Identical pattern to EraChapter — one div, pin: true on itself.
 * No outer wrapper + sticky inside (that pattern fights GSAP's fixed positioning).
 *
 * GSAP animates plain JS proxy objects and writes body.style.filter in
 * onUpdate — avoids GSAP attempting to parse the compound filter shorthand.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MaskReveal } from '@/components/primitives/MaskReveal';
import { useEraContext } from '@/contexts/EraContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { transitions } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const PIN_DURATION = 2600; // px of scroll while panel stays fixed

export function ColorTransitionScene() {
  // Single ref on the panel — GSAP pins this element directly (same as EraChapter)
  const panelRef  = useRef<HTMLDivElement>(null);
  const ferrariRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { setColorProgress, setActiveChapter } = useEraContext();
  const [showMarker, setShowMarker] = useState(false);
  const markerShown = useRef(false);

  useEffect(() => {
    if (!panelRef.current) return;

    // Reduced-motion: skip to full colour instantly
    if (reduced) {
      document.body.style.filter = '';
      document.body.style.removeProperty('--grain-opacity');
      setColorProgress(1);
      setActiveChapter(2);
      setShowMarker(true);
      return;
    }

    const ctx = gsap.context(() => {
      // Proxy objects — GSAP animates numbers, we write body.style in onUpdate
      // Avoids GSAP parsing the compound filter shorthand which it can't do.
      const filterProxy = { grayscale: 1, saturate: 0 };
      const grainProxy  = { opacity: 0.14 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panelRef.current,
          start: 'top top',
          end: `+=${PIN_DURATION}`,
          scrub: 1.2,
          pin: true,          // pin the panel itself — GSAP adds spacer automatically
          anticipatePin: 1,
          onEnter:     () => setActiveChapter(1),
          onEnterBack: () => setActiveChapter(1),
          onUpdate(self) {
            setColorProgress(self.progress);

            if (self.progress >= 0.82 && !markerShown.current) {
              markerShown.current = true;
              setShowMarker(true);
            }
            if (self.progress < 0.80 && markerShown.current) {
              markerShown.current = false;
              setShowMarker(false);
            }
          },
        },
      });

      // ── Step 1 + 2: body filter scrubs from B&W → full colour ─────────────
      tl.to(filterProxy, {
        grayscale: 0,
        saturate: 1,
        duration: 0.8,
        ease: 'none',
        onUpdate() {
          document.body.style.filter =
            `grayscale(${filterProxy.grayscale.toFixed(4)}) contrast(1.1) saturate(${filterProxy.saturate.toFixed(4)})`;
        },
      }, 0);

      // ── Step 3: Ferrari red overlay rises from bottom, peaks, recedes ──────
      if (ferrariRef.current) {
        tl.fromTo(
          ferrariRef.current,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(50% 0% 0% 0%)', duration: 0.25, ease: 'none' },
          0.1,
        );
        tl.to(
          ferrariRef.current,
          { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.35, ease: 'power1.in' },
          0.35,
        );
      }

      // ── Step 4: grain lightens as colour arrives ───────────────────────────
      tl.to(grainProxy, {
        opacity: 0.035,
        duration: 0.3,
        ease: 'none',
        onUpdate() {
          document.body.style.setProperty(
            '--grain-opacity',
            String(grainProxy.opacity.toFixed(4)),
          );
        },
      }, 0.6);

    }, panelRef);

    return () => {
      ctx.revert();
      markerShown.current = false;
    };
  }, [reduced, setColorProgress, setActiveChapter]);

  return (
    /*
     * Single div — ref here, GSAP pins this element.
     * min-h-screen ensures GSAP sees a non-zero height trigger.
     * bg-[var(--bg)] gives a solid black floor so nothing bleeds through.
     * overflow-hidden clips the Ferrari overlay to this viewport.
     */
    <div
      ref={panelRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg)]"
      aria-label="1967 — The moment colour arrived in Formula One"
    >
      {/* ── Ferrari red overlay — clip-path driven by GSAP ─────────────────── */}
      <div
        ref={ferrariRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: '#E10600',
          clipPath: 'inset(100% 0% 0% 0%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex w-full flex-col items-center gap-0 px-6 text-center">

        {/* Year — Ferrari red. Reads as mid-gray in B&W, snaps red when colour arrives. */}
        <p
          className="mb-10 font-mono text-[0.65rem] uppercase tracking-[0.4em]"
          style={{ color: '#E10600' }}
        >
          1967
        </p>

        {/* Pre-transition state */}
        {!showMarker && (
          <div className="flex flex-col items-center gap-8">
            {/* Main title — red in colour mode, gray in B&W */}
            <h2
              className="font-display font-black uppercase leading-none tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 8rem)', color: '#E10600' }}
            >
              The Colour<br />Arrives
            </h2>

            {/* Colour swatch strip — each block is a distinct hue.
                Under grayscale they look like different shades of gray.
                When colour lands, they snap to their true team colours.
                This makes the transition impossible to miss. */}
            <div className="flex h-2 w-full max-w-md overflow-hidden rounded-full">
              {[
                '#E10600', // Ferrari red
                '#FF8000', // McLaren orange
                '#00D2BE', // Mercedes teal
                '#3671C6', // Red Bull blue
                '#006EFF', // Williams
                '#B6BABD', // Haas silver
              ].map((color) => (
                <div key={color} className="flex-1" style={{ background: color }} />
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px w-10 bg-white/20" />
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.35em] text-white/50">
                Scroll to witness
              </p>
              <div className="h-px w-10 bg-white/20" />
            </div>
          </div>
        )}

        {/* Post-transition reveal — fires at 82 % scroll progress */}
        {showMarker && (
          <motion.div
            key="marker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={transitions.cinematic}
            className="flex flex-col items-center gap-6"
          >
            <MaskReveal direction="bottom" preset="cinematic" trigger="mount">
              <h2
                className="font-display font-black uppercase leading-none tracking-[-0.02em] text-white"
                style={{ fontSize: 'clamp(2.5rem, 8vw, 8rem)' }}
              >
                British Grand Prix
              </h2>
            </MaskReveal>
            <MaskReveal direction="bottom" preset="measured" trigger="mount" delay={0.3}>
              <p
                className="font-mono text-xs uppercase tracking-[0.35em]"
                style={{ color: '#E10600' }}
              >
                1967 — The Moment Colour Arrived
              </p>
            </MaskReveal>
          </motion.div>
        )}
      </div>

      {/* ── Bottom accent line ─────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 h-px w-full" style={{ background: '#E10600', opacity: 0.3 }} />
    </div>
  );
}
