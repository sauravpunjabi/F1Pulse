/**
 * BullMQ Worker: runs ingestCurrentSeason() then purges stale current-season
 * cache keys so the next API request re-populates from fresh data.
 *
 * Runs as a persistent background process alongside Express (see index.ts).
 * All Redis I/O goes through the queue connection, not the shared API cache client.
 */
import { Worker, type Job } from 'bullmq';
import { queueConnection, QUEUE_NAMES } from '../lib/queue.js';
import { ingestCurrentSeason } from '../ingest/ingest.js';
import { purgeByPattern } from '../api/cache.js';
import { env } from '../config/env.js';
import { deriveWeekendStatus, isLiveSession } from '../live/session-state.js';
import { updateJobCadence } from './ingest-scheduler.js';

/* eslint-disable no-console */

export function createIngestWorker(): Worker {
  const worker = new Worker(
    QUEUE_NAMES.ingest,
    async (job: Job) => {
      const start = Date.now();
      console.log(`[worker] job ${job.id} (${job.name}) started`);

      const summary = await ingestCurrentSeason((msg) => console.log(`  · ${msg}`));
      const year = summary.seasonYear;

      // Purge all current-season cache keys so the next request hits DB for fresh data.
      const purgeable = [
        'f1pulse:season:current',
        `f1pulse:standings:drivers:${year}`,
        `f1pulse:standings:constructors:${year}`,
        `f1pulse:schedule:${year}`,
        // Era routes for the current year
        `f1pulse:era:${year}:*`,
      ];
      let purged = 0;
      for (const pattern of purgeable) {
        purged += await purgeByPattern(pattern);
      }
      // Round results are keyed f1pulse:results:<year>:<round>
      purged += await purgeByPattern(`f1pulse:results:${year}:*`);

      // Also purge the live status cache so the next poll reflects fresh state.
      purged += await purgeByPattern('f1pulse:live:status');

      // Adjust the next-run cadence: 5 min during an active session, 60 min otherwise.
      try {
        const liveStatus = await deriveWeekendStatus();
        await updateJobCadence(isLiveSession(liveStatus.status));
      } catch (err) {
        console.warn('[worker] cadence update skipped:', (err as Error).message);
      }

      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      console.log(
        `[worker] job ${job.id} done in ${elapsed}s — ` +
          `${summary.raceResults} results, ${purged} cache keys purged`,
      );

      return { ...summary, purgedKeys: purged };
    },
    {
      connection: queueConnection,
      concurrency: 1,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[worker] job ${job?.id} failed:`, err.message);
  });

  if (env.nodeEnv !== 'production') {
    worker.on('completed', (job) => {
      console.log(`[worker] job ${job.id} completed`);
    });
  }

  return worker;
}
