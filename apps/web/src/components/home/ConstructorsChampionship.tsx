'use client';

/**
 * <ConstructorsChampionship> — maps /api/standings/constructors?season=current
 * onto the shared <StandingsSection>. Same pattern as the drivers section.
 */

import type { UseQueryResult } from '@tanstack/react-query';
import type { ConstructorStandingsDto } from '@/lib/api';
import type { Tempo } from './adaptive';
import type { SectionStatus } from './SectionState';
import { StandingsSection, type StandingRowData } from './StandingsSection';

export function ConstructorsChampionship({
  query,
  tempo,
}: {
  query: UseQueryResult<ConstructorStandingsDto>;
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
    key: s.constructor.id,
    positionText: s.positionText,
    primary: s.constructor.name,
    secondary: s.constructor.nationality ?? undefined,
    points: s.points,
    wins: s.wins,
  }));

  const leaderPoints = rows[0]?.points ?? 0;

  return (
    <StandingsSection
      title="Constructors' Championship"
      tempo={tempo}
      status={status}
      rows={rows}
      leaderPoints={leaderPoints}
      errorLabel="Constructor standings unavailable — can't reach the timing feed."
      emptyLabel="No constructor standings yet this season."
    />
  );
}
