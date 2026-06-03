'use client';

/**
 * DriverRivalries — shows rivalry experience links for drivers who appear
 * in a rivalry. Shown only if rivalriesForDriver returns at least one entry.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { rivalriesForDriver } from '@/config/rivalries';

interface RivalryLinkProps {
  id: string;
  opponentName: string;
  eraStart: number;
  eraEnd: number;
  index: number;
}

function RivalryLink({ id, opponentName, eraStart, eraEnd, index }: RivalryLinkProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 1, 0.5, 1] }}
    >
      <Link
        href={`/rivalry/${id}`}
        className="group flex items-center justify-between border border-white/8 px-5 py-4 transition-colors hover:border-white/20 hover:bg-white/[0.03]"
        aria-label={`${opponentName} rivalry — experience`}
      >
        <div className="flex flex-col gap-1">
          <span
            className="font-display font-black uppercase leading-none text-white transition-colors group-hover:text-[#E10600]"
            style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1rem)' }}
          >
            vs {opponentName}
          </span>
          <span className="font-mono text-[0.42rem] uppercase tracking-widest text-white/25">
            {eraStart} – {eraEnd}
          </span>
        </div>
        <span className="font-mono text-[0.44rem] uppercase tracking-widest text-white/25 transition-colors group-hover:text-white/60">
          Experience →
        </span>
      </Link>
    </motion.div>
  );
}

export function DriverRivalries({ driverId }: { driverId: string }) {
  const rivalries = rivalriesForDriver(driverId);
  if (rivalries.length === 0) return null;

  return (
    <section
      className="px-6 py-16 md:px-16"
      aria-label="Rivalry experiences"
    >
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-white/40">
        Rivalries
      </p>
      <div className="flex max-w-lg flex-col gap-3">
        {rivalries.map((r, i) => {
          const opponentId = r.driverAId === driverId ? r.driverBId : r.driverAId;
          // Display the opponent's raw ID as a fallback; the link goes to the rivalry page
          const opponentLabel = opponentId
            .split('_')
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' ');

          return (
            <RivalryLink
              key={r.id}
              id={r.id}
              opponentName={opponentLabel}
              eraStart={r.eraStart}
              eraEnd={r.eraEnd}
              index={i}
            />
          );
        })}
      </div>
    </section>
  );
}
