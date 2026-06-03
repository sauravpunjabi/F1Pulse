'use client';

/**
 * Act 1 — Black opening.
 * Both surnames enter from opposite sides and almost collide at center.
 * A thin red line separates them.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { transitions } from '@/lib/motion';

interface RivalryHeroProps {
  nameA: string;
  nameB: string;
}

export function RivalryHero({ nameA, nameB }: RivalryHeroProps) {
  const reduced = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const leftVariants = {
    hidden: { clipPath: 'inset(0% 100% 0% 0%)', x: -60 },
    visible: {
      clipPath: 'inset(0% 0% 0% 0%)',
      x: 0,
      transition: reduced
        ? { duration: 0.01 }
        : { ...transitions.cinematic },
    },
  };

  const rightVariants = {
    hidden: { clipPath: 'inset(0% 0% 0% 100%)', x: 60 },
    visible: {
      clipPath: 'inset(0% 0% 0% 0%)',
      x: 0,
      transition: reduced
        ? { duration: 0.01 }
        : { ...transitions.cinematic },
    },
  };

  const lineVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: reduced
        ? { duration: 0.01 }
        : { duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black"
      aria-label={`${nameA} vs ${nameB}`}
    >
      {/* Atmospheric grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundSize: '256px 256px',
        }}
      />

      <motion.div
        className="relative flex w-full max-w-7xl items-center justify-center px-6 md:px-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Driver A — enters from left */}
        <motion.div
          className="flex-1 text-right"
          variants={leftVariants}
        >
          <span
            className="font-display font-black uppercase leading-none tracking-tighter text-white"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 8rem)' }}
          >
            {nameA}
          </span>
        </motion.div>

        {/* Center red separator line */}
        <motion.div
          aria-hidden="true"
          className="mx-4 h-[8rem] w-px origin-top bg-[#E10600] md:mx-8 md:h-[12rem]"
          variants={lineVariants}
        />

        {/* Driver B — enters from right */}
        <motion.div
          className="flex-1 text-left"
          variants={rightVariants}
        >
          <span
            className="font-display font-black uppercase leading-none tracking-tighter text-white"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 8rem)' }}
          >
            {nameB}
          </span>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <span className="font-mono text-[0.44rem] uppercase tracking-[0.4em] text-white/20">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
