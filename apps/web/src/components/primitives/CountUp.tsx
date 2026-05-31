'use client';

/**
 * <CountUp>
 *
 * Animates a number from `from` → `to` using requestAnimationFrame and an
 * expo-out easing curve (approximates the cinematic cubic-bezier).
 * Triggers when the element enters the viewport.
 *
 * prefers-reduced-motion: skips the animation and shows the final value immediately.
 *
 * Props:
 *   from      — starting value (default 0)
 *   to        — final value (required)
 *   duration  — animation duration in seconds (default 2.0)
 *   decimals  — fixed decimal places (default 0)
 *   prefix    — string prepended to the number (e.g. "$")
 *   suffix    — string appended to the number (e.g. " pts", "%")
 *   className — applied to the <span> wrapper
 */

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

// expo-out approximation — close to cubic-bezier(0.16, 1, 0.3, 1)
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function CountUp({
  from = 0,
  to,
  duration = 2.0,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: CountUpProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const rafRef = useRef<number>(0);
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    // Reduced motion or already past the final value: jump immediately
    if (reduced) {
      setDisplay(to);
      return;
    }

    if (!inView) return;

    let startTime: number | null = null;
    const durationMs = duration * 1000;

    function tick(timestamp: number) {
      if (startTime === null) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutExpo(progress);
      const current = from + (to - from) * eased;

      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(to); // lock to exact final value
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, reduced, from, to, duration]);

  const formatted = display.toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
