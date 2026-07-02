// ─────────────────────────────────────────────────────────────────────────────
// Grand Tour — cosmetic metadata only.
//
// Everything in this file is COSMETIC per CLAUDE.md hard rules: static
// geography (country → continent/alpha-3, same category as nationality flags)
// and hand-written narrative copy keyed by circuitId. No numbers, results,
// standings or schedules live here — those all flow from the API.
// ─────────────────────────────────────────────────────────────────────────────

export interface CountryMeta {
  region: string;
  cc: string; // alpha-3 style display code
}

/** Static geography for every country F1 has visited. Keys match Ergast
 *  country strings (which mix short and long forms, e.g. "UK" and "USA"). */
const COUNTRY_META: Record<string, CountryMeta> = {
  Argentina: { region: 'Americas', cc: 'ARG' },
  Australia: { region: 'Oceania', cc: 'AUS' },
  Austria: { region: 'Europe', cc: 'AUT' },
  Azerbaijan: { region: 'Asia', cc: 'AZE' },
  Bahrain: { region: 'Middle East', cc: 'BHR' },
  Belgium: { region: 'Europe', cc: 'BEL' },
  Brazil: { region: 'Americas', cc: 'BRA' },
  Canada: { region: 'Americas', cc: 'CAN' },
  China: { region: 'Asia', cc: 'CHN' },
  France: { region: 'Europe', cc: 'FRA' },
  Germany: { region: 'Europe', cc: 'GER' },
  Hungary: { region: 'Europe', cc: 'HUN' },
  India: { region: 'Asia', cc: 'IND' },
  Italy: { region: 'Europe', cc: 'ITA' },
  Japan: { region: 'Asia', cc: 'JPN' },
  Korea: { region: 'Asia', cc: 'KOR' },
  Malaysia: { region: 'Asia', cc: 'MYS' },
  Mexico: { region: 'Americas', cc: 'MEX' },
  Monaco: { region: 'Europe', cc: 'MON' },
  Morocco: { region: 'Africa', cc: 'MAR' },
  Netherlands: { region: 'Europe', cc: 'NED' },
  Portugal: { region: 'Europe', cc: 'POR' },
  Qatar: { region: 'Middle East', cc: 'QAT' },
  Russia: { region: 'Europe', cc: 'RUS' },
  'Saudi Arabia': { region: 'Middle East', cc: 'SAU' },
  Singapore: { region: 'Asia', cc: 'SGP' },
  'South Africa': { region: 'Africa', cc: 'RSA' },
  Spain: { region: 'Europe', cc: 'ESP' },
  Sweden: { region: 'Europe', cc: 'SWE' },
  Switzerland: { region: 'Europe', cc: 'SUI' },
  Turkey: { region: 'Europe', cc: 'TUR' },
  UAE: { region: 'Middle East', cc: 'UAE' },
  'United Arab Emirates': { region: 'Middle East', cc: 'UAE' },
  UK: { region: 'Europe', cc: 'GBR' },
  'United Kingdom': { region: 'Europe', cc: 'GBR' },
  USA: { region: 'Americas', cc: 'USA' },
  'United States': { region: 'Americas', cc: 'USA' },
  Vietnam: { region: 'Asia', cc: 'VIE' },
};

/** Filter-chip ordering. Regions not present in the season are skipped. */
export const REGION_ORDER = [
  'Europe',
  'Asia',
  'Middle East',
  'Americas',
  'Oceania',
  'Africa',
] as const;

export function regionFor(country: string | null): string {
  if (!country) return 'World';
  return COUNTRY_META[country]?.region ?? 'World';
}

export function ccFor(country: string | null): string {
  if (!country) return '···';
  return COUNTRY_META[country]?.cc ?? country.slice(0, 3).toUpperCase();
}

// ── Narrative copy (hand-written editorial beats, keyed by circuitId) ────────

