/**
 * Ingest scheduler: registers a repeatable BullMQ job that keeps the current
 * season data fresh. Also exports a manual trigger for the admin API.
 *
 * Cadence:
 *   - 60 min normally (a race result lands, Jolpica picks it up within ~30 min)
 *   - 5 min during live sessions (wired once the /api/live/status endpoint exists —
 *     stub in place, checked by the scheduler loop)
 *
 * After each successful run the worker purges current-season Redis keys, so the
 * next API request re-fetches from Postgres which now has the latest data.
 */
import { Queue } from 'bullmq';
import { queueConnection, QUEUE_NAMES } from '../lib/queue.js';

/* eslint-disable no-console */

const JOB_NAME = 'ingest-current';
const NORMAL_INTERVAL_MS = 60 * 60 * 1000; // 60 min
const LIVE_INTERVAL_MS = 5 * 60 * 1000; // 5 min during an active race session

let ingestQueue: Queue | null = null;

function getQueue(): Queue {
  if (!ingestQueue) {
    ingestQueue = new Queue(QUEUE_NAMES.ingest, { connection: queueConnection });
  }
  return ingestQueue;
}

/**
 * Register (or re-register) the repeatable ingest job.
 * Called once on server startup. Safe to call multiple times — removes the old
 * repeatable before adding the new one to avoid duplicate scheduling.
 */
export async function registerIngestJob(): Promise<void> {
  const queue = getQueue();

  // Remove any existing repeatable jobs for this name to avoid dupes on restart.
  const existing = await queue.getRepeatableJobs();
  for (const job of existing) {
    if (job.name === JOB_NAME) {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  await queue.add(
    JOB_NAME,
    {},
    {
      repeat: { every: NORMAL_INTERVAL_MS },
      removeOnComplete: { count: 10 },
      removeOnFail: { count: 5 },
    },
  );

  console.log(
    `▸ BullMQ repeatable job registered: "${JOB_NAME}" (every ${NORMAL_INTERVAL_MS / 60000} min)`,
  );
}

/**
 * Re-register the repeatable job with the appropriate interval.
 * Called by the worker after each successful run so the next cycle reflects
 * whether we are in a live session (5 min) or normal (60 min).
 */
export async function updateJobCadence(isLive: boolean): Promise<void> {
  const intervalMs = isLive ? LIVE_INTERVAL_MS : NORMAL_INTERVAL_MS;
  const queue = getQueue();

  const existing = await queue.getRepeatableJobs();
  for (const job of existing) {
    if (job.name === JOB_NAME) {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  await queue.add(
    JOB_NAME,
    {},
    {
      repeat: { every: intervalMs },
      removeOnComplete: { count: 10 },
      removeOnFail: { count: 5 },
    },
  );

  console.log(
    `▸ BullMQ cadence updated: "${JOB_NAME}" → every ${intervalMs / 60000} min (${isLive ? 'LIVE' : 'normal'})`,
  );
}

/**
 * Fire a one-off ingest job right now (admin manual trigger).
 * Returns the new job's ID.
 */
export async function triggerIngestNow(): Promise<string> {
  const queue = getQueue();
  const job = await queue.add(`${JOB_NAME}-manual`, {}, { removeOnComplete: 5, removeOnFail: 3 });
  console.log(`▸ BullMQ manual ingest triggered — job id: ${job.id}`);
  return job.id ?? 'unknown';
}

/**
 * Gracefully close the queue connection on shutdown.
 * Call this in the SIGINT/SIGTERM handler alongside server.close().
 */
export async function closeIngestQueue(): Promise<void> {
  await ingestQueue?.close();
}
