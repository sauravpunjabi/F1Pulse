'use client';

/**
 * <TelemetryLine>
 *
 * An SVG polyline that draws itself using Framer Motion's pathLength animation.
 * Used as a decorative motif in heroes, section dividers, and stat blocks.
 *
 * The default path is a simplified F1 circuit trace — straight sectors with
 * sharp chicanes and a long back straight, fitting in a 500×80 viewBox.
 * Replace `points` with any SVG polyline point string for custom shapes.
 *
 * Props:
 *   points      — SVG polyline points string (space- or comma-separated)
 *   viewBox     — SVG viewBox (default "0 0 500 80")
 *   stroke      — line colour (default var(--accent))
 *   strokeWidth — default 1.5
 *   speed       — preset: 'cinematic' | 'measured' | 'sharp'  (default 'measured')
 *   trigger     — 'mount' | 'scroll' (default 'scroll')
 *   once        — replay on re-entry (default true = play once)
 *   className   — applied to the <svg> element
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { transitions, type MotionPreset } from '@/lib/motion';

// Default path: circuit-trace motif in a 500×80 bounding box
// Sector 1: long straight → hairpin → esses
// Sector 2: back straight → chicane → final curve
const DEFAULT_POINTS = [
  '0,40',
  '80,40',
  '90,20',
  '110,20',
  '120,40',
  '160,40',
  '170,60',
  '190,60',
  '200,40',
  '300,40',
  '310,20',
  '320,40',
  '330,60',
  '340,40',
  '420,40',
  '440,20',
  '460,20',
  '480,40',
  '500,40',
].join(' ');

export interface TelemetryLineProps {
  points?: string;
  viewBox?: string;
  stroke?: string;
  strokeWidth?: number;
  speed?: MotionPreset;
  trigger?: 'mount' | 'scroll';
  once?: boolean;
  className?: string;
}

export function TelemetryLine({
  points = DEFAULT_POINTS,
  viewBox = '0 0 500 80',
  stroke = 'var(--accent)',
  strokeWidth = 1.5,
  speed = 'measured',
  trigger = 'scroll',
  once = true,
  className,
}: TelemetryLineProps) {
  const reduced = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once, amount: 0.3 });
  const shouldDraw = trigger === 'mount' ? true : inView;

  const transition = transitions[speed];

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <motion.polyline
        points={points}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        // Framer Motion handles pathLength → strokeDasharray/strokeDashoffset
        initial={{ pathLength: 0, opacity: 0 }}
        animate={
          shouldDraw
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        transition={
          reduced
            ? { duration: 0.01, ease: 'linear' }
            : { ...transition, opacity: { duration: 0.01 } }
        }
      />
    </svg>
  );
}
