import { Redis } from 'ioredis';
import { env } from '../config/env.js';

/**
 * Shared Redis connection — F1Pulse's response cache and BullMQ backend.
 * `lazyConnect` keeps the process bootable even when Redis isn't running yet
 * (e.g. before `docker compose up`); it connects on first command.
 *
 * `maxRetriesPerRequest: null` is required by BullMQ for its blocking commands.
 */
const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(env.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
  });

if (env.nodeEnv !== 'production') {
  globalForRedis.redis = redis;
}
