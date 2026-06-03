'use client';

/**
 * <SectionReveal>
 *
 * Staggers children's entrance when the container enters the viewport.
 * Each direct child gets fadeUp (opacity 0→1, y 24→0) with `measured` preset.
 *
 * 3-second fallback: force-reveals when IO hasn't fired — prevents rows from
 * staying permanently hidden on short/wide viewports or full-page screenshots.
 */

import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { staggerContainerVariants, fadeUpVariants, type MotionPreset } from '@/lib/motion';

export interface SectionRevealProps {
  children: ReactNode;
  staggerDelay?: number;
  preset?: MotionPreset;
  distance?: number;
  once?: boolean;
  className?: string;
}

export function SectionReveal({
  children,
  staggerDelay = 0.06,
  preset = 'measured',
  distance = 24,
  once = true,
  className,
}: SectionRevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount: 0 });

  const [forceReveal, setForceReveal] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceReveal(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const shouldReveal = inView || forceReveal;
  const childVariants = fadeUpVariants(preset, distance);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const childArray = React.Children.toArray(children);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainerVariants(staggerDelay)}
      initial="hidden"
      animate={shouldReveal ? 'visible' : 'hidden'}
    >
      {childArray.map((child, i) => (
        <motion.div key={i} variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
