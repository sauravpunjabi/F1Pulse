/**
 * Constructor (team) theme system.
 *
 * Mirrors driverThemes.ts — same three-field shape:
 *   accentColor  — CSS variable name. Define the value in globals.css under :root.
 *                  The team page sets data-team-accent so the CSS cascade handles
 *                  all per-team visual decisions art-side.
 *   tempoPreset  — motion pacing for the hero ("fast" | "measured" | "slow").
 *                  Applied via data-team-tempo on the page root.
 *   tagline      — one-sentence identity copy. Leave "" until art director fills it.
 *
 * TODO: Fill accentColor values in globals.css under :root.
 * TODO: Write tagline copy for each team.
 */

import { eraBands, type EraBand } from './driverThemes';
export type { TempoPreset, EraBand } from './driverThemes';
export { eraBands };

export interface ConstructorTheme {
  /** CSS variable name. Define in globals.css. e.g. 'var(--team-ferrari)' */
  accentColor: string;
  /** Motion pacing applied to the hero section. */
  tempoPreset: 'fast' | 'measured' | 'slow';
  /** Identity line copy. Art director fills this in. */
  tagline: string;
}

export const constructorThemes: Record<string, ConstructorTheme> = {
  // ── Current grid ──────────────────────────────────────────────────────────
  ferrari: {
    accentColor: 'var(--team-ferrari)',
    tempoPreset: 'fast',
    tagline: '',
  },
  mercedes: {
    accentColor: 'var(--team-mercedes)',
    tempoPreset: 'measured',
    tagline: '',
  },
  mclaren: {
    accentColor: 'var(--team-mclaren)',
    tempoPreset: 'fast',
    tagline: '',
  },
  red_bull: {
    accentColor: 'var(--team-red_bull)',
    tempoPreset: 'fast',
    tagline: '',
  },
  williams: {
    accentColor: 'var(--team-williams)',
    tempoPreset: 'measured',
    tagline: '',
  },
  aston_martin: {
    accentColor: 'var(--team-aston_martin)',
    tempoPreset: 'measured',
    tagline: '',
  },
  alpine: {
    accentColor: 'var(--team-alpine)',
    tempoPreset: 'measured',
    tagline: '',
  },
  haas: {
    accentColor: 'var(--team-haas)',
    tempoPreset: 'fast',
    tagline: '',
  },
  rb: {
    accentColor: 'var(--team-rb)',
    tempoPreset: 'fast',
    tagline: '',
  },
  sauber: {
    accentColor: 'var(--team-sauber)',
    tempoPreset: 'slow',
    tagline: '',
  },
  cadillac: {
    accentColor: 'var(--team-cadillac)',
    tempoPreset: 'fast',
    tagline: '',
  },
  audi: {
    accentColor: 'var(--team-audi)',
    tempoPreset: 'measured',
    tagline: '',
  },
};

/** Default theme for constructors not in the scaffold above. */
const DEFAULT_THEME: ConstructorTheme = {
  accentColor: 'var(--accent)',
  tempoPreset: 'measured',
  tagline: '',
};

export function getConstructorTheme(constructorId: string): ConstructorTheme {
  return constructorThemes[constructorId] ?? DEFAULT_THEME;
}

/**
 * Returns the era bands a constructor was active in, derived from their
 * firstSeason / lastSeason span (inclusive).
 */
export function getConstructorEras(
  firstSeason: number | null,
  lastSeason: number | null,
): EraBand[] {
  if (firstSeason === null || lastSeason === null) return [];
  return eraBands.filter((e) => e.from <= lastSeason && e.to >= firstSeason);
}

/**
 * Copy scaffold keyed by constructorId. Art director writes the narrative.
 * Fallback: "The story of {name}." rendered in TeamIdentityLine.
 */
export const teamCopy: Record<string, string> = {
  ferrari: '',
  mercedes: '',
  mclaren: '',
  red_bull: '',
  williams: '',
  aston_martin: '',
  alpine: '',
  haas: '',
  rb: '',
  sauber: '',
  cadillac: '',
  audi: '',
};
