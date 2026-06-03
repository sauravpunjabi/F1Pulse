'use client';

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
      className="home-hero relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-24 sm:px-10 lg:px-20"
      data-tempo={tempo}
    >
      {revealed && (
        <div className="relative z-10 flex max-w-6xl flex-col gap-10">

          {/* ── Section index + season label ────────────────────────────── */}
          <MaskReveal trigger="mount" preset="measured" delay={0.05} direction="left">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-accent">
              01 /{' '}
              <span className="text-silver">
                {season.data ? `Season ${season.data.year}` : 'Season'}
              </span>
            </p>
          </MaskReveal>

          {/* ── Oversized hero title ─────────────────────────────────────── */}
          <MaskReveal trigger="mount" preset="cinematic" delay={0.12} direction="left">
            <h1
              className="font-display font-black uppercase leading-[0.88] tracking-tight text-off-white"
              style={{ fontSize: 'clamp(80px, 15vw, 220px)' }}
            >
              F1Pulse
            </h1>
          </MaskReveal>

          {/* ── Next-race strip ──────────────────────────────────────────── */}
          <MaskReveal trigger="mount" preset="measured" delay={0.3} direction="left">
            <NextRaceStrip
              race={season.data?.nextRace ?? null}
              isError={season.isError}
              tempo={tempo}
            />
          </MaskReveal>

          {/* ── Championship leader ──────────────────────────────────────── */}
          <MaskReveal trigger="mount" preset="measured" delay={0.45} direction="left">
            <LeaderStrip leader={leader} isError={drivers.isError} />
          </MaskReveal>
        </div>
      )}

      {/* Telemetry motif along the bottom */}
      {revealed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10 lg:px-20">
          <TelemetryLine
            trigger="mount"
            speed={tempo === 'live' ? 'sharp' : 'cinematic'}
            className="h-12 w-full opacity-50 sm:h-16"
          />
        </div>
      )}
    </section>
  );
}

// ── Next-race strip ───────────────────────────────────────────────────────────

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
    return <p className="font-mono text-sm text-silver">Next race unavailable.</p>;
  }
  if (!race) {
    return <p className="font-mono text-sm text-silver">No upcoming race scheduled.</p>;
  }

  const location = [race.circuit.locality, race.circuit.country].filter(Boolean).join(', ');

  return (
    <div className="flex flex-col gap-3" data-tempo={tempo}>
      <div className="flex flex-col gap-1">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-silver">
          Next Race · Round {race.round}
        </p>
        <p className="font-display text-3xl font-bold uppercase text-off-white sm:text-4xl">
          {race.name}
        </p>
        <p className="font-mono text-xs text-silver">
          {race.circuit.name}{location ? ` · ${location}` : ''}
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

  if (!countdown) {
    return <p className="font-mono text-xs tabular-nums text-silver">{dateLabel}</p>;
  }
  if (countdown.isPast) {
    return (
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-off-white">Lights out</p>
    );
  }

  return (
    <div className="flex items-end gap-5" aria-label={`Countdown to ${dateLabel}`}>
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
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-3xl tabular-nums text-off-white sm:text-4xl">{shown}</span>
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-silver">{label}</span>
    </div>
  );
}

// ── Championship leader strip ─────────────────────────────────────────────────

function LeaderStrip({
  leader,
  isError,
}: {
  leader: StandingsDto['standings'][number] | undefined;
  isError: boolean;
}) {
  if (isError) {
    return <p className="font-mono text-sm text-silver">Championship leader unavailable.</p>;
  }
  if (!leader) {
    return <p className="font-mono text-sm text-silver">No standings yet this season.</p>;
  }

  const team = leader.constructors.map((c) => c.name).join(', ');

  return (
    <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-silver">
        Championship Leader
      </p>
      {/* Leader name in red — the data point that matters most */}
      <p className="font-display text-4xl font-black uppercase text-accent sm:text-5xl">
        {leader.driver.givenName} {leader.driver.familyName}
      </p>
      <p className="font-mono text-xs tabular-nums text-silver">
        {leader.points} pts · {leader.wins} {leader.wins === 1 ? 'win' : 'wins'}
        {team ? ` · ${team}` : ''}
      </p>
    </div>
  );
}
