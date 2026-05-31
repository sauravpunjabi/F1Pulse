'use client';

/**
 * <Hero> — the opening frame of the homepage, revealed when the loader wipes.
 *
 * Composed entirely from real API data + the motion primitives:
 *   - Oversized title via <MaskReveal> (cinematic)
 *   - Current season label in mono            (/api/season/current)
 *   - Next-race strip + ticking countdown     (/api/season/current → nextRace)
 *   - Championship leader: name / points / wins (/api/standings/drivers)
 *   - <TelemetryLine> motif along the bottom
 *
 * The hero's entrance is gated on `revealed` (set when the loader's wipe
 * begins) so the title's cinematic mask plays as the curtain lifts — not while
 * it's still hidden behind the loader. Before `revealed`, only the atmospheric
 * backdrop shows through.
 *
 * `tempo` scaffolds the adaptive state: when 'live' the next-race ticker is
 * marked prominent and the telemetry motif draws faster. The art director
 * applies the actual visual divergence via the data-tempo / class hooks.
 */

import type { UseQueryResult } from '@tanstack/react-query';
import type { RaceScheduleDto, SeasonCurrentDto, StandingsDto } from '@/lib/api';
import type { Tempo } from './adaptive';
import { MaskReveal, TelemetryLine } from '@/components/primitives';
import { useCountdown } from './useCountdown';

export interface HeroProps {
  season: UseQueryResult<SeasonCurrentDto>;
  drivers: UseQueryResult<StandingsDto>;
  revealed: boolean;
  tempo: Tempo;
}

export function Hero({ season, drivers, revealed, tempo }: HeroProps) {
  const leader = drivers.data?.standings[0];

  return (
    <section
      className="home-hero relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-24 sm:px-10 lg:px-16"
      data-tempo={tempo}
    >
      {/* Entrance is gated on the loader's wipe to keep the choreography ordered. */}
      {revealed && (
        <div className="relative z-10 flex max-w-5xl flex-col gap-8">
          {/* ── Season label (mono) ──────────────────────────────────────── */}
          <MaskReveal trigger="mount" preset="measured" delay={0.05} direction="left">
            <p className="font-mono text-xs uppercase tracking-[0.45em] text-silver">
              {season.isError ? (
                'Season unavailable'
              ) : season.data ? (
                <>
                  Season{' '}
                  <span className="tabular-nums text-off-white">{season.data.year}</span>
                </>
              ) : (
                'Season'
              )}
            </p>
          </MaskReveal>

          {/* ── Oversized title ──────────────────────────────────────────── */}
          <MaskReveal trigger="mount" preset="cinematic" delay={0.15} direction="left">
            <h1 className="font-display text-6xl font-semibold leading-[0.92] tracking-tight text-off-white sm:text-8xl lg:text-[10rem]">
              F1Pulse
            </h1>
          </MaskReveal>

          {/* ── Next-race strip + countdown ──────────────────────────────── */}
          <MaskReveal trigger="mount" preset="measured" delay={0.35} direction="left">
            <NextRaceStrip
              race={season.data?.nextRace ?? null}
              isError={season.isError}
              tempo={tempo}
            />
          </MaskReveal>

          {/* ── Championship leader ──────────────────────────────────────── */}
          <MaskReveal trigger="mount" preset="measured" delay={0.5} direction="left">
            <LeaderStrip leader={leader} isError={drivers.isError} />
          </MaskReveal>
        </div>
      )}

      {/* ── Telemetry motif along the bottom ───────────────────────────────
          Adaptive: draws faster when a session is live. */}
      {revealed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10 lg:px-16">
          <TelemetryLine
            trigger="mount"
            speed={tempo === 'live' ? 'sharp' : 'cinematic'}
            className="h-12 w-full opacity-70 sm:h-16"
          />
        </div>
      )}
    </section>
  );
}

// ── Next-race strip ───────────────────────────────────────────────────────

function NextRaceStrip({
  race,
  isError,
  tempo,
}: {
  race: RaceScheduleDto | null;
  isError: boolean;
  tempo: Tempo;
}) {
  const countdown = useCountdown(race?.date);

  if (isError) {
    return (
      <p className="font-mono text-sm text-silver">
        Next race unavailable — can&apos;t reach the schedule feed.
      </p>
    );
  }

  if (!race) {
    // Honest empty: season over / nothing scheduled. Never fabricated.
    return <p className="font-mono text-sm text-silver">No upcoming race scheduled.</p>;
  }

  const location = [race.circuit.locality, race.circuit.country].filter(Boolean).join(', ');

  return (
    <div
      // data-prominent is the art-director hook for the "ticker more prominent
      // when live" requirement.
      className="home-next-race flex flex-col gap-3"
      data-tempo={tempo}
      data-prominent={tempo === 'live' || undefined}
    >
      <div className="flex flex-col gap-1">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-silver">
          Next Race · Round {race.round}
        </p>
        <p className="font-sans text-xl font-medium text-off-white sm:text-2xl">
          {race.name}
        </p>
        <p className="font-mono text-xs text-silver">
          {race.circuit.name}
          {location ? ` · ${location}` : ''}
        </p>
      </div>

      <CountdownReadout countdown={countdown} dateIso={race.date} />
    </div>
  );
}

function CountdownReadout({
  countdown,
  dateIso,
}: {
  countdown: ReturnType<typeof useCountdown>;
  dateIso: string;
}) {
  const dateLabel = new Date(dateIso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  // Before the first client tick, show the date alone (avoids hydration drift).
  if (!countdown) {
    return <p className="font-mono text-xs tabular-nums text-steel">{dateLabel}</p>;
  }

  if (countdown.isPast) {
    return (
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-off-white">
        Lights out
      </p>
    );
  }

  return (
    <div className="home-countdown flex items-end gap-4" aria-label={`Countdown to ${dateLabel}`}>
      <Unit value={countdown.days} label="days" />
      <Unit value={countdown.hours} label="hrs" pad />
      <Unit value={countdown.minutes} label="min" pad />
      <Unit value={countdown.seconds} label="sec" pad />
    </div>
  );
}

function Unit({ value, label, pad = false }: { value: number; label: string; pad?: boolean }) {
  const shown = pad ? String(value).padStart(2, '0') : String(value);
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-2xl tabular-nums text-off-white sm:text-3xl">{shown}</span>
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-silver">
        {label}
      </span>
    </div>
  );
}

// ── Championship leader strip ─────────────────────────────────────────────

function LeaderStrip({
  leader,
  isError,
}: {
  leader: StandingsDto['standings'][number] | undefined;
  isError: boolean;
}) {
  if (isError) {
    return (
      <p className="font-mono text-sm text-silver">
        Championship leader unavailable — can&apos;t reach the standings feed.
      </p>
    );
  }

  if (!leader) {
    return <p className="font-mono text-sm text-silver">No standings yet this season.</p>;
  }

  const team = leader.constructors.map((c) => c.name).join(', ');

  return (
    <div className="home-leader flex flex-col gap-1">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-silver">
        Championship Leader
      </p>
      <p className="font-sans text-xl font-medium text-off-white sm:text-2xl">
        {leader.driver.givenName} {leader.driver.familyName}
      </p>
      <p className="font-mono text-xs tabular-nums text-silver">
        {leader.points} pts · {leader.wins} {leader.wins === 1 ? 'win' : 'wins'}
        {team ? ` · ${team}` : ''}
      </p>
    </div>
  );
}
