'use client';

/**
 * /team/[constructorId] — immersive constructor profile page.
 *
 * Page sequence (choreographed top → bottom):
 *   1. TeamHero              — full-viewport name reveal + livery placeholder
 *   2. TeamIdentityLine      — oversized narrative copy (art director writes it)
 *   3. ChampionshipTimeline  — title years with drivers' champion + points
 *   4. TeamDriverGrid        — all-time driver roster, links to /driver/[id]
 *   5. TeamEraContext        — era badges linking to /history
 *
 * Theme: per-constructor accent + tempo from constructorThemes.ts.
 * Data: zero hardcoded stats — all from /api/constructor/:id.
 */

import { useConstructorProfile } from '@/lib/api';
import { getConstructorTheme } from '@/lib/constructorThemes';
import { TeamHero } from '@/components/team/TeamHero';
import { TeamIdentityLine } from '@/components/team/TeamIdentityLine';
import { ChampionshipTimeline } from '@/components/team/ChampionshipTimeline';
import { TeamDriverGrid } from '@/components/team/TeamDriverGrid';
import { TeamEraContext } from '@/components/team/TeamEraContext';

interface PageProps {
  params: { constructorId: string };
}

export default function TeamPage({ params }: PageProps) {
  const { constructorId } = params;
  const theme = getConstructorTheme(constructorId);
  const profile = useConstructorProfile(constructorId);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (profile.isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <span className="animate-pulse font-mono text-xs uppercase tracking-widest text-white/30">
          Loading
        </span>
      </main>
    );
  }

  // ── Error / not-found ───────────────────────────────────────────────────────
  if (profile.isError || !profile.data) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-white/30">
            Team not found
          </p>
          <p className="mt-2 font-display text-2xl text-white/60">{constructorId}</p>
        </div>
      </main>
    );
  }

  const team = profile.data;

  return (
    <main
      className="relative bg-[--bg] text-[--text-primary]"
      data-team-accent={constructorId}
      data-team-tempo={theme.tempoPreset}
    >
      {/* 1 — Hero */}
      <TeamHero constructor={team} theme={theme} constructorId={constructorId} />

      {/* 2 — Identity line */}
      <TeamIdentityLine constructorId={constructorId} name={team.name} />

      {/* Divider */}
      <div className="mx-6 border-t border-white/10 md:mx-16" aria-hidden="true" />

      {/* 3 — Championship timeline */}
      <ChampionshipTimeline
        championships={team.championships}
        totalChampionships={team.totalChampionships}
      />

      {team.totalChampionships > 0 && (
        <div className="mx-6 border-t border-white/10 md:mx-16" aria-hidden="true" />
      )}

      {/* 4 — Driver roster */}
      <TeamDriverGrid drivers={team.drivers} constructorId={constructorId} />

      {/* Divider */}
      <div className="mx-6 border-t border-white/10 md:mx-16" aria-hidden="true" />

      {/* 5 — Era context */}
      <TeamEraContext firstSeason={team.firstSeason} lastSeason={team.lastSeason} />
    </main>
  );
}
