'use client';

import { motion } from 'framer-motion';
import { TelemetryLine } from '@/components/primitives/TelemetryLine';
import { MaskReveal } from '@/components/primitives/MaskReveal';
import type { RaceResultDto } from '@/lib/api';

interface RaceResultBreakdownProps {
  results: RaceResultDto[];
  raceName: string;
  season: number;
  round: number;
}

function gapLabel(r: RaceResultDto, results: RaceResultDto[]): string {
  if (r.position === 1) return 'LEADER';
  if (r.positionText === 'R') return 'RET';
  if (r.positionText === 'D') return 'DSQ';
  const leader = results[0];
  if (!leader) return '—';
  if (r.timeText) return `+${r.timeText}`;
  if (leader.timeMillis && r.timeMillis) {
    const delta = r.timeMillis - leader.timeMillis;
    const s = (delta / 1000).toFixed(3);
    return `+${s}s`;
  }
  return '—';
}

export function RaceResultBreakdown({
  results,
  raceName,
  season,
  round,
}: RaceResultBreakdownProps) {
  if (results.length === 0) return null;

  return (
    <section className="px-6 pb-24 md:px-16" aria-label="Race finishing order">
      {/* Header */}
      <div className="mb-8 flex items-baseline justify-between">
        <MaskReveal direction="left" preset="measured">
          <h2
            className="font-display font-black uppercase leading-none text-white"
            style={{ fontSize: 'clamp(1.1rem, 2.5vw, 2rem)' }}
          >
            {raceName}
          </h2>
        </MaskReveal>
        <span className="font-mono text-[0.48rem] uppercase tracking-[0.28em] text-white/25">
          Round {round} · {season}
        </span>
      </div>

      {/* Column headers */}
      <div className="mb-3 grid grid-cols-[2rem_1fr_auto_auto] gap-x-4 pr-2">
        {(['Pos', 'Driver', 'Team', 'Gap'] as const).map((h) => (
          <span
            key={h}
            className="font-mono text-[0.42rem] uppercase tracking-[0.25em] text-white/20"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {results.map((r, i) => {
          const isLeader = r.position === 1;
          const hasFastestLap = r.fastestLap?.rank === 1;
          const gap = gapLabel(r, results);

          return (
            <motion.div
              key={r.driver.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: i * 0.03, ease: [0.25, 1, 0.5, 1] }}
            >
              {/* TelemetryLine divider */}
              {i > 0 && (
                <TelemetryLine
                  className="my-1 h-4 w-full opacity-10"
                  speed="sharp"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={0.6}
                />
              )}

              <div
                className="grid grid-cols-[2rem_1fr_auto_auto] items-center gap-x-4 py-2 pr-2"
                data-position={r.position}
              >
                {/* Position */}
                <span
                  className="font-mono text-xs font-bold tabular-nums"
                  style={{ color: isLeader ? '#E10600' : 'rgba(255,255,255,0.6)' }}
                >
                  {r.positionText === 'R' || r.positionText === 'D'
                    ? r.positionText
                    : r.position}
                </span>

                {/* Driver */}
                <div className="flex flex-col gap-0.5">
                  <span
                    className="font-display font-bold uppercase leading-none"
                    style={{
                      fontSize: 'clamp(0.7rem, 1.5vw, 0.95rem)',
                      color: isLeader ? '#fff' : 'rgba(255,255,255,0.75)',
                    }}
                  >
                    {r.driver.familyName}
                  </span>
                  <span className="font-mono text-[0.42rem] uppercase tracking-widest text-white/25">
                    {r.driver.givenName.charAt(0)}. {r.driver.code ?? ''}
                  </span>
                </div>

                {/* Constructor */}
                <span
                  className="font-mono text-[0.44rem] uppercase tracking-widest text-white/30"
                  style={{ minWidth: 80, textAlign: 'right' }}
                >
                  {r.constructor.name}
                </span>

                {/* Gap + fastest lap */}
                <div className="flex items-center gap-2" style={{ minWidth: 72, justifyContent: 'flex-end' }}>
                  <span
                    className="font-mono text-[0.48rem] tabular-nums"
                    style={{ color: isLeader ? '#E10600' : 'rgba(255,255,255,0.4)' }}
                  >
                    {gap}
                  </span>
                  {hasFastestLap && (
                    <span
                      className="font-mono text-[0.38rem] uppercase tracking-widest"
                      style={{ color: '#a855f7' }}
                      title="Fastest Lap"
                    >
                      FL
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
