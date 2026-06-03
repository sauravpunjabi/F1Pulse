'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CountUp } from '@/components/primitives';

interface StatClashProps {
  label: string;
  valueA: number;
  valueB: number;
  decimals?: number;
}

export function StatClash({ label, valueA, valueB, decimals = 0 }: StatClashProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const total = valueA + valueB;
  const ratioA = total > 0 ? valueA / total : 0.5;
  const aDominates = valueA > valueB;
  const bDominates = valueB > valueA;

  return (
    <div ref={ref} className="stat-clash flex flex-col gap-3" aria-label={label}>
      {/* Values + label */}
      <div className="flex items-baseline">
        <CountUp
          to={valueA}
          decimals={decimals}
          duration={2}
          className={[
            'w-24 font-display font-black tabular-nums leading-none',
            'text-[clamp(2.2rem,5vw,4rem)]',
            aDominates ? 'text-white' : 'text-white/40',
          ].join(' ')}
        />

        <span className="flex-1 text-center font-mono text-[0.58rem] uppercase tracking-[0.28em] text-white/25">
          {label}
        </span>

        <CountUp
          to={valueB}
          decimals={decimals}
          duration={2}
          className={[
            'w-24 text-right font-display font-black tabular-nums leading-none',
            'text-[clamp(2.2rem,5vw,4rem)]',
            bDominates ? 'text-white/80' : 'text-white/30',
          ].join(' ')}
        />
      </div>

      {/* Ratio bar — A grows from left, B from right, they clash at the midpoint */}
      <div className="relative h-[2px] w-full bg-white/[0.06]" aria-hidden="true">
        <motion.div
          className="absolute left-0 top-0 h-full"
          style={{ background: 'var(--compare-a, #E10600)' }}
          initial={{ width: '0%' }}
          animate={inView ? { width: `${ratioA * 100}%` } : { width: '0%' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        />
        <motion.div
          className="absolute right-0 top-0 h-full"
          style={{ background: 'var(--compare-b, #f5f5f5)', opacity: 0.35 }}
          initial={{ width: '0%' }}
          animate={inView ? { width: `${(1 - ratioA) * 100}%` } : { width: '0%' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        />
      </div>
    </div>
  );
}
