'use client';

/**
 * Act 4 — Defining moment.
 * One IconicMoment per rivalry, with real stat from the API.
 * Narrative is always empty string — user writes copy.
 */

import { IconicMoment, ChampionStat } from '@/components/history/IconicMoment';
import { useEraChampion } from '@/lib/api';
import type { RivalryConfig } from '@/config/rivalries';

interface RivalryDefiningMomentProps {
  config: RivalryConfig;
}

export function RivalryDefiningMoment({ config }: RivalryDefiningMomentProps) {
  const champion = useEraChampion(config.definingYear);

  const stat = champion.data ? (
    <ChampionStat champion={champion.data} />
  ) : champion.isLoading ? (
    <span className="font-mono text-[0.44rem] uppercase tracking-widest text-white/20 animate-pulse">
      Loading&hellip;
    </span>
  ) : null;

  return (
    <IconicMoment
      title={config.definingTitle}
      year={config.definingYear}
      narrative=""
      stat={stat}
      imageSrc={`https://placehold.co/1200x800/0a0a0a/1a1a1a?text=${encodeURIComponent(config.definingYear.toString())}`}
      imageAlt={`${config.definingTitle} — ${config.definingYear}`}
      circuitId={config.definingCircuitId}
      circuitName={config.definingCircuitName}
      pinDuration={600}
    />
  );
}
