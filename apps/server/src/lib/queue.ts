import { Queue } from 'bullmq';
import { env } from '../config/env.js';

/**
 * BullMQ scaffolding. Workers and job processors are added on the ingestion day.
 * BullMQ manages its own Redis connections, so we hand it connection options
 * (not the shared `redis` client). Nothing connects at import time.
 */
export const queueConnection = { url: env.redisUrl } as const;

/** Canonical queue names — keeps producers and workers in sync. */
export const QUEUE_NAMES = {
  ingest: 'f1pulse:ingest',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

/** Factory for a queue. Call this lazily (inside request/worker code), not at import. */
export function createQueue<T = unknown>(name: QueueName): Queue<T> {
  return new Queue<T>(name, { connection: queueConnection });
}
