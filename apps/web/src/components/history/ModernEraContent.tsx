'use client';

/**
 * Chapter 07 — The Modern Era → Live 2026
 *
 * The history journey ends here. Grayscale is long gone.
 * Full color. The page transforms back into the live F1Pulse
 * homepage experience — the user arrives at NOW.
 *
 * Data:
 *   /api/standings/drivers?season=current → live championship standings
 *   /api/schedule?season=current          → upcoming races (next race card)
 *
 * All copy is empty — user writes every word.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDriverStandings, useSchedule } from '@/lib/api';
import { MaskReveal } from '@/components/primitives/MaskReveal';
import { ScanlineReveal } from '@/components/primitives/ScanlineReveal';
import { ImageReveal } from '@/components/history/ImageReveal';
import { staggerContainerVariants, fadeUpVariants } from '@/lib/motion';

export function ModernEraContent() {
  const { data: standings, isLoading: standingsLoading } = useDriverStandings('current');
  const { data: schedule,  isLoading: scheduleLoading  } = useSchedule('current');

  // Top 5 drivers from current standings
  const top5 = useMemo(
    () => standings?.standings.slice(0, 5) ?? [],
    [standings],
  );

  // Next upcoming race (first race without a result — approximate by future date)
  const nextRace = useMemo(() => {
    if (!schedule) return null;
    const now = new Date();
    return (
      schedule.races.find((r) => new Date(r.date) >= now) ??
      schedule.races[schedule.races.length - 1] ??
      null
    );
  }, [schedule]);

  // Format date
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full text-left">

      {/* ── Hero image — full color ──────────────────────────────────────── */}
      <div className="relative mb-8 h-40 w-full overflow-hidden md:h-56">
        {/* TODO: replace with real photography */}
        <ImageReveal
          src="https://placehold.co/1920x1080/0c0c0d/222226"
          alt="Formula One 2026 — the present"
          fill
          parallax
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4">
          <ScanlineReveal>
            <span className="font-mono text-[0.42rem] uppercase tracking-[0.4em] text-[var(--color-red)]">
              Live Season · 2026
            </span>
          </ScanlineReveal>
        </div>
      </div>

      {/* ── Live standings ────────────────────────────────────────────────── */}
      <MaskReveal direction="left" className="mb-3">
        <span className="font-mono text-[0.45rem] uppercase tracking-[0.4em] text-white/30">
          Championship Standings · Now
        </span>
      </MaskReveal>

      {standingsLoading ? (
        <div className="space-y-px">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <motion.div
          className="mb-8 space-y-px border border-white/8"
          variants={staggerContainerVariants(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {top5.map((s, idx) => {
            const isLeader = idx === 0;
            return (
              <motion.div
                key={s.driver.id}
                variants={fadeUpVariants('measured', 8)}
                className={`flex items-center gap-3 border-b border-white/8 px-3 py-3 last:border-b-0 transition-colors duration-200 hover:bg-white/[0.03] ${
                  isLeader ? 'bg-[var(--color-red)]/[0.04]' : ''
                }`}
              >
                {/* Position */}
                <span
                  className="w-5 font-mono text-sm font-bold tabular-nums leading-none"
                  style={{ color: isLeader ? 'var(--color-red)' : 'rgba(255,255,255,0.2)' }}
                >
                  {s.position}
                </span>

                {/* Driver name */}
                <div className="flex flex-1 flex-col">
                  <span className="font-display text-sm font-black uppercase leading-none text-white">
                    {s.driver.familyName}
                  </span>
                  <span className="mt-0.5 font-mono text-[0.38rem] uppercase tracking-[0.15em] text-white/30">
                    {s.constructors[0]?.name ?? ''}
                  </span>
                </div>

                {/* Wins */}
                <span className="font-mono text-[0.45rem] tabular-nums text-white/30">
                  {s.wins}W
                </span>

                {/* Points */}
                <span
                  className="w-16 text-right font-mono text-sm font-bold tabular-nums leading-none"
                  style={{ color: isLeader ? 'var(--color-red)' : 'rgba(255,255,255,0.7)' }}
                >
                  {s.points.toFixed(0)}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Next race card ─────────────────────────────────────────────────── */}
      {nextRace && !scheduleLoading && (
        <MaskReveal direction="left" delay={0.1} className="mb-2">
          <span className="font-mono text-[0.45rem] uppercase tracking-[0.4em] text-white/30">
            Next Race
          </span>
        </MaskReveal>
      )}

      {scheduleLoading ? (
        <div className="h-20 animate-pulse bg-white/5" />
      ) : nextRace ? (
        <motion.div
          className="border border-white/8 bg-white/[0.015] p-4"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-display text-base font-black uppercase leading-tight text-white">
                {nextRace.name}
              </span>
              <span className="mt-0.5 font-mono text-[0.42rem] uppercase tracking-[0.2em] text-white/35">
                {nextRace.circuit.locality ?? ''} · {nextRace.circuit.country ?? ''}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span
                className="font-mono text-[0.45rem] tabular-nums"
                style={{ color: 'var(--color-red)' }}
              >
                Round {nextRace.round}
              </span>
              <span className="mt-0.5 font-mono text-[0.42rem] text-white/40">
                {formatDate(nextRace.date)}
              </span>
            </div>
          </div>
          {nextRace.isSprintWeekend && (
            <div className="mt-2 inline-block border border-white/15 px-2 py-0.5">
              <span className="font-mono text-[0.38rem] uppercase tracking-[0.25em] text-white/40">
                Sprint Weekend
              </span>
            </div>
          )}
        </motion.div>
      ) : null}

      {/* ── Season context ─────────────────────────────────────────────────── */}
      {standings && (
        <MaskReveal direction="left" delay={0.25} className="mt-5">
          <div className="flex items-center gap-6 border-t border-white/8 pt-4">
            <span className="font-mono text-[0.4rem] uppercase tracking-[0.2em] text-white/20">
              Season {standings.season}
            </span>
            <span className="font-mono text-[0.4rem] text-white/30">
              Round {standings.round} complete
            </span>
            <span
              className="ml-auto font-mono text-[0.4rem] uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-red)' }}
            >
              Live ·{' '}
              {top5[0]
                ? `${top5[0].driver.familyName} leads`
                : 'season in progress'}
            </span>
          </div>
        </MaskReveal>
      )}
    </div>
  );
}
