'use client';

/**
 * /teams — current season constructor listing.
 *
 * Displays each team as a TeamCard: name, nationality, total championships,
 * total wins. All data from /api/constructors.
 * Entrance choreography via SectionReveal stagger.
 *
 * TODO: Add portrait/livery thumbnails once assets are sourced.
 * TODO: Sort/filter controls (by championships, by nationality) if needed.
 */

import { useConstructorsList } from '@/lib/api';
import { MaskReveal, SectionReveal } from '@/components/primitives';
import { TeamCard } from '@/components/team/TeamCard';

export default function TeamsPage() {
  const constructors = useConstructorsList();

  return (
    <main className="min-h-dvh bg-[--bg] px-6 py-24 text-[--text-primary] md:px-16">
      {/* Page heading */}
      <MaskReveal direction="bottom" preset="cinematic" trigger="mount">
        <h1 className="mb-2 font-display text-[clamp(2.5rem,8vw,7rem)] font-black uppercase leading-none tracking-tight">
          Teams
        </h1>
      </MaskReveal>
      <MaskReveal direction="bottom" preset="measured" delay={0.2} trigger="mount">
        <p className="mb-16 font-mono text-xs uppercase tracking-[0.25em] text-white/40">
          Current Season
        </p>
      </MaskReveal>

      {/* Loading */}
      {constructors.isLoading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded border border-white/5 bg-white/[0.03]"
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {constructors.isError && (
        <p className="font-mono text-sm text-white/40">
          Could not load teams. Check your API connection.
        </p>
      )}

      {/* Grid */}
      {constructors.data && (
        <SectionReveal
          staggerDelay={0.05}
          preset="measured"
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          {constructors.data.map((team) => (
            <TeamCard key={team.id} constructor={team} />
          ))}
        </SectionReveal>
      )}
    </main>
  );
}