const BEATS: Record<string, string> = {
  albert_park:
    'Lights out, first. The parkland sweeps around Albert Park lake have opened the modern season for a generation.',
  shanghai:
    "Drawn as the character 上 — 'rising'. A snail of a first corner unwinds into one of the longest straights in the sport.",
  suzuka:
    "The only figure-of-eight on the calendar — the track crosses over itself. The Esses and 130R remain a driver's true examination.",
  bahrain:
    'Floodlit desert stop-go. Heavy braking zones under the lights make it the great early-season equaliser.',
  jeddah:
    'The fastest street circuit ever built — blind, walled and flat-out along the Red Sea corniche.',
  miami:
    'A circuit wrapped around the Hard Rock Stadium, complete with a faux marina. Spectacle first — but a quick, technical middle sector.',
  villeneuve:
    "An island circuit of long straights and tight chicanes. The 'Wall of Champions' has ended more than a few title runs.",
  monaco:
    "The crown jewel — run through the principality's streets since before the championship existed. Qualifying is everything; overtaking is a rumour.",
  catalunya:
    "Every engineer's reference track — drivers have tested here so often they could lap it blind. Aero efficiency is laid bare.",
  red_bull_ring:
    'Short, sharp and brutal on brakes — long climbs and heavy stops, all framed by the Styrian mountains.',
  silverstone:
    'Where it all began — home of the first World Championship race. Maggotts–Becketts is the finest high-speed sequence in racing.',
  spa: 'The longest lap on the calendar, carved through the Ardennes forest. Eau Rouge–Raidillon: still the most feared corner in the sport.',
  hungaroring:
    'Monaco without the walls — twisty, dusty and relentless. Track position is gold; the only place to pass is the long run to Turn 1.',
  zandvoort:
    'Banked corners by the North Sea dunes. The steep, cambered final turn launches cars onto the straight like a velodrome.',
  monza:
    'The Temple of Speed. The lowest-downforce weekend of the year, slipstreams on the straights, and the tifosi turning red.',
  madring:
    "A hybrid street-and-permanent layout around IFEMA, with a banked corner echoing Spain's racing past.",
  baku: 'A flat-out blast past the Caspian flanked by the tight, medieval old-town walls. Equal parts top speed and claustrophobia.',
  marina_bay:
    'The original night race — humid, bumpy and almost two hours long. A brutal physical test under the Marina Bay skyline.',
  americas:
    "A steep blind climb to Turn 1, then a homage lap — Silverstone's esses, Hockenheim's stadium, all rebuilt in Texas.",
  rodriguez:
    'Thin mountain air starves the engines and the wings. The lap finishes through a roaring baseball stadium.',
  interlagos:
    'Interlagos — compact, anticlockwise and run on the throttle. Few circuits have delivered more title-deciding drama.',
  vegas:
    'Midnight on the Strip. A long straight down Las Vegas Boulevard, neon overhead, slipstreams all the way.',
  losail:
    'A flowing motorcycle circuit run under lights — fast, sweeping, and savagely demanding on the neck and the tyres.',
  yas_marina:
    'The finale. A twilight race that starts in daylight and ends under floodlights — where seasons, and legacies, are settled.',
};

export function beatFor(circuitId: string): string | null {
  return BEATS[circuitId] ?? null;
}

// ── Formatting helpers ────────────────────────────────────────────────────────

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

/** "2026-03-08T04:00:00.000Z" → "MAR 08" (UTC — avoids TZ date drift). */
export function dateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const month = MONTHS[d.getUTCMonth()] ?? '—';
  return `${month} ${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** Inclusive month span of a set of ISO dates, e.g. March→December = 10. */
export function monthSpan(isoDates: readonly string[]): number {
  let min = Infinity;
  let max = -Infinity;
  for (const iso of isoDates) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    const m = d.getUTCFullYear() * 12 + d.getUTCMonth();
    min = Math.min(min, m);
    max = Math.max(max, m);
  }
  if (!Number.isFinite(min)) return 0;
  return max - min + 1;
}

/** 2026 → "MMXXVI" for the editorial masthead. */
export function romanYear(year: number): string {
  if (!Number.isFinite(year) || year <= 0) return '';
  const table: ReadonlyArray<readonly [number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let n = Math.floor(year);
  let out = '';
  for (const [value, glyph] of table) {
    while (n >= value) {
      out += glyph;
      n -= value;
    }
  }
  return out;
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** 43.7347 / 7.42056 → "43.73°N", "7.42°E" for the dossier stat cells. */
export function formatLat(lat: number): string {
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
}
export function formatLng(lng: number): string {
  return `${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;
}
