/**
 * Pure conversion helpers: raw Ergast strings → real JS types.
 * Ergast encodes every value as a string and omits absent fields, so these are
 * deliberately tolerant (return null/fallback rather than throwing).
 */
import type { ErgastSession } from './ergast-types.js';

/** Parse an integer; fall back to `fallback` when missing or non-numeric. */
export function int(value: string | undefined, fallback = 0): number {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isNaN(n) ? fallback : n;
}

/** Parse an integer or return null when absent/non-numeric. */
export function intOrNull(value: string | undefined): number | null {
  if (value === undefined || value === '') return null;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

/** Parse a float; fall back to `fallback` when missing or non-numeric. */
export function float(value: string | undefined, fallback = 0): number {
  const n = Number.parseFloat(value ?? '');
  return Number.isNaN(n) ? fallback : n;
}

/** Parse a float or return null when absent/non-numeric. */
export function floatOrNull(value: string | undefined): number | null {
  if (value === undefined || value === '') return null;
  const n = Number.parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

/** Non-empty string or null. */
export function strOrNull(value: string | undefined): string | null {
  return value === undefined || value === '' ? null : value;
}

/** A date-only value (e.g. dateOfBirth "1998-02-15") → Date at UTC midnight, or null. */
export function dateOrNull(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Combine an Ergast date ("2026-03-08") and optional time ("04:00:00Z") into a
 * single UTC Date. When time is absent, defaults to UTC midnight.
 */
export function dateTime(date: string, time?: string): Date {
  const iso = time ? `${date}T${time}` : `${date}T00:00:00Z`;
  return new Date(iso);
}

/** Session {date, time} → UTC Date, or null when the session is absent. */
export function sessionDateTime(session: ErgastSession | undefined): Date | null {
  if (!session) return null;
  return dateTime(session.date, session.time);
}
