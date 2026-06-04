'use client';

/**
 * <Atmosphere />
 *
 * Fixed full-screen overlay that sits above every page at z-atmosphere.
 * Two layers stacked:
 *   1. Film grain — SVG feTurbulence animated noise, very low opacity.
 *      Creates the "watched in a cinema, not on a screen" texture.
 *   2. Vignette   — radial-gradient darkening the frame edges.
 *      Draws the eye inward; deepens perceived depth.
 *
 * Neither layer captures pointer events or affects layout.
 *
 * Opacity values come from CSS vars (--grain-opacity, --vignette-opacity)
 * defined in globals.css — tune them there, not here.
 *
 * TODO: When the signature GLSL / SVG-mask "Telemetry Masking" effect lands,
 *       it mounts inside this component so the z-order stays managed in one
 *       place. For now it's pure CSS/SVG — no three.js overhead on first load.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLenis } from '@/providers/LenisProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  startAmbientEngine,
  stopAmbientEngine,
  modulateEngine,
} from '@/lib/audio';

export function Atmosphere() {
  const [isPlaying, setIsPlaying] = useState(false);
  const lenis = useLenis();
  const reduced = useReducedMotion();

  const toggleSound = () => {
    if (isPlaying) {
      stopAmbientEngine();
      setIsPlaying(false);
    } else {
      startAmbientEngine();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientEngine();
    };
  }, []);

  useEffect(() => {
    if (!lenis || !isPlaying) return;

    const handleScroll = () => {
      // Calculate scroll speed from lenis velocity
      const speed = Math.min(Math.abs(lenis.velocity || 0) / 4, 1.0);
      modulateEngine(speed);
    };

    lenis.on('scroll', handleScroll);
    return () => {
      lenis.off('scroll', handleScroll);
    };
  }, [lenis, isPlaying]);

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'var(--z-atmosphere)' as unknown as number,
          pointerEvents: 'none',
          /* Isolate compositing to avoid affecting child stacking contexts */
          isolation: 'isolate',
        }}
      >
        {/* ── Layer 1: Film grain ──────────────────────────────────────────── */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 'var(--grain-opacity)',
            mixBlendMode: 'screen',
          }}
        >
          <filter id="f1pulse-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#f1pulse-grain)" />
        </svg>

        {/* ── Layer 2: Vignette ────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 'var(--vignette-opacity)',
            background: `radial-gradient(
              ellipse var(--vignette-spread) var(--vignette-spread) at 50% 50%,
              transparent 0%,
              rgba(0, 0, 0, 0.6) 60%,
              rgba(0, 0, 0, 0.95) 100%
            )`,
          }}
        />
      </div>

      {/* ── Layer 3: Interactive Sound HUD widget (Hatom inspired) ────────── */}
      <button
        onClick={toggleSound}
        className="fixed bottom-6 right-6 z-[8000] pointer-events-auto flex items-center justify-center gap-3 rounded-full border border-steel/20 bg-off-white/95 px-4 py-2.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-black/30 hover:bg-white text-black cursor-pointer font-mono text-[0.65rem] uppercase tracking-[0.15em] select-none"
        aria-label={isPlaying ? 'Mute ambient sound' : 'Unmute ambient sound'}
      >
        <span className="font-semibold">{isPlaying ? 'Sound On' : 'Sound Off'}</span>
        
        {/* Animated wave bars */}
        <div className="flex items-end gap-[2px] h-3 w-4 pb-[1px]">
          <motion.div
            className="w-[2px] bg-black rounded-full"
            animate={{
              height: isPlaying && !reduced ? [3, 12, 3] : 3
            }}
            transition={{
              repeat: Infinity,
              duration: 1.0,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="w-[2px] bg-accent rounded-full"
            animate={{
              height: isPlaying && !reduced ? [4, 9, 4] : 3
            }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              ease: 'easeInOut',
              delay: 0.15,
            }}
          />
          <motion.div
            className="w-[2px] bg-black rounded-full"
            animate={{
              height: isPlaying && !reduced ? [3, 11, 3] : 3
            }}
            transition={{
              repeat: Infinity,
              duration: 1.1,
              ease: 'easeInOut',
              delay: 0.3,
            }}
          />
          <motion.div
            className="w-[2px] bg-silver rounded-full"
            animate={{
              height: isPlaying && !reduced ? [2, 7, 2] : 3
            }}
            transition={{
              repeat: Infinity,
              duration: 0.7,
              ease: 'easeInOut',
              delay: 0.45,
            }}
          />
        </div>
      </button>
    </>
  );
}
