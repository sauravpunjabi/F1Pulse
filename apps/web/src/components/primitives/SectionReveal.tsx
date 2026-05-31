'use client';

/**
 * <SectionReveal>
 *
 * Wraps a list or group of elements and staggers their entrance when the
 * container scrolls into view. Each direct child is wrapped in a motion.div
 * that plays fadeUp (opacity 0→1, y 24→0) with the `measured` preset.
 *
 * Note: wrapping children in a div may affect flex/grid layout. Pass
 * className to the container and set children as items that don't depend
 * on being direct children of a specific parent.
 *
 * Props:
 *   staggerDelay — seconds between each child's entrance (default 0.06)
 *   preset       — motion preset for each child (default 'measured')
 *   distance     — y travel distance in px (default 24)
 *   once         — replay on re-entry (default true = play once)
 *   className    — applied to the stagger container div
 */

import React, { useRef, type ReactNode } from 'react';
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
  const inView = useInView(ref, { once, amount: 0.15 });

  const childVariants = fadeUpVariants(preset, distance);

  // Reduced motion: render without animation wrappers
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
      animate={inView ? 'visible' : 'hidden'}
    >
      {childArray.map((child, i) => (
        <motion.div key={i} variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
