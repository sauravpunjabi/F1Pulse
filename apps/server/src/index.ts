import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { api } from './api/router.js';
import { createIngestWorker } from './jobs/ingest-worker.js';
import { registerIngestJob, closeIngestQueue } from './jobs/ingest-scheduler.js';
import { schedulePrewarm } from './api/cache-warm.js';
import { broadcaster } from './live/broadcaster.js';

/* eslint-disable no-console */

/**
 * F1Pulse API server.
 *
 * This is the ONLY tier allowed to touch third-party sources (Jolpica, OpenF1).
 * Ingestion jobs, normalization, the Redis cache, and the public read API all live
 * here. The web app talks exclusively to this server (see CLAUDE.md HARD RULES).
 */
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: env.webOrigin.split(',').map(s => s.trim()),
    credentials: true,
  }),
);

app.get('/health', (_req, res) => {
  res.json({
    service: 'f1pulse-api',
    status: 'ok',
    env: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', api);

const server = app.listen(env.port, async () => {
  console.log(`▲ F1Pulse API listening on http://localhost:${env.port}`);

  // Attach WebSocket live broadcaster to the same HTTP server.
  // Must be attached before any other async work so upgrade events are hooked early.
  broadcaster.attach(server);

  // Start the BullMQ worker (processes jobs from the ingest queue).
  createIngestWorker();

  // Register the repeatable ingest job (60 min cadence).
  try {
    await registerIngestJob();
  } catch (err) {
    console.warn(
      '[startup] BullMQ job registration failed (Redis may be down):',
      (err as Error).message,
    );
  }

  // Pre-warm Redis cache for key eras — async, never blocks startup.
  schedulePrewarm();
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    server.close();
    await broadcaster.close();
    await closeIngestQueue();
    process.exit(0);
  });
}
