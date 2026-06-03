'use client';

/**
 * <ImageReveal>
 *
 * Next.js <Image> wrapper with a 3-step cinematic reveal:
 *   1. Thin 1px red scanline sweeps left → right
 *   2. Image wipes in via clip-path behind the moving scanline
 *   3. Optional 0.15× scroll parallax for hero/full-viewport images
 *
 * Stagger grids: pass `delay` in seconds per item (0, 0.1, 0.2, …)
 * Trigger: IntersectionObserver + 3-second force-reveal fallback.
 * Respects prefers-reduced-motion (skips animations, reveals instantly).
 */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ImageRevealProps {
  src: string;
  alt: string;
  /** Required when fill is false (default). */
  width?: number;
  /** Required when fill is false (default). */
  height?: number;
  /** Fill parent container. Parent must have position:relative and a defined size. */
  fill?: boolean;
  /** Parallax at 0.15× scroll speed — use for hero full-viewport images. */
  parallax?: boolean;
  /** Stagger delay in seconds for grid reveals (0.1 per item). */
  delay?: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

export function ImageReveal({
  src,
  alt,
  width,
  height,
  fill = false,
  parallax = false,
  delay = 0,
  priority = false,
  className = '',
  imageClassName = '',
}: ImageRevealProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [forceReveal, setForceReveal] = useState(false);

  // Parallax — image moves at 0.15× scroll speed inside the clip mask
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  // ±7.5% gives ~0.15× for full-viewport containers
  const imageY = useTransform(scrollYProgress, [0, 1], ['-7.5%', '7.5%']);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Force-reveal after 3 s — same safety net as MaskReveal / ScanlineReveal
  useEffect(() => {
    const t = setTimeout(() => setForceReveal(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const triggered = inView || forceReveal;

  // Reduced-motion: render without any animation
  if (reduced) {
    return (
      <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
        {/* TODO: replace with real photography */}
        {fill ? (
          <Image src={src} alt={alt} fill priority={priority} className={`object-cover ${imageClassName}`} />
        ) : (
          <Image src={src} alt={alt} width={width ?? 1600} height={height ?? 900} priority={priority} className={imageClassName} />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* ── Scanline sweep ──────────────────────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{ height: 1, background: 'var(--accent)', transformOrigin: 'left center' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={
          triggered
            ? { scaleX: [0, 1, 1, 1], opacity: [0, 1, 1, 0] }
            : { scaleX: 0, opacity: 0 }
        }
        transition={{
          duration: 0.85 + delay,
          delay,
          times: [0, 0.42, 0.68, 1],
          ease: 'easeInOut',
        }}
      />

      {/* ── Image — wipes in from left, slightly behind the sweeping scanline ── */}
      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)', scale: 1.1 }}
        animate={
          triggered
            ? { clipPath: 'inset(0 0% 0 0)', scale: 1.0 }
            : { clipPath: 'inset(0 100% 0 0)', scale: 1.1 }
        }
        transition={{
          clipPath: { duration: 1.2, delay: delay + 0.12, ease: [0.7, 0, 0.2, 1] },
          scale:    { duration: 1.3, delay: delay + 0.12, ease: [0.16, 1, 0.3, 1] },
        }}
        style={parallax ? { y: imageY } : undefined}
      >
        {/* TODO: replace with real photography */}
        {fill ? (
          <Image src={src} alt={alt} fill priority={priority} className={`object-cover ${imageClassName}`} />
        ) : (
          <Image src={src} alt={alt} width={width ?? 1600} height={height ?? 900} priority={priority} className={imageClassName} />
        )}
      </motion.div>
    </div>
  );
}
