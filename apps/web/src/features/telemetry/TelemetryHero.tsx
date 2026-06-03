'use client';

import { MaskReveal } from '@/components/primitives/MaskReveal';
import { TelemetryLine } from '@/components/primitives/TelemetryLine';
import type { LiveStatusDto } from '@/lib/api';

interface TelemetryHeroProps {
  status: LiveStatusDto | undefined;
  lastRaceName: string | undefined;
  lastRaceRound: number | undefined;
  lastRaceSeason: number | undefined;
}

export function TelemetryHero({
  status,
  lastRaceName,
  lastRaceRound,
  lastRaceSeason,
}: TelemetryHeroProps) {
  const isLive = status?.status === 'race-live';

  let subLabel: string;
  if (isLive && status?.session) {
    subLabel = `LIVE · ${status.session.type.toUpperCase()} · ${status.weekend?.name ?? ''}`;
  } else if (status?.weekend && status.status !== 'off-season') {
    subLabel = `${status.weekend.name} · Round ${status.weekend.round}`;
  } else if (lastRaceName && lastRaceRound != null) {
    subLabel = `Last Race — ${lastRaceName} · Rd ${lastRaceRound} · ${lastRaceSeason ?? ''}`;
  } else {
    subLabel = 'OFF SEASON';
  }

  return (
    <section
      className="relative flex min-h-[55vh] flex-col justify-end overflow-hidden px-6 pb-16 pt-32 md:px-16"
      aria-label="Telemetry Theatre"
    >
      {/* Scan line grid — purely atmospheric */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,0.025) 31px, rgba(255,255,255,0.025) 32px)',
        }}
      />

      {/* Live pulse when race-live */}
      {isLive && (
        <div
          aria-hidden="true"
          className="absolute right-6 top-32 flex items-center gap-2 md:right-16"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E10600] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E10600]" />
          </span>
          <span className="font-mono text-[0.48rem] uppercase tracking-[0.35em] text-[#E10600]">
            Live
          </span>
        </div>
      )}

      {/* Title */}
      <MaskReveal direction="left" preset="cinematic" trigger="mount">
        <h1
          className="font-display font-black uppercase leading-none tracking-tight text-white"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)' }}
        >
          Telemetry
          <br />
          Theatre
        </h1>
      </MaskReveal>

      {/* Sub-label */}
      <MaskReveal direction="left" preset="measured" delay={0.3} trigger="mount">
        <p className="mt-4 font-mono text-[0.55rem] uppercase tracking-[0.35em] text-white/35">
          {subLabel}
        </p>
      </MaskReveal>

      {/* TelemetryLine accent */}
      <TelemetryLine
        className="mt-8 w-full max-w-lg opacity-40"
        speed="cinematic"
        trigger="mount"
        stroke="var(--accent, #E10600)"
      />
    </section>
  );
}
