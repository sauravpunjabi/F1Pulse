'use client';

/**
 * DriverHero — full-viewport opening section.
 *
 * Layout (top → bottom, full-screen):
 *   - .driver-portrait  (full-viewport bg placeholder — user fills with imagery)
 *   - .driver-accent    (atmosphere overlay — art director applies per-driver color)
 *   - Text layer: first name (small, above), surname (giant, MaskReveal), team + era label, flag
 *
 * Data attributes for art-director hooks:
 *   data-driver-accent="<driverId>" — target CSS accent variable
 *   data-driver-tempo="fast|measured|slow" — motion pacing
 *
 * TODO: Replace .driver-portrait with an actual <Image> when photography is ready.
 * TODO: Apply per-driver gradient or overlay color via [data-driver-accent] in globals.css.
 */

import { MaskReveal, SplitTextReveal } from '@/components/primitives';
import { type DriverProfileDto } from '@/lib/api';
import { type DriverTheme } from '@/lib/driverThemes';

interface DriverHeroProps {
  driver: DriverProfileDto;
  theme: DriverTheme;
  driverId: string;
}

/** Extracts a short era label from the career span. */
function heroEraLabel(career: DriverProfileDto['career']): string {
  if (career.length === 0) return '';
  const from = career[0]?.season ?? 0;
  const to = career[career.length - 1]?.season ?? 0;
  return from === to ? String(from) : `${from} – ${to}`;
}

/** Latest constructor name for the team label. */
function latestTeam(career: DriverProfileDto['career']): string {
  const last = career[career.length - 1];
  return last?.constructors[0]?.name ?? '';
}

export function DriverHero({ driver, theme, driverId }: DriverHeroProps) {
  const era = heroEraLabel(driver.career);
  const team = latestTeam(driver.career);

  return (
    <section
      className="driver-hero relative flex min-h-dvh w-full items-end overflow-hidden"
      data-driver-accent={driverId}
      data-driver-tempo={theme.tempoPreset}
      aria-label={`${driver.givenName} ${driver.familyName} hero`}
    >
      {/*
       * Portrait placeholder — art director replaces with per-driver imagery.
       * Full-viewport, object-cover semantics via CSS.
       * TODO: Replace with <Image> once photography assets are sourced.
       */}
      <div
        className="driver-portrait pointer-events-none absolute inset-0"
        aria-hidden="true"
      // TODO: background-image set per-driver via [data-driver-accent] in CSS
      />

      {/*
       * Atmosphere accent layer — tinted overlay, color driven by CSS variable.
       * TODO: Define per-driver gradient in globals.css:
       *   [data-driver-accent="hamilton"] .driver-accent { background: ... }
       */}
      <div
        className="driver-accent pointer-events-none absolute inset-0"
        aria-hidden="true"
      // TODO: opacity and gradient set per-driver via CSS
      />

      {/* Vignette — bottom gradient so text is always readable. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
        aria-hidden="true"
      />

      {/* Text content — anchored to bottom-left. */}
      <div className="relative z-10 w-full px-6 pb-12 md:px-16 md:pb-20">
        {/* First name — small, above the surname. */}
        <MaskReveal direction="bottom" preset="measured" delay={0.1} trigger="mount">
          <p
            className="mb-1 font-mono text-sm uppercase tracking-[0.25em] text-white/60"
          // TODO: color via CSS var when accent is applied
          >
            {driver.givenName}
          </p>
        </MaskReveal>

        {/* Surname — giant condensed type. */}
        <h1
          className="font-display text-[clamp(4rem,14vw,14rem)] font-black uppercase leading-none tracking-tight text-white"
        // TODO: font-stretch condensed once display face is wired
        >
          <SplitTextReveal text={driver.familyName} delay={0.2} stagger={0.035} />
        </h1>

        {/* Team + era meta row. */}
        <MaskReveal direction="bottom" preset="measured" delay={0.45} trigger="mount">
          <div className="mt-4 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-white/50">
            {team && <span>{team}</span>}
            {team && era && <span aria-hidden="true">·</span>}
            {era && <span>{era}</span>}
            {driver.nationality && (
              <>
                <span aria-hidden="true">·</span>
                {/* TODO: render flag icon or ISO code once nationality-to-flag map is built */}
                <span>{driver.nationality}</span>
              </>
            )}
          </div>
        </MaskReveal>
      </div>
    </section>
  );
}
