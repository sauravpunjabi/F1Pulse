/**
 * GET /api/live/status
 *
 * Returns the current race weekend state. Two-source derivation:
 *   1. Postgres schedule (always available)  → off-season | race-week | post-race
 *   2. OpenF1 session data (best-effort)     → + practice | qualifying | sprint | race-live
 *
 * Cached for 60 s. If OpenF1 is unreachable, the response still comes back from
 * schedule data — never errors out because of live telemetry being unavailable.
 */
import { Router } from 'express';
import { cacheAside, cacheKey } from '../cache.js';
import { deriveWeekendStatus } from '../../live/session-state.js';
import type { LiveStatusDto } from '../../live/types.js';

const router = Router();

const LIVE_STATUS_TTL = 60; // seconds — short enough to be useful, long enough to protect DB

router.get('/status', async (_req, res, next) => {
  try {
    const dto = await cacheAside<LiveStatusDto>(
      cacheKey('live', 'status'),
      LIVE_STATUS_TTL,
      () => deriveWeekendStatus(),
    );
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

export { router as liveRouter };
