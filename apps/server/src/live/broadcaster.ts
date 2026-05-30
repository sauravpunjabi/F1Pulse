/**
 * LiveBroadcaster — WebSocket server + OpenF1 polling loop.
 *
 * Behaviour contract:
 *   • Completely silent when no session is active (off-season / race-week / post-race).
 *   • Polls OpenF1 every POLL_MS when a session IS active (practice/qualifying/sprint/race-live).
 *   • A state-check loop runs every STATE_CHECK_MS to start/stop the polling loop.
 *   • All clients receive a `status` frame on connect, then `positions` frames while live.
 *   • If OpenF1 becomes unavailable mid-session, polling stops — clients keep their last frame.
 *   • Disconnects gracefully on shutdown without throwing.
 *
 * Attach to the HTTP server with broadcaster.attach(server) — uses the same port,
 * no second port needed.
 */
import { WebSocketServer, type WebSocket } from 'ws';
import type { IncomingMessage } from 'node:http';
import type { Server } from 'node:http';
import {
  fetchLatestPositions,
  fetchLatestIntervals,
  isOpenF1Available,
} from '../clients/openf1.js';
import { deriveWeekendStatus, isLiveSession } from './session-state.js';
import type { LiveMessage, LiveStatusDto, PositionEntry } from './types.js';

/* eslint-disable no-console */

const POLL_MS = 3_000; // OpenF1 position poll cadence during an active session
const STATE_CHECK_MS = 30_000; // how often to re-check session state
const PING_MS = 20_000; // WebSocket keep-alive ping

export class LiveBroadcaster {
  private wss: WebSocketServer | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private stateTimer: ReturnType<typeof setInterval> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private currentStatus: LiveStatusDto | null = null;
  private activeSessionKey: number | null = null;

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  attach(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws/live' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      console.log(`[ws] client connected (${req.socket.remoteAddress})`);
      // Send current status immediately on connect.
      if (this.currentStatus) {
        this.send(ws, { type: 'status', data: this.currentStatus });
      }
      ws.on('error', () => {}); // absorb per-socket errors silently
    });

    this.wss.on('error', (err) => {
      console.warn('[ws] server error:', err.message);
    });

    // Start keep-alive pings.
    this.pingTimer = setInterval(() => this.ping(), PING_MS);

    // Initial state check, then on a timer.
    void this.checkState();
    this.stateTimer = setInterval(() => void this.checkState(), STATE_CHECK_MS);

    console.log('▸ WebSocket live broadcaster attached at /ws/live');
  }

  async close(): Promise<void> {
    this.stopPolling();
    if (this.stateTimer) clearInterval(this.stateTimer);
    if (this.pingTimer) clearInterval(this.pingTimer);
    await new Promise<void>((resolve) => {
      if (!this.wss) return resolve();
      this.wss.close(() => resolve());
    });
  }

  // ── State loop ─────────────────────────────────────────────────────────────

  private async checkState(): Promise<void> {
    try {
      const status = await deriveWeekendStatus();
      this.currentStatus = status;

      // Broadcast updated status to all connected clients.
      this.broadcast({ type: 'status', data: status });

      const sessionKey = status.session?.key ?? null;
      const shouldPoll = isLiveSession(status.status) && isOpenF1Available();

      if (shouldPoll && sessionKey !== null) {
        if (this.activeSessionKey !== sessionKey) {
          // New session started — restart polling.
          this.stopPolling();
          this.activeSessionKey = sessionKey;
          this.startPolling(sessionKey);
        }
        // else: same session, polling already running.
      } else {
        if (this.activeSessionKey !== null) {
          console.log('[broadcaster] session ended — stopping poll');
        }
        this.stopPolling();
        this.activeSessionKey = null;
      }
    } catch (err) {
      console.warn('[broadcaster] state check failed:', (err as Error).message);
    }
  }

  // ── Polling loop ───────────────────────────────────────────────────────────

  private startPolling(sessionKey: number): void {
    console.log(`[broadcaster] starting poll for session ${sessionKey} (every ${POLL_MS / 1000}s)`);
    this.pollTimer = setInterval(() => void this.poll(sessionKey), POLL_MS);
    // Fire immediately.
    void this.poll(sessionKey);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async poll(sessionKey: number): Promise<void> {
    if (!isOpenF1Available()) {
      this.stopPolling();
      this.activeSessionKey = null;
      console.warn('[broadcaster] OpenF1 unavailable — polling suspended');
      return;
    }

    const [positions, intervals] = await Promise.all([
      fetchLatestPositions(sessionKey),
      fetchLatestIntervals(sessionKey),
    ]);

    if (!positions) return; // circuit opened during this poll

    // Merge positions + intervals into a single normalised snapshot.
    const intervalMap = new Map(
      (intervals ?? []).map((i) => [i.driver_number, i]),
    );

    const entries: PositionEntry[] = positions.map((p) => {
      const iv = intervalMap.get(p.driver_number);
      return {
        driverNumber: p.driver_number,
        position: p.position,
        gap: iv?.gap_to_leader ?? null,
        interval: iv?.interval ?? null,
      };
    });

    this.broadcast({
      type: 'positions',
      data: {
        sessionKey,
        timestamp: new Date().toISOString(),
        positions: entries,
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private broadcast(msg: LiveMessage): void {
    if (!this.wss || this.wss.clients.size === 0) return;
    const payload = JSON.stringify(msg);
    for (const client of this.wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(payload, (err) => {
          if (err) console.warn('[ws] send error:', err.message);
        });
      }
    }
  }

  private send(ws: WebSocket, msg: LiveMessage): void {
    if (ws.readyState !== ws.OPEN) return;
    ws.send(JSON.stringify(msg), (err) => {
      if (err) console.warn('[ws] send error:', err.message);
    });
  }

  private ping(): void {
    if (!this.wss) return;
    for (const client of this.wss.clients) {
      if (client.readyState === client.OPEN) {
        client.ping();
      }
    }
  }
}

// Singleton — one broadcaster per process.
export const broadcaster = new LiveBroadcaster();
