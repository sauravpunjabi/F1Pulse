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
const POD_FADE = 0.3; // each pod's own fade-in
const LIGHTS_OUT = 0.2; // pods extinguish fast, together

type Phase = 'lights' | 'out' | 'wipe' | 'done';

export function StartLightsLoader({
  ready,
  onRevealStart,
  onComplete,
}: StartLightsLoaderProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('lights');
  const [isSoft, setIsSoft] = useState(false);

  useEffect(() => {
    try {
      const visited = localStorage.getItem('f1pulse-visited');
      if (visited) {
        setIsSoft(true);
      } else {
        localStorage.setItem('f1pulse-visited', 'true');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const podStagger = isSoft ? 0.14 : 0.4;
  const darkBeatMs = isSoft ? 250 : 600;
  const wipeDuration = isSoft ? 0.75 : 0.85;

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
          }, wipeDuration * 1000),
        );
      }, darkBeatMs),
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [ready, reduced, onRevealStart, onComplete, darkBeatMs, wipeDuration]);

  const extinguished = phase !== 'lights';
  const wiping = phase === 'wipe' || phase === 'done';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={phase !== 'done'}
      className="fixed inset-0 z-[9000] flex flex-col items-center justify-center bg-transparent pointer-events-none"
    >
      {/* ── Editorial Slats Shutter Background ─────────────────────────────── */}
      {/* Slabs block clicks (pointer-events-auto) until they slide out of frame */}
      <div className="absolute inset-0 flex pointer-events-auto overflow-hidden z-0">
        {/* Slat 1: Slides UP */}
        <motion.div
          className="h-full bg-off-white border-r border-steel/10"
          style={{ width: '33.333%' }}
          initial={{ y: '0%' }}
          animate={{ y: wiping ? '-100%' : '0%' }}
          transition={
            reduced
              ? { duration: 0.01 }
              : { duration: wipeDuration, ease: [0.65, 0.05, 0, 1] }
          }
        />
        {/* Slat 2: Slides DOWN */}
        <motion.div
          className="h-full bg-off-white border-r border-steel/10"
          style={{ width: '33.333%' }}
          initial={{ y: '0%' }}
          animate={{ y: wiping ? '100%' : '0%' }}
          transition={
            reduced
              ? { duration: 0.01 }
              : { duration: wipeDuration, delay: isSoft ? 0.03 : 0.08, ease: [0.65, 0.05, 0, 1] }
          }
        />
        {/* Slat 3: Slides UP */}
        <motion.div
          className="h-full bg-off-white"
          style={{ width: '33.334%' }}
          initial={{ y: '0%' }}
          animate={{ y: wiping ? '-100%' : '0%' }}
          transition={
            reduced
              ? { duration: 0.01 }
              : { duration: wipeDuration, delay: isSoft ? 0.06 : 0.16, ease: [0.65, 0.05, 0, 1] }
          }
        />
      </div>

      {/* ── Centered Content (Gantry + Text) ───────────────────────────────── */}
      <motion.div
        className="z-10 flex flex-col items-center justify-center gap-10"
        initial={{ opacity: 1, scale: 1 }}
        animate={{
          opacity: wiping ? 0 : 1,
          scale: wiping ? 0.95 : 1,
        }}
        transition={
          reduced ? { duration: 0.01 } : { duration: 0.35, ease: 'easeOut' }
        }
      >
        {/* ── Light gantry ─────────────────────────────────────────────────── */}
        <div
          className="home-startlights flex items-center gap-4 sm:gap-6"
          aria-hidden="true"
        >
          {Array.from({ length: POD_COUNT }).map((_, i) => (
            <div
              key={i}
              className="home-startlights-pod relative h-10 w-10 rounded-full border border-steel/40 flex items-center justify-center bg-iron/10 sm:h-14 sm:w-14"
            >
              <motion.span
                className="h-6 w-6 rounded-full bg-accent sm:h-9 sm:w-9"
                initial={{ opacity: 0 }}
                animate={{ opacity: extinguished ? 0 : 1 }}
                transition={
                  reduced
                    ? { duration: 0.01 }
                    : extinguished
                      ? { duration: LIGHTS_OUT, ease: 'easeIn' }
                      : { duration: POD_FADE, delay: i * podStagger, ease: 'easeOut' }
                }
              />
            </div>
          ))}
        </div>

        {/* Editorial loader details */}
        <div className="flex flex-col items-center gap-2 mt-4 select-none text-center">
          <span className="font-serif italic text-sm text-silver">
            {isSoft ? 'Resuming the chronicle' : 'Preparing the chronicle'}
          </span>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-black font-semibold">
            F1Pulse // Vol. I
          </span>
        </div>
      </motion.div>

      <span className="sr-only">
        {phase === 'done' ? 'Season data loaded' : 'Loading season data'}
      </span>
    </div>
  );
}
