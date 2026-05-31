/**
 * F1Pulse motion preset system.
 *
 * Three named transition speeds, each with a purpose:
 *   cinematic  — hero entrances, page-level reveals. Heavy, deliberate.
 *   measured   — standard transitions, cards, panels. Confident, readable.
 *   sharp      — micro-interactions, hover states. Snappy, responsive.
 *
 * All presets automatically collapse to instant (0.01s, linear) when
 * prefers-reduced-motion is active. Use useMotionPresets() in components
 * to get the correct transition for the current user preference.
 *
 * Usage:
 *   const { cinematic, measured, sharp } = useMotionPresets();
 *   <motion.div variants={fadeUp} transition={cinematic} ... />
 *
 * Or use the pre-built variant factories:
 *   <motion.div variants={fadeUpVariants('cinematic')} initial="hidden" whileInView="visible" />
 */

import type { Transition, Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ── Base transition configs ───────────────────────────────────────────────────

export const transitions = {
  cinematic: {
    duration: 1.2,
    ease: [0.16, 1, 0.3, 1],   // cubic-bezier — heavy expo-out, lingers at arrival
  } satisfies Transition,

  measured: {
    duration: 0.8,
    ease: [0.25, 1, 0.5, 1],   // cubic-bezier — balanced deceleration
  } satisfies Transition,

  sharp: {
    duration: 0.4,
    ease: [0.4, 0, 0.2, 1],    // cubic-bezier — Material standard — snappy
  } satisfies Transition,

  // Reduced-motion fallback: effectively instant, no perceived motion
  instant: {
    duration: 0.01,
    ease: 'linear',
  } satisfies Transition,
} as const;

export type MotionPreset = keyof Omit<typeof transitions, 'instant'>;

// ── Hook: reduced-motion-aware transition lookup ──────────────────────────────

/**
 * Returns all three presets, automatically replacing them with `instant`
 * when the user has requested reduced motion.
 *
 * Must be called inside a React component (Client Component only).
 */
export function useMotionPresets(): Record<MotionPreset, Transition> {
  const reduced = useReducedMotion();
  const fallback = transitions.instant;

  return {
    cinematic: reduced ? fallback : transitions.cinematic,
    measured:  reduced ? fallback : transitions.measured,
    sharp:     reduced ? fallback : transitions.sharp,
  };
}

// ── Variant factories ─────────────────────────────────────────────────────────
// Return Framer Motion Variants objects. Pass the result of useMotionPresets()
// as the transition on the motion element, or embed it directly via factory.

/**
 * Fade + rise from below. The most common entrance variant.
 * `distance` controls how far the element travels upward (px).
 */
export function fadeUpVariants(
  preset: MotionPreset = 'measured',
  distance = 24,
): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: transitions[preset],
    },
  };
}

/**
 * Pure opacity fade — use for elements that should appear without movement
 * (background layers, overlays, captions).
 */
export function fadeVariants(preset: MotionPreset = 'measured'): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: transitions[preset],
    },
  };
}

/**
 * Scale + fade — for cards, modals, callouts that should feel like they
 * materialise from a focal point rather than slide in.
 */
export function scaleUpVariants(preset: MotionPreset = 'measured'): Variants {
  return {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: transitions[preset],
    },
  };
}

/**
 * Stagger container — wraps a list so children animate in sequence.
 * `staggerSeconds` defaults to 0.05s between children.
 */
export function staggerContainerVariants(staggerSeconds = 0.05): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerSeconds,
        delayChildren: 0,
      },
    },
  };
}
