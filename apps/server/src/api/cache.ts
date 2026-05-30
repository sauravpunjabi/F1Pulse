/**
 * Redis cache-aside helpers for F1Pulse's own API.
 *
 * All API responses pass through cacheAside(). On a miss the DB is queried once,
 * the result JSON-serialised, and stored with a TTL. On a hit the stored JSON is
 * returned without touching the DB.
 *
 * TTL policy:
 *   SHORT (5 min)  — current-season endpoints (standings, schedule, live race)
 *   LONG  (24h)    — historical endpoints (data is append-only after ingestion)
 *
 * Redis errors are swallowed and logged — a cache miss just falls through to the DB.
 */
import { cacheRedis as redis } from '../lib/redis.js';

export const TTL = {
  SHORT: 5 * 60, // 5 minutes — current-season data
  LONG: 24 * 60 * 60, // 24 hours  — historical (never changes post-ingest)
} as const;

const PREFIX = 'f1pulse:';
const OP_TIMEOUT_MS = 500; // never let a slow/absent Redis block a request

/** Build a cache key. Components are joined with ':' after the prefix. */
export function cacheKey(...parts: (string | number)[]): string {
  return PREFIX + parts.join(':');
}

/** Race a Redis op against a timeout so the cache can never hang the request. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('redis timeout')), ms)),
  ]);
}

/**
 * Cache-aside: return the cached JSON value if present; otherwise call `fn`,
 * store the result, and return it. Any Redis failure (down, slow, timeout)
 * degrades gracefully to a DB-only read.
 */
export async function cacheAside<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  try {
    const cached = await withTimeout(redis.get(key), OP_TIMEOUT_MS);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }
  } catch {
    // Redis unavailable/slow — fall through to DB.
  }

  const value = await fn();

  try {
    await withTimeout(redis.set(key, JSON.stringify(value), 'EX', ttl), OP_TIMEOUT_MS);
  } catch {
    // Cache write failed — not fatal, just return the value.
  }

  return value;
}

/**
 * Invalidate all keys matching a glob pattern using SCAN (safe for production —
 * never blocks like KEYS). Returns the count of deleted keys.
 */
export async function purgeByPattern(pattern: string): Promise<number> {
  const keys: string[] = [];
  let cursor = '0';
  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
    cursor = next;
    keys.push(...batch);
  } while (cursor !== '0');

  if (keys.length === 0) return 0;

  // DEL accepts multiple keys.
  await redis.del(...keys);
  return keys.length;
}

/** Convenience: purge everything under the f1pulse: namespace. */
export function purgeAll(): Promise<number> {
  return purgeByPattern(`${PREFIX}*`);
}
