'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import type { SeasonCurrentDto } from '@/lib/api';

interface EditorialBriefingProps {
  season: UseQueryResult<SeasonCurrentDto>;
}

export function EditorialBriefing({ season }: EditorialBriefingProps) {
  const nextRace = season.data?.nextRace;
  const raceLabel = nextRace 
    ? `${nextRace.name} // Round ${nextRace.round.toString().padStart(2, '0')}`
    : 'Monaco Grand Prix // Round 08';

  return (
    <section className="border-t border-b border-broadsheet-rule bg-broadsheet-paper py-10 px-8 md:px-16 text-broadsheet-ink select-none relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
        {/* Column 1 */}
        <div className="flex flex-col pt-4 md:pt-0">
          <span className="broadsheet-label mb-2">01 // Season Profile</span>
          <h4 className="font-serif italic text-lg mb-2 text-broadsheet-accent">MMXXVI Campaign</h4>
          <p className="font-sans text-xs md:text-sm text-broadsheet-ink-soft leading-relaxed">
            The pinnacle of motorsport enters its 76th consecutive campaign. Featuring 24 Grands Prix across 5 continents, leading to the sustainable fuel transition.
          </p>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col border-t border-broadsheet-rule pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-10 lg:pl-12 border-broadsheet-rule">
          <span className="broadsheet-label mb-2">02 // Chronos Index</span>
          <h4 className="font-serif italic text-lg mb-2">1950 → 2026 Archive</h4>
          <p className="font-sans text-xs md:text-sm text-broadsheet-ink-soft leading-relaxed">
            Seventy-six seasons of mechanical evolution. Tracked and cataloged from front-engined pioneers to carbon-hybrid ground-effect machines.
          </p>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col border-t border-broadsheet-rule pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-10 lg:pl-12 border-broadsheet-rule">
          <span className="broadsheet-label mb-2">03 // Campaign Node</span>
          <h4 className="font-serif italic text-lg mb-2">{raceLabel}</h4>
          <p className="font-sans text-xs md:text-sm text-broadsheet-ink-soft leading-relaxed">
            Real-time standings, schedules, and timing grids synced directly from our global ingestion servers. Track the championship progression round-by-round.
          </p>
        </div>
      </div>
    </section>
  );
}
