'use client';

/**
 * OpeningSequence — scroll-locked cinematic boot sequence for /history.
 *
 * Scroll is locked via lenis.stop() on mount and released once the last
 * animation phase has played. Reduced-motion users see the text instantly
 * and scroll is never locked for them.
 *
 * Phase timeline (ms from mount):
 *   100  → TelemetryLine begins drawing (cinematic speed = 1.2 s)
 *   900  → "THE EVOLUTION" MaskReveal fires
 *   1300 → "OF SPEED" MaskReveal fires (+400 ms stagger)
 *   2100 → mono sub-label fades in
 *   3600 → lenis.start() — scroll unlocked, sequence complete
 *
 * The outer section is min-h-screen so it fills the viewport during the pin.
 * After lenis.start(), normal scroll takes over and the user can leave this
 * section by scrolling down into Chapter 1.
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TelemetryLine } from '@/components/primitives/TelemetryLine';
import { MaskReveal } from '@/components/primitives/MaskReveal';
import { useLenis } from '@/providers/LenisProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { transitions } from '@/lib/motion';

type Phase = 0 | 1 | 2 | 3 | 4;
//          idle telemetry line1 line2 subtitle

const PHASE_DELAYS: [number, Phase][] = [
  [100,  1],
  [900,  2],
  [1300, 3],
  [2100, 4],
];

export function OpeningSequence({ onComplete }: { onComplete?: () => void }) {
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? 4 : 0);
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useEffect(() => {
    if (reduced) {
      onComplete?.();
      return;
    }

    // Wait until lenis is ready before locking scroll.
    if (!lenis) return;

    lenis.stop();

    const timers: ReturnType<typeof setTimeout>[] = PHASE_DELAYS.map(([ms, p]) =>
      setTimeout(() => setPhase(p), ms),
    );

    const unlockTimer = setTimeout(() => {
      lenisRef.current?.start();
      onComplete?.();
    }, 3600);

    return () => {
      [...timers, unlockTimer].forEach(clearTimeout);
      lenisRef.current?.start();
    };
  }, [lenis, reduced, onComplete]);

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
      aria-label="History mode opening sequence"
    >
      {/* TelemetryLine — horizontal circuit trace, slow cinematic draw */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            key="telemetry"
            className="absolute inset-x-0 top-[38%] px-8 opacity-25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={transitions.measured}
          >
            <TelemetryLine
              trigger="mount"
              speed="cinematic"
              stroke="var(--color-off-white)"
              strokeWidth={1}
              className="h-10 w-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centred text block */}
      <div className="relative z-10 text-center">
        {/* Line 1 */}
        {phase >= 2 && (
          <MaskReveal direction="bottom" preset="cinematic" trigger="mount">
            <h1
              className="font-display font-black uppercase leading-none tracking-[-0.02em] text-white"
              style={{ fontSize: 'clamp(2.5rem, 9vw, 8.5rem)' }}
            >
              THE EVOLUTION
            </h1>
          </MaskReveal>
        )}

        {/* Line 2 — 400 ms after line 1 */}
        {phase >= 3 && (
          <MaskReveal direction="bottom" preset="cinematic" trigger="mount">
            <h1
              className="font-display font-black uppercase leading-none tracking-[-0.02em] text-white/80"
              style={{ fontSize: 'clamp(2.5rem, 9vw, 8.5rem)' }}
            >
              OF SPEED
            </h1>
          </MaskReveal>
        )}

        {/* Sub-label */}
        {phase >= 4 && (
          <motion.p
            key="subtitle"
            className="mt-10 font-mono text-[0.65rem] uppercase tracking-[0.38em] text-white/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
          >
            FORMULA ONE · 1950 → 2026
          </motion.p>
        )}
      </div>

      {/* Scroll cue — only after sequence completes */}
      {phase >= 4 && (
        <motion.div
          className="absolute bottom-12 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-white/25">
            Scroll
          </span>
          <motion.div
            className="h-8 w-px bg-white/20"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top' }}
          />
        </motion.div>
      )}
    </section>
  );
}
