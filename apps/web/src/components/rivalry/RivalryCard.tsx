'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ImageReveal } from '@/components/history/ImageReveal';
import type { RivalryConfig } from '@/config/rivalries';

interface RivalryCardProps {
  rivalry: RivalryConfig;
  nameA: string;
  nameB: string;
  index: number;
}

export function RivalryCard({ rivalry, nameA, nameB, index }: RivalryCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.25, 1, 0.5, 1] }}
    >
      <Link
        href={`/rivalry/${rivalry.id}`}
        className="group relative block overflow-hidden border border-white/8 bg-white/[0.02] transition-colors hover:border-white/18 hover:bg-white/[0.04]"
        aria-label={`${nameA} vs ${nameB} rivalry`}
      >
        {/* Aspect ratio container */}
        <div className="relative aspect-[16/7] overflow-hidden">
          {/* Placeholder portrait pair */}
          <div className="absolute inset-0 grid grid-cols-2">
            <div className="relative overflow-hidden">
              <ImageReveal
                src={`https://placehold.co/400x280/0a0a0a/333333?text=${encodeURIComponent(nameA.slice(0, 3).toUpperCase())}`}
                alt={nameA}
                fill
                className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <div className="relative overflow-hidden">
              <ImageReveal
                src={`https://placehold.co/400x280/0a0a0a/333333?text=${encodeURIComponent(nameB.slice(0, 3).toUpperCase())}`}
                alt={nameB}
                fill
                className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          </div>

          {/* Center divider line */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#E10600]/60"
          />

          {/* Gradient overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          />

          {/* Names */}
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 px-6 pb-5">
            <span
              className="font-display font-black uppercase leading-none text-white"
              style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.4rem)' }}
            >
              {nameA}
            </span>
            <span
              className="text-right font-display font-black uppercase leading-none text-white"
              style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.4rem)' }}
            >
              {nameB}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4">
          <span className="font-mono text-[0.44rem] uppercase tracking-[0.3em] text-white/30">
            {rivalry.eraStart} – {rivalry.eraEnd}
          </span>
          <span className="font-mono text-[0.44rem] uppercase tracking-[0.28em] text-white/20 transition-colors group-hover:text-white/50">
            Experience →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
