/**
 * F1Pulse API router — assembles all route groups and the admin cache-purge endpoint.
 *
 * Mounted at /api in src/index.ts. Every route reads from Postgres via the
 * Redis cache-aside layer; Jolpica is never called at request time.
 */
import { Router, type Request, type Response, type NextFunction } from 'express';
import { env } from '../config/env.js';
import { purgeByPattern, purgeAll } from './cache.js';
import { seasonRouter } from './routes/season.js';
import { standingsRouter } from './routes/standings.js';
import { scheduleRouter } from './routes/schedule.js';
import { resultsRouter } from './routes/results.js';
import { driverRouter } from './routes/driver.js';
import { constructorRouter } from './routes/constructor.js';
import { constructorsRouter } from './routes/constructors.js';
import { historyRouter } from './routes/history.js';
import { eraRouter } from './routes/era.js';
import { liveRouter } from './routes/live.js';
import { circuitRouter } from './routes/circuit.js';
import { circuitsRouter } from './routes/circuits.js';
import { triggerIngestNow } from '../jobs/ingest-scheduler.js';

const api = Router();

// ── Domain routes ─────────────────────────────────────────────────────────────
api.use('/season/current', seasonRouter);
api.use('/standings', standingsRouter);
api.use('/schedule', scheduleRouter);
api.use('/results', resultsRouter);
api.use('/driver', driverRouter);
api.use('/constructor', constructorRouter);
api.use('/constructors', constructorsRouter);
api.use('/history', historyRouter);
api.use('/era', eraRouter);
api.use('/live', liveRouter);
api.use('/circuit', circuitRouter);
api.use('/circuits', circuitsRouter);

// ── Admin: cache purge ────────────────────────────────────────────────────────

/** Bearer-token guard for admin endpoints. */
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers['authorization'] ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== env.adminToken) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

/**
 * DELETE /api/cache/purge
 * Clears cached keys matching `?pattern=f1pulse:standings:*` (defaults to all).
 * Guarded by `Authorization: Bearer <ADMIN_TOKEN>`.
 */
api.delete('/cache/purge', requireAdmin, async (req, res, next) => {
  try {
    const pattern = (req.query['pattern'] as string | undefined) ?? '';
    const deleted = pattern ? await purgeByPattern(pattern) : await purgeAll();
    res.json({ deleted, pattern: pattern || 'f1pulse:*' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/ingest/trigger
 * Enqueues a one-off ingest job immediately. Guarded by ADMIN_TOKEN.
 */
api.post('/admin/ingest/trigger', requireAdmin, async (_req, res, next) => {
  try {
    const jobId = await triggerIngestNow();
    res.json({ queued: true, jobId });
  } catch (err) {
    next(err);
  }
});

// ── Error handler ─────────────────────────────────────────────────────────────

api.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('[API error]', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ error: message });
});

export { api };
