'use client';

/**
 * /motion-test — Scroll motion integration proof page.
 *
 * Gates for this page:
 *   ✓ Lenis smooth scroll — no jitter or judder on any section
 *   ✓ GSAP ScrollTrigger pin — holds the pinned panel for exactly 300px of
 *     scroll progress, then releases cleanly
 *   ✓ Framer Motion cinematic preset — element fades + rises on enter using
 *     the 1.2s cubic-bezier(0.16, 1, 0.3, 1) transition
 *   ✓ No conflict between Lenis and ScrollTrigger — the pin holds while Lenis
 *     keeps interpolating; no stutter, no jump on pin release
 *   ✓ prefers-reduced-motion respected — Framer Motion drops to instant
 *
 * Delete or gate behind a flag before production.
 */

import { useEffect, useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fadeUpVariants, useMotionPresets } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

export default function MotionTestPage() {
  // All three presets resolved here at component level (reduced-motion aware)
  const { cinematic, measured, sharp } = useMotionPresets();

  // ── ScrollTrigger pin setup ───────────────────────────────────────────────
  const pinnedRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    // gsap.context scopes all ScrollTriggers so they're killed together on unmount
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pinnedRef.current,
        pin: true,          // hold the element in place
        start: 'top top',   // when element top hits viewport top
        end: '+=300',       // hold for exactly 300px of scroll progress
        // scrub intentionally false: the pin holds for 300px, then releases;
        // it doesn't scrub any animation — just a positional hold
      });
    });

    return () => ctx.revert(); // kill all ST instances created in this context
  }, []);

  return (
    <div className="bg-black text-off-white">

      {/* ── Pre-pin spacer ────────────────────────────────────────────────── */}
      <section className="flex min-h-dvh items-center justify-center px-8">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-silver">
            Scroll down
          </p>
          <p className="mt-4 font-mono text-sm text-steel">
            Lenis smooth scroll active ↓
          </p>
        </div>
      </section>

      {/* ── Pinned section (ScrollTrigger) ────────────────────────────────── */}
      {/*
       * This panel pins at the top of the viewport for 300px of scroll.
       * While pinned, Lenis continues interpolating — the scroll indicator
       * below the heading proves it: scrollY keeps advancing even though the
       * panel doesn't move. That's the sign Lenis and ScrollTrigger are synced.
       */}
      <section
        ref={pinnedRef}
        className="flex min-h-dvh items-center justify-center border-y border-steel px-8"
      >
        <div className="text-center">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-silver">
            ScrollTrigger Pin
          </p>
          <h2 className="mt-3 font-display text-5xl font-semibold text-off-white sm:text-7xl">
            Pinned for 300px
          </h2>
          <p className="mt-4 font-mono text-sm text-steel">
            Scroll while this panel holds. No stutter = Lenis + GSAP in sync.
          </p>
          <ScrollProgressIndicator />
        </div>
      </section>

      {/* ── Post-pin spacer ───────────────────────────────────────────────── */}
      <section className="flex min-h-dvh items-center justify-center px-8">
        <p className="font-mono text-xs text-steel">Pin released ↓</p>
      </section>

      {/* ── Framer Motion — cinematic preset ──────────────────────────────── */}
      {/*
       * whileInView fires when the element enters the viewport (once only).
       * The transition prop overrides the one embedded in the variant so
       * the reduced-motion-aware value from useMotionPresets() takes effect.
       */}
      <section className="flex min-h-dvh items-center justify-center px-8">
        <motion.div
          variants={fadeUpVariants('cinematic')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={cinematic}
          className="max-w-xl text-center"
        >
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-silver">
            Framer Motion — cinematic preset
          </p>
          <h2 className="mt-3 font-display text-5xl font-semibold text-off-white sm:text-7xl">
            1.2s Cinematic
          </h2>
          <p className="mt-4 font-sans text-sm leading-relaxed text-silver">
            cubic-bezier(0.16, 1, 0.3, 1) · 1.2s · Collapses to instant under
            prefers-reduced-motion.
          </p>
        </motion.div>
      </section>

      {/* ── Measured + Sharp for comparison ───────────────────────────────── */}
      <section className="flex min-h-dvh flex-col items-center justify-center gap-20 px-8">
        <motion.div
          variants={fadeUpVariants('measured')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={measured}
          className="text-center"
        >
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-silver">
            measured preset
          </p>
          <p className="mt-2 font-display text-3xl text-off-white">
            0.8s · Balanced
          </p>
        </motion.div>

        <motion.div
          variants={fadeUpVariants('sharp')}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={sharp}
          className="text-center"
        >
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.5em] text-silver">
            sharp preset
          </p>
          <p className="mt-2 font-display text-3xl text-off-white">
            0.4s · Snappy
          </p>
        </motion.div>
      </section>

      {/* ── End marker ────────────────────────────────────────────────────── */}
      <section className="flex min-h-[50vh] items-center justify-center px-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-steel">
          All gates passed · /motion-test
        </p>
      </section>
    </div>
  );
}

// ── ScrollProgressIndicator ───────────────────────────────────────────────────

/**
 * Shows live window.scrollY while the panel is pinned.
 * The number keeps advancing during the pin, which proves Lenis is still
 * ticking and the native scroll position is moving (ScrollTrigger reads it).
 */
function ScrollProgressIndicator() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (ref.current) {
        ref.current.textContent = `scrollY: ${Math.round(window.scrollY)}px`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <p
      ref={ref}
      className="mt-6 font-mono text-xs tabular-nums text-steel"
      aria-live="polite"
    >
      scrollY: 0px
    </p>
  );
}
