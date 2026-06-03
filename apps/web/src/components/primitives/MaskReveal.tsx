'use client';

/**
 * <MaskReveal>
 *
 * Reveals children via an animated clip-path inset.
 * Content is always in the DOM (SEO/a11y-safe) — the mask controls visibility only.
 *
 * Directions:
 *   left   → reveals left-to-right  (default)
 *   right  → reveals right-to-left
 *   top    → reveals top-to-bottom
 *   bottom → reveals bottom-to-top
 *
 * 3-second fallback: if IntersectionObserver hasn't fired (short viewport,
 * collapsed section, etc.), the element force-reveals so content is never
 * permanently hidden from users who don't scroll far enough.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
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

function clipHidden(dir: MaskDirection): string {
  switch (dir) {
    case 'left':   return 'inset(0% 100% 0% 0%)';
    case 'right':  return 'inset(0% 0% 0% 100%)';
    case 'top':    return 'inset(100% 0% 0% 0%)';
    case 'bottom': return 'inset(0% 0% 100% 0%)';
  }
}

const CLIP_VISIBLE = 'inset(0% 0% 0% 0%)';

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
  const inView = useInView(ref, { once, amount: 0.15 });

  // Force-reveal after 3 s — ensures content is never permanently hidden
  const [forceReveal, setForceReveal] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceReveal(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const shouldReveal = trigger === 'mount' ? true : inView || forceReveal;

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
      animate={{ clipPath: shouldReveal ? CLIP_VISIBLE : clipHidden(direction) }}
      transition={{ ...transitions[preset], delay }}
    >
      {children}
    </motion.div>
  );
}
