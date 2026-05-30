import { Redis } from 'ioredis';
import { env } from '../config/env.js';

/**
 * Shared Redis connection — F1Pulse's response cache and BullMQ backend.
 * `lazyConnect` keeps the process bootable even when Redis isn't running yet
 * (e.g. before `docker compose up`); it connects on first command.
 *
 * `maxRetriesPerRequest: null` is required by BullMQ for its blocking commands.
 */
const globalForRedis = globalThis as unknown as { redis?: Redis; cacheRedis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(env.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
  });

/**
 * Dedicated connection for the API response cache. Unlike the BullMQ client above,
 * this one FAILS FAST when Redis is unavailable (`enableOfflineQueue: false`) so a
 * missing/slow Redis degrades gracefully to DB-only reads instead of hanging the
 * request. It still reconnects automatically when Redis comes back.
 */
export const cacheRedis =
  globalForRedis.cacheRedis ??
  new Redis(env.redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 1000,
  });

// Swallow connection errors — cacheAside() handles absence by falling back to the DB.
cacheRedis.on('error', () => {});

if (env.nodeEnv !== 'production') {
  globalForRedis.redis = redis;
  globalForRedis.cacheRedis = cacheRedis;
}
