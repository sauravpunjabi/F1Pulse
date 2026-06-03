'use client';

/**
 * <ScanlineReveal>
 *
 * A thin accent-coloured line sweeps left→right above the container,
 * then the content fades up behind it.
 *
 * Bug fix: previously animate={} when not in view, which left content
 * at opacity:0 forever on short viewports. Now uses a 3-second fallback
 * that forces reveal regardless of scroll position.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  const inView = useInView(ref, { once: true, amount: 0.2 });

  // Force-reveal after 3 s in case IntersectionObserver never fires
  // (e.g. element is in a collapsed section or IO threshold not met).
  const [forceReveal, setForceReveal] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceReveal(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const shouldReveal = inView || forceReveal;
  const delay = contentDelay ?? scanDuration * 0.55;
  const lineExitDelay = delay + 0.35;

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ position: 'relative' }}>
      {/* Scanline */}
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
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={
          shouldReveal
            ? { scaleX: [0, 1, 1], opacity: [0, 1, 0] }
            : { scaleX: 0, opacity: 0 }
        }
        transition={{
          duration: scanDuration + lineExitDelay,
          times: [0, scanDuration / (scanDuration + lineExitDelay), 1],
          ease: ['easeOut', 'easeIn'],
        }}
      />

      {/* Content — always animates to visible; never stays hidden */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
