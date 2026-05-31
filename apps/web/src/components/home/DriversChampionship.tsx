'use client';

/**
 * <DriversChampionship> — maps /api/standings/drivers?season=current onto the
 * shared <StandingsSection>. Zero hardcoded data; everything comes from the
 * query passed down by the page.
 */

import type { UseQueryResult } from '@tanstack/react-query';
import type { StandingsDto } from '@/lib/api';
import type { Tempo } from './adaptive';
import type { SectionStatus } from './SectionState';
import { StandingsSection, type StandingRowData } from './StandingsSection';

export function DriversChampionship({
  query,
  tempo,
}: {
  query: UseQueryResult<StandingsDto>;
  tempo: Tempo;
}) {
  const standings = query.data?.standings ?? [];

  const status: SectionStatus = query.isLoading
    ? 'loading'
    : query.isError
      ? 'error'
      : standings.length === 0
        ? 'empty'
        : 'ready';

  const rows: StandingRowData[] = standings.map((s) => ({
    key: s.driver.id,
    positionText: s.positionText,
    primary: `${s.driver.givenName} ${s.driver.familyName}`,
    secondary: s.constructors.map((c) => c.name).join(', ') || undefined,
    points: s.points,
    wins: s.wins,
  }));

  const leaderPoints = rows[0]?.points ?? 0;

  return (
    <StandingsSection
      title="Drivers' Championship"
      tempo={tempo}
      status={status}
      rows={rows}
      leaderPoints={leaderPoints}
      errorLabel="Driver standings unavailable — can't reach the timing feed."
      emptyLabel="No driver standings yet this season."
    />
  );
}
