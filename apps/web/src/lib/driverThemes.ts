/**
 * Driver theme system.
 *
 * Each entry controls three things:
 *   accentColor  — a CSS variable name that maps to a per-driver hue.
 *                  Define the actual color value in globals.css under :root.
 *                  The driver page sets this as a data-attribute so CSS
 *                  cascade handles the rest: [data-driver-accent="verstappen"]
 *   tempoPreset  — pacing class applied to the hero ("fast" | "measured" | "slow").
 *                  The art director uses data-driver-tempo to diverge motion
 *                  speed in CSS/Framer variants.
 *   tagline      — one sentence the art director will write. Leave "" until then.
 *                  Rendered as the identity line (section 2).
 *
 * TODO: Fill accentColor values in globals.css under :root.
 * TODO: Write tagline copy for each driver.
 */

export type TempoPreset = 'fast' | 'measured' | 'slow';

export interface DriverTheme {
  /** CSS variable name. Define in globals.css. e.g. 'var(--driver-verstappen)' */
  accentColor: string;
  tempoPreset: TempoPreset;
  /** Identity line copy. Art director fills this in. */
  tagline: string;
}

export const driverThemes: Record<string, DriverTheme> = {
  // ── Current grid ──────────────────────────────────────────────────────────
  max_verstappen: {
    accentColor: 'var(--driver-verstappen)',
    tempoPreset: 'fast',
    tagline: '',
  },
  hamilton: {
    accentColor: 'var(--driver-hamilton)',
    tempoPreset: 'measured',
    tagline: '',
  },
  leclerc: {
    accentColor: 'var(--driver-leclerc)',
    tempoPreset: 'measured',
    tagline: '',
  },
  norris: {
    accentColor: 'var(--driver-norris)',
    tempoPreset: 'fast',
    tagline: '',
  },
  antonelli: {
    accentColor: 'var(--driver-antonelli)',
    tempoPreset: 'fast',
    tagline: '',
  },
  // ── Legends ───────────────────────────────────────────────────────────────
  senna: {
    accentColor: 'var(--driver-senna)',
    tempoPreset: 'measured',
    tagline: '',
  },
  schumacher: {
    accentColor: 'var(--driver-schumacher)',
    tempoPreset: 'measured',
    tagline: '',
  },
  prost: {
    accentColor: 'var(--driver-prost)',
    tempoPreset: 'slow',
    tagline: '',
  },
  lauda: {
    accentColor: 'var(--driver-lauda)',
    tempoPreset: 'slow',
    tagline: '',
  },
  fangio: {
    accentColor: 'var(--driver-fangio)',
    tempoPreset: 'slow',
    tagline: '',
  },
  vettel: {
    accentColor: 'var(--driver-vettel)',
    tempoPreset: 'measured',
    tagline: '',
  },
  alonso: {
    accentColor: 'var(--driver-alonso)',
    tempoPreset: 'measured',
    tagline: '',
  },
};

/** Default theme applied when a driverId is not in the scaffold above. */
const DEFAULT_THEME: DriverTheme = {
  accentColor: 'var(--accent)',
  tempoPreset: 'measured',
  tagline: '',
};

export function getDriverTheme(driverId: string): DriverTheme {
  return driverThemes[driverId] ?? DEFAULT_THEME;
}

/**
 * Era bands used by DriverEraContext.
 * Each driver's career span is mapped to one or more of these.
 *
 * TODO: Decide final era naming with art director.
 */
export interface EraBand {
  label: string;
  from: number;
  to: number;
}

export const eraBands: EraBand[] = [
  { label: 'Golden Age',     from: 1950, to: 1966 },
  { label: 'Cosworth Era',   from: 1967, to: 1982 },
  { label: 'Turbo Wars',     from: 1983, to: 1988 },
  { label: 'V10 Era',        from: 1989, to: 2005 },
  { label: 'V8 Era',         from: 2006, to: 2013 },
  { label: 'Hybrid Era',     from: 2014, to: 2021 },
  { label: 'Ground Effect',  from: 2022, to: 9999 },
];

/** Returns every era band a driver raced in, given their season list. */
export function getDriverEras(seasons: number[]): EraBand[] {
  if (seasons.length === 0) return [];
  const min = Math.min(...seasons);
  const max = Math.max(...seasons);
  return eraBands.filter((e) => e.from <= max && e.to >= min);
}
