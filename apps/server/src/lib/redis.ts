import { Redis } from 'ioredis';
import { env } from '../config/env.js';

/**
 * Shared Redis connection — F1Pulse's response cache and BullMQ backend.
 * Points at Upstash Redis (cloud, TLS via rediss:// URL).
 *
 * `maxRetriesPerRequest: null` is required by BullMQ for its blocking commands.
 */
const globalForRedis = globalThis as unknown as { redis?: Redis; cacheRedis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(env.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    tls: {},
  });

/**
 * Dedicated connection for the API response cache. FAILS FAST when Redis is
 * unavailable so a missing/slow Redis degrades gracefully to DB-only reads.
 * Timeout + no offline queue prevents requests from hanging.
 */
export const cacheRedis =
  globalForRedis.cacheRedis ??
  new Redis(env.redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    tls: {},
  });

cacheRedis.on('error', () => {});

if (env.nodeEnv !== 'production') {
  globalForRedis.redis = redis;
  globalForRedis.cacheRedis = cacheRedis;
}
