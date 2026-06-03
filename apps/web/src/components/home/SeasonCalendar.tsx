'use client';

/**
 * <SeasonCalendar> — every round from /api/schedule?season=current.
 *
 * DONE / NEXT / UPCOMING computed client-side against real Date.now().
 * "Next" is the first round whose date is today or later.
 * Status exposed via data-status + class hooks for the art director.
 * Circuit name links to /circuit/[circuitId].
 */

import Link from 'next/link';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ScheduleDto } from '@/lib/api';
import type { Tempo } from './adaptive';
import type { SectionStatus } from './SectionState';
import { ScanlineReveal, SectionReveal } from '@/components/primitives';
import { LoadingState, ErrorState, EmptyState } from './SectionState';

type RoundStatus = 'done' | 'next' | 'upcoming';

const STATUS_LABEL: Record<RoundStatus, string> = {
  done:     'Done',
  next:     'Next',
  upcoming: 'Upcoming',
};

export function SeasonCalendar({
  query,
  tempo,
}: {
  query: UseQueryResult<ScheduleDto>;
  tempo: Tempo;
}) {
  const races = query.data?.races ?? [];

  const status: SectionStatus = query.isLoading
    ? 'loading'
    : query.isError
      ? 'error'
      : races.length === 0
        ? 'empty'
        : 'ready';

  const now = Date.now();
  const nextIndex = races.findIndex((r) => new Date(r.date).getTime() >= now);
  const year = races[0] !== undefined ? new Date(races[0].date).getUTCFullYear() : null;

  function roundStatus(i: number): RoundStatus {
    if (nextIndex === -1) return 'done';
    if (i < nextIndex)   return 'done';
    if (i === nextIndex) return 'next';
    return 'upcoming';
  }

  return (
    <section
      className="home-calendar px-6 py-24 sm:px-10 sm:py-32 lg:px-20"
      data-tempo={tempo}
    >
      <ScanlineReveal className="mx-auto mb-12 max-w-3xl">
        <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.35em] text-accent">
          04 /
        </p>
        <h2 className="font-display text-5xl font-black uppercase leading-none tracking-tight text-off-white sm:text-6xl">
          Season Calendar
          {year !== null && (
            <span className="ml-4 align-middle font-mono text-xl tabular-nums text-silver">
              {year}
            </span>
          )}
        </h2>
      </ScanlineReveal>

      {status === 'loading' && <LoadingState label="Loading season calendar…" />}
      {status === 'error'   && <ErrorState label="Schedule unavailable — can't reach the calendar feed." />}
      {status === 'empty'   && <EmptyState label="No rounds scheduled yet this season." />}

      {status === 'ready' && (
        <SectionReveal className="mx-auto max-w-3xl" staggerDelay={0.035}>
          {races.map((race, i) => {
            const rs = roundStatus(i);
            const location = [race.circuit.locality, race.circuit.country]
              .filter(Boolean)
              .join(', ');
            const isNext = rs === 'next';

            return (
              <div
                key={race.round}
                className={`home-calendar-round home-calendar-round--${rs} grid min-h-[64px] grid-cols-[3rem_1fr_auto] items-center gap-4 border-b py-4${
                  isNext ? ' border-l-2 border-l-accent pl-3' : ''
                }`}
                style={{ borderBottomColor: '#222226' }}
                data-status={rs}
              >
                {/* Round number */}
                <span
                  className="font-mono text-sm tabular-nums"
                  style={{ color: isNext ? 'var(--accent)' : 'var(--color-silver)' }}
                >
                  R{race.round}
                </span>

                {/* Race name + circuit */}
                <div className="min-w-0">
                  <p
                    className="truncate font-display font-black uppercase"
                    style={{
                      fontSize: 'clamp(16px, 1.8vw, 22px)',
                      color: isNext ? 'var(--color-off-white)' : rs === 'done' ? 'var(--color-silver)' : 'var(--color-off-white)',
                    }}
                  >
                    {race.name}
                  </p>
                  <Link
                    href={`/circuit/${race.circuit.id}`}
                    className="truncate font-mono text-xs text-silver transition-opacity hover:opacity-60"
                    tabIndex={0}
                  >
                    {race.circuit.name}{location ? ` · ${location}` : ''}
                  </Link>
                </div>

                {/* Date + status badge */}
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-xs tabular-nums text-silver">
                    {formatDate(race.date)}
                  </span>
                  {/* NEXT badge in accent red; others dimmer */}
                  <span
                    className="font-mono text-[0.58rem] uppercase tracking-[0.22em]"
                    style={{
                      color: isNext
                        ? 'var(--accent)'
                        : rs === 'done'
                          ? 'var(--color-iron)'
                          : 'var(--color-silver)',
                    }}
                  >
                    {STATUS_LABEL[rs]}
                  </span>
                </div>
              </div>
            );
          })}
        </SectionReveal>
      )}
    </section>
  );
}

function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
