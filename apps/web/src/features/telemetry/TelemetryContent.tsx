'use client';

import { useLiveStatus, useLatestResults, useSeasonCurrent } from '@/lib/api';
import { TelemetryHero } from './TelemetryHero';
import { PositionTrace } from './PositionTrace';
import { RaceResultBreakdown } from './RaceResultBreakdown';
import { LiveMode } from './LiveMode';

export function TelemetryContent() {
  const liveStatus = useLiveStatus();
  const latestResults = useLatestResults();
  const seasonCurrent = useSeasonCurrent();

  const status = liveStatus.data;
  const results = latestResults.data;
  const season = seasonCurrent.data;

  return (
    <main
      className="min-h-dvh bg-[--bg] text-[--text-primary]"
      style={{
        '--bg': '#050505',
        '--text-primary': '#f5f5f5',
        '--accent': '#E10600',
      } as React.CSSProperties}
    >
      {/* 1 — Hero */}
      <TelemetryHero
        status={status}
        lastRaceName={results?.raceName}
        lastRaceRound={results?.round}
        lastRaceSeason={results?.season}
      />

      {/* Divider */}
      <div className="mx-6 border-t border-white/8 md:mx-16" aria-hidden="true" />

      {/* 2 — Position trace visualization */}
      {results && results.results.length > 0 && (
        <PositionTrace results={results.results} raceName={results.raceName} />
      )}

      {/* Loading state for results */}
      {latestResults.isLoading && (
        <div className="flex h-40 items-center justify-center px-6 md:px-16">
          <p className="animate-pulse font-mono text-[0.52rem] uppercase tracking-[0.32em] text-white/20">
            Loading telemetry&hellip;
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="mx-6 border-t border-white/8 md:mx-16" aria-hidden="true" />

      {/* 3 — Race result breakdown */}
      {results && (
        <RaceResultBreakdown
          results={results.results}
          raceName={results.raceName}
          season={results.season}
          round={results.round}
        />
      )}

      {/* Divider */}
      <div className="mx-6 border-t border-white/8 md:mx-16" aria-hidden="true" />

      {/* 4 — Live mode / No session */}
      <LiveMode status={status} season={season} />
    </main>
  );
}
