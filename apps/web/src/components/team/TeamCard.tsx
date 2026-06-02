'use client';

/**
 * TeamCard — constructor card for the /teams listing page.
 *
 * Displays: name, nationality, total championships, total wins.
 * Links to /team/[id].
 *
 * All visual decisions expressed as class hooks and data attributes
 * for art-director overrides via CSS.
 */

import Link from 'next/link';
import { MaskReveal } from '@/components/primitives';
import { type ConstructorListItemDto } from '@/lib/api';

interface TeamCardProps {
  constructor: ConstructorListItemDto;
}

export function TeamCard({ constructor: team }: TeamCardProps) {
  return (
    <Link
      href={`/team/${team.id}`}
      className="team-card group relative flex flex-col justify-between overflow-hidden rounded border border-white/10 p-5 transition-colors hover:border-white/25 hover:bg-white/[0.03]"
      data-team-id={team.id}
      aria-label={`${team.name}, ${team.totalChampionships} championship${team.totalChampionships !== 1 ? 's' : ''}`}
    >
      {/* Livery thumbnail placeholder */}
      <div
        className="team-livery-thumb pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* Championship badge — top-left */}
      <div className="mb-auto self-start">
        {team.totalChampionships > 0 && (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/25">
            {team.totalChampionships}× WCC
          </span>
        )}
      </div>

      {/* Team name */}
      <MaskReveal direction="bottom" preset="measured" once>
        <div className="mt-8">
          <p className="font-display text-xl font-black uppercase leading-tight text-white">
            {team.name}
          </p>
          {team.nationality && (
            <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
              {team.nationality}
            </p>
          )}
        </div>
      </MaskReveal>

      {/* Stats row */}
      <div className="mt-4 flex items-center gap-4 font-mono text-[0.6rem] text-white/30">
        <span>{team.totalWins} wins</span>
      </div>
    </Link>
  );
}
