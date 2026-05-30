import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { api } from './api/router.js';

/**
 * F1Pulse API server.
 *
 * This is the ONLY tier allowed to touch third-party sources (Jolpica, OpenF1).
 * Ingestion jobs, normalization, the Redis cache, and the public read API all live
 * here. The web app talks exclusively to this server (see CLAUDE.md HARD RULES).
 */
const app = express();

app.use(express.json());

// Lock CORS to our own frontend only.
app.use(
  cors({
    origin: env.webOrigin,
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

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`▲ F1Pulse API listening on http://localhost:${env.port}`);
});

// Graceful shutdown so tsx hot-reloads and container stops are clean.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
