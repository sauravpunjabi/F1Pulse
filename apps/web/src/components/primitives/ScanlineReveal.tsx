'use client';

/**
 * <ScanlineReveal>
 *
 * A thin accent-coloured horizontal line grows left→right across the top of
 * the container (like a scanner beam), then the content fades up behind it.
 *
 * Three-phase sequence:
 *   1. Line grows: scaleX 0 → 1 (transformOrigin left), accent colour
 *   2. Content enters: opacity 0 → 1, y 4 → 0 (starts at ~60% of scanDuration)
 *   3. Line exits: opacity 1 → 0 after content has appeared
 *
 * Use for: section headers, stat labels, data callouts.
 *
 * Props:
 *   scanDuration  — seconds for the line to cross (default 0.55)
 *   contentDelay  — override when content starts; default = scanDuration * 0.55
 *   lineColor     — CSS value; defaults to var(--accent)
 *   lineThickness — px; default 1
 */

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface ScanlineRevealProps {
  children: ReactNode;
  scanDuration?: number;
  contentDelay?: number;
  lineColor?: string;
  lineThickness?: number;
  className?: string;
}

export function ScanlineReveal({
  children,
  scanDuration = 0.55,
  contentDelay,
  lineColor = 'var(--accent)',
  lineThickness = 1,
  className,
}: ScanlineRevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const delay = contentDelay ?? scanDuration * 0.55;
  const lineExitDelay = delay + 0.35; // line fades after content has appeared

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'relative' }}
    >
      {/* ── Scanline ──────────────────────────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: lineThickness,
          background: lineColor,
          transformOrigin: 'left center',
          scaleX: 0,
          opacity: 0,
        }}
        animate={
          inView
            ? {
                scaleX: [0, 1, 1],
                opacity: [0, 1, 0],
              }
            : {}
        }
        transition={{
          duration: scanDuration + lineExitDelay,
          times: [
            0,
            scanDuration / (scanDuration + lineExitDelay),
            1,
          ],
          ease: ['easeOut', 'easeIn'],
        }}
      />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.25, 1, 0.5, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
