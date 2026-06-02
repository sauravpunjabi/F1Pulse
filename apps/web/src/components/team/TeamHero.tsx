'use client';

/**
 * TeamHero — full-viewport opening section.
 *
 * Layout:
 *   - .team-livery  (full-viewport bg — art director provides imagery)
 *   - .team-accent  (atmosphere overlay — art director applies per-team color)
 *   - Text layer: team name via MaskReveal, nationality + year in mono label
 *
 * Data attributes for CSS cascade:
 *   data-team-accent="<constructorId>" — accent var target
 *   data-team-tempo="fast|measured|slow" — motion pacing
 *
 * TODO: Replace .team-livery with actual car/livery <Image> when assets are ready.
 * TODO: Per-team gradients in globals.css via [data-team-accent="ferrari"] etc.
 */

import { MaskReveal } from '@/components/primitives';
import { type ConstructorProfileDto } from '@/lib/api';
import { type ConstructorTheme } from '@/lib/constructorThemes';

interface TeamHeroProps {
  constructor: ConstructorProfileDto;
  theme: ConstructorTheme;
  constructorId: string;
}

export function TeamHero({ constructor: team, theme, constructorId }: TeamHeroProps) {
  const activeSpan =
    team.firstSeason && team.lastSeason
      ? team.firstSeason === team.lastSeason
        ? String(team.firstSeason)
        : `${team.firstSeason} – ${team.lastSeason}`
      : null;

  return (
    <section
      className="team-hero relative flex min-h-dvh w-full items-end overflow-hidden"
      data-team-accent={constructorId}
      data-team-tempo={theme.tempoPreset}
      aria-label={`${team.name} hero`}
    >
      {/*
       * Livery / car imagery placeholder.
       * Art director replaces with per-team <Image>.
       * TODO: background-image set via [data-team-accent] CSS selectors.
       */}
      <div className="team-livery pointer-events-none absolute inset-0" aria-hidden="true" />

      {/*
       * Atmosphere overlay — tinted per team via CSS.
       * TODO: Define per-team gradient in globals.css.
       */}
      <div className="team-accent pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Bottom vignette — keeps text legible over any imagery. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
        aria-hidden="true"
      />

      {/* Text — anchored bottom-left. */}
      <div className="relative z-10 w-full px-6 pb-12 md:px-16 md:pb-20">
        {/* Nationality label */}
        <MaskReveal direction="bottom" preset="measured" delay={0.1} trigger="mount">
          <p className="mb-1 font-mono text-sm uppercase tracking-[0.25em] text-white/60">
            {team.nationality ?? ''}
          </p>
        </MaskReveal>

        {/* Team name — giant display type. */}
        <MaskReveal direction="bottom" preset="cinematic" delay={0.2} trigger="mount">
          <h1 className="font-display text-[clamp(3rem,11vw,11rem)] font-black uppercase leading-none tracking-tight text-white">
            {team.name}
          </h1>
        </MaskReveal>

        {/* Founded / active span + nationality meta row. */}
        <MaskReveal direction="bottom" preset="measured" delay={0.45} trigger="mount">
          <div className="mt-4 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-white/50">
            {activeSpan && <span>{activeSpan}</span>}
            {activeSpan && team.nationality && <span aria-hidden="true">·</span>}
            {team.nationality && <span>{team.nationality}</span>}
          </div>
        </MaskReveal>
      </div>
    </section>
  );
}
