'use client';

/**
 * <StartLightsLoader>
 *
 * The F1 start-light sequence, used as the homepage's initial loader.
 *
 * Choreography (matches the real thing — "lights out and away we go"):
 *   1. Five pods illuminate red one by one, staggered 400ms each.
 *   2. They hold, all lit.
 *   3. On `ready`, they go OUT simultaneously (the start signal).
 *   4. After a beat, the whole loader wipes away via a clip-path reveal,
 *      exposing the hero beneath.
 *
 * `ready` is the gate owned by the page: data resolved AND ≥2.5s elapsed
 * (whichever is longer). This component only runs the exit theatre once
 * `ready` flips true.
 *
 * Callbacks:
 *   onRevealStart — fired the instant the wipe begins, so the hero can start
 *                   its own entrance in sync with the curtain lifting.
 *   onComplete    — fired when the wipe finishes; the page then unmounts us.
 *
 * Reduced motion: skips the pod stagger drama and the wipe — reveals as soon
 * as `ready`.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface StartLightsLoaderProps {
  ready: boolean;
  onRevealStart: () => void;
  onComplete: () => void;
}

const POD_COUNT = 5;
const POD_STAGGER = 0.4; // 400ms between each pod lighting (per brief)
const POD_FADE = 0.3; // each pod's own fade-in
const LIGHTS_OUT = 0.2; // pods extinguish fast, together
const DARK_BEAT_MS = 600; // dramatic pause after lights-out, before the wipe
const WIPE = 0.9; // clip-path reveal duration

type Phase = 'lights' | 'out' | 'wipe' | 'done';

export function StartLightsLoader({
  ready,
  onRevealStart,
  onComplete,
}: StartLightsLoaderProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('lights');

  // ── Exit choreography, triggered once when the page says we're ready ──────
  // The whole sequence lives in ONE effect keyed on `ready` (deps are stable),
  // so a phase change can't cancel the next step's timer. Nested timers chain:
  // lights out → dark beat → wipe → done.
  useEffect(() => {
    if (!ready) return;

    if (reduced) {
      // No theatre: reveal immediately.
      setPhase('done');
      onRevealStart();
      const t = window.setTimeout(onComplete, 50);
      return () => window.clearTimeout(t);
    }

    const timers: number[] = [];
    setPhase('out');
    timers.push(
      window.setTimeout(() => {
        setPhase('wipe');
        onRevealStart();
        timers.push(
          window.setTimeout(() => {
            setPhase('done');
            onComplete();
          }, WIPE * 1000),
        );
      }, DARK_BEAT_MS),
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [ready, reduced, onRevealStart, onComplete]);

  const extinguished = phase !== 'lights';
  const wiping = phase === 'wipe' || phase === 'done';

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-busy={phase !== 'done'}
      className="fixed inset-0 z-[9000] flex flex-col items-center justify-center gap-10 bg-black"
      initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      animate={{
        // Collapse the cover toward the bottom edge → reveals top-first.
        clipPath: wiping ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)',
      }}
      transition={
        reduced ? { duration: 0.01 } : { duration: WIPE, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {/* ── Light gantry ─────────────────────────────────────────────────── */}
      <div
        className="home-startlights flex items-center gap-3 sm:gap-5"
        aria-hidden="true"
      >
        {Array.from({ length: POD_COUNT }).map((_, i) => (
          <div
            key={i}
            className="home-startlights-pod relative h-10 w-10 rounded-lg bg-iron sm:h-14 sm:w-14"
          >
            <motion.span
              className="absolute inset-0 rounded-lg bg-red"
              // Static glow via token; only opacity animates (var() colors
              // don't tween, so we fade the lit layer in/out instead).
              style={{ boxShadow: '0 0 28px 6px var(--color-red)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: extinguished ? 0 : 1 }}
              transition={
                reduced
                  ? { duration: 0.01 }
                  : extinguished
                    ? { duration: LIGHTS_OUT, ease: 'easeIn' }
                    : { duration: POD_FADE, delay: i * POD_STAGGER, ease: 'easeOut' }
              }
            />
          </div>
        ))}
      </div>

      <span className="sr-only">
        {phase === 'done' ? 'Season data loaded' : 'Loading season data'}
      </span>
    </motion.div>
  );
}
