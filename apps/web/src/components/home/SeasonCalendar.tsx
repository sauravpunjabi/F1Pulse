'use client';

/**
 * <SeasonCalendar> — every round from /api/schedule?season=current.
 *
 * Each round is marked DONE / NEXT / UPCOMING, computed client-side against the
 * real `new Date()` — never hardcoded. "Next" is the first round whose date is
 * today or later; everything before it is done, everything after is upcoming.
 * If the whole season is in the past, all rounds read DONE.
 *
 * Status is exposed via `data-status` + `home-calendar-round--{status}` class
 * hooks for the art director.
 */

import type { UseQueryResult } from '@tanstack/react-query';
import type { ScheduleDto } from '@/lib/api';
import type { Tempo } from './adaptive';
import type { SectionStatus } from './SectionState';
import { ScanlineReveal, SectionReveal } from '@/components/primitives';
import { LoadingState, ErrorState, EmptyState } from './SectionState';

type RoundStatus = 'done' | 'next' | 'upcoming';

const STATUS_LABEL: Record<RoundStatus, string> = {
  done: 'Done',
  next: 'Next',
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

  // Client-side "today" — the index of the next (first not-yet-past) round.
  const now = Date.now();
  const nextIndex = races.findIndex((r) => new Date(r.date).getTime() >= now);
  const year =
    races[0] !== undefined ? new Date(races[0].date).getUTCFullYear() : null;

  function roundStatus(i: number): RoundStatus {
    if (nextIndex === -1) return 'done'; // whole season already run
    if (i < nextIndex) return 'done';
    if (i === nextIndex) return 'next';
    return 'upcoming';
  }

  return (
    <section
      className="home-calendar px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
      data-tempo={tempo}
    >
      <ScanlineReveal className="mx-auto mb-10 max-w-3xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-off-white sm:text-5xl">
          Season Calendar
          {year !== null && (
            <span className="ml-3 align-middle font-mono text-base tabular-nums text-silver">
              {year}
            </span>
          )}
        </h2>
      </ScanlineReveal>

      {status === 'loading' && <LoadingState label="Loading season calendar…" />}
      {status === 'error' && (
        <ErrorState label="Schedule unavailable — can't reach the calendar feed." />
      )}
      {status === 'empty' && <EmptyState label="No rounds scheduled yet this season." />}

      {status === 'ready' && (
        <SectionReveal className="mx-auto max-w-3xl" staggerDelay={0.04}>
          {races.map((race, i) => {
            const rs = roundStatus(i);
            const location = [race.circuit.locality, race.circuit.country]
              .filter(Boolean)
              .join(', ');
            return (
              <div
                key={race.round}
                className={`home-calendar-round home-calendar-round--${rs} grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-steel/40 py-4`}
                data-status={rs}
              >
                <span className="font-mono text-sm tabular-nums text-silver">
                  R{race.round}
                </span>

                <div className="min-w-0">
                  <p className="truncate font-sans text-base text-off-white">{race.name}</p>
                  <p className="truncate font-mono text-xs text-silver">
                    {race.circuit.name}
                    {location ? ` · ${location}` : ''}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-xs tabular-nums text-silver">
                    {formatDate(race.date)}
                  </span>
                  <span className="home-calendar-badge font-mono text-[0.6rem] uppercase tracking-[0.2em] text-silver">
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
