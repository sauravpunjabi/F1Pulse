'use client';

/**
 * <MaskReveal>
 *
 * Reveals children via an animated clip-path inset.
 * The content is already in the DOM (good for SEO/a11y) — the mask only
 * controls visibility, never layout.
 *
 * clip-path directions:
 *   left   → inset(0% 100% 0% 0%)  reveals left-to-right  ← default
 *   right  → inset(0% 0% 0% 100%)  reveals right-to-left
 *   top    → inset(100% 0% 0% 0%)  reveals top-to-bottom
 *   bottom → inset(0% 0% 100% 0%)  reveals bottom-to-top
 *
 * trigger="mount"  — fires immediately (hero elements above the fold)
 * trigger="scroll" — fires when element enters the viewport (default)
 */

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { transitions, type MotionPreset } from '@/lib/motion';

export type MaskDirection = 'left' | 'right' | 'top' | 'bottom';

export interface MaskRevealProps {
  children: ReactNode;
  direction?: MaskDirection;
  /** Extra delay in seconds on top of the preset's delay. */
  delay?: number;
  preset?: MotionPreset;
  trigger?: 'mount' | 'scroll';
  /** Re-animate every time the element scrolls back into view. */
  once?: boolean;
  className?: string;
}

// ── Clip-path helpers ─────────────────────────────────────────────────────────

function clipHidden(dir: MaskDirection): string {
  switch (dir) {
    case 'left':   return 'inset(0% 100% 0% 0%)';
    case 'right':  return 'inset(0% 0% 0% 100%)';
    case 'top':    return 'inset(100% 0% 0% 0%)';
    case 'bottom': return 'inset(0% 0% 100% 0%)';
  }
}

const CLIP_VISIBLE = 'inset(0% 0% 0% 0%)';

// ── Component ─────────────────────────────────────────────────────────────────

export function MaskReveal({
  children,
  direction = 'left',
  delay = 0,
  preset = 'cinematic',
  trigger = 'scroll',
  once = true,
  className,
}: MaskRevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // useInView is a no-op when trigger=mount — we just always set shouldReveal=true
  const inView = useInView(ref, { once, amount: 0.2 });
  const shouldReveal = trigger === 'mount' ? true : inView;

  // Reduced motion: render without any clip animation
  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: clipHidden(direction) }}
      animate={shouldReveal ? { clipPath: CLIP_VISIBLE } : { clipPath: clipHidden(direction) }}
      transition={{ ...transitions[preset], delay }}
    >
      {children}
    </motion.div>
  );
}
