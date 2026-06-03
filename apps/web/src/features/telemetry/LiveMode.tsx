'use client';

/**
 * LiveMode
 *
 * When status === 'race-live': connects via WebSocket and shows live
 * positions updating in real time.
 * Otherwise: shows "NO ACTIVE SESSION" with a countdown to the next race.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LiveStatusDto, SeasonCurrentDto } from '@/lib/api';

// ── WebSocket live position types (matches broadcaster output) ────────────────

interface LivePosition {
  driverNumber: number;
  position: number;
  gap: string | null;
}

interface LiveFrame {
  type: 'positions' | 'ping';
  data?: LivePosition[];
  ts?: string;
}

// ── Countdown helpers ─────────────────────────────────────────────────────────

function useCountdownTo(isoDate: string | undefined) {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    if (!isoDate) return;
    const target = new Date(isoDate).getTime();

    function tick() {
      const remaining = target - Date.now();
      setDiff(remaining > 0 ? remaining : 0);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isoDate]);

  return diff;
}

function formatCountdown(ms: number | null): string {
  if (ms === null) return '—';
  if (ms <= 0) return 'NOW';
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── WebSocket hook ────────────────────────────────────────────────────────────

function wsBase(): string {
  const api = process.env.NEXT_PUBLIC_API_URL ?? '';
  return api.replace(/^https?/, (p) => (p === 'https' ? 'wss' : 'ws'));
}

function useLivePositions(enabled: boolean) {
  const [positions, setPositions] = useState<LivePosition[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function connect() {
      const ws = new WebSocket(`${wsBase()}/ws/live`);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const frame = JSON.parse(e.data as string) as LiveFrame;
          if (frame.type === 'positions' && frame.data) {
            setPositions(
              [...frame.data].sort((a, b) => a.position - b.position),
            );
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        // Reconnect after 5s if still enabled
        setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [enabled]);

  return positions;
}

// ── Components ────────────────────────────────────────────────────────────────

function NoSession({ season }: { season: SeasonCurrentDto | undefined }) {
  const nextRaceDate = season?.nextRace?.date;
  const countdown = useCountdownTo(nextRaceDate);

  return (
    <div
      className="flex flex-col items-center justify-center gap-8 py-24 text-center"
      aria-label="No active session"
    >
      {/* NO ACTIVE SESSION label */}
      <div className="flex items-center gap-4">
        <div className="h-px w-16 bg-white/10" />
        <span className="font-mono text-[0.52rem] uppercase tracking-[0.4em] text-white/25">
          No Active Session
        </span>
        <div className="h-px w-16 bg-white/10" />
      </div>

      {/* Countdown */}
      {season?.nextRace && (
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[0.44rem] uppercase tracking-[0.3em] text-white/20">
            Next Race
          </span>
          <span
            className="font-mono font-bold tabular-nums text-white/60"
            style={{ fontSize: 'clamp(1.4rem, 4vw, 3rem)' }}
          >
            {formatCountdown(countdown)}
          </span>
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.25em] text-white/30">
            {season.nextRace.name} · Rd {season.nextRace.round}
          </span>
        </div>
      )}

      {!season?.nextRace && (
        <span className="font-mono text-[0.44rem] uppercase tracking-[0.28em] text-white/20">
          Off season
        </span>
      )}
    </div>
  );
}

interface PositionRowProps {
  pos: LivePosition;
  index: number;
}

function PositionRow({ pos, index }: PositionRowProps) {
  return (
    <motion.div
      layout
      key={pos.driverNumber}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.25, 1, 0.5, 1] }}
      className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-6 border-b border-white/6 py-3"
    >
      <span
        className="font-mono text-sm font-bold tabular-nums"
        style={{ color: pos.position === 1 ? '#E10600' : 'rgba(255,255,255,0.55)' }}
      >
        {pos.position}
      </span>
      <span className="font-mono text-[0.58rem] uppercase tracking-widest text-white/60">
        #{pos.driverNumber}
      </span>
      <span
        className="font-mono text-[0.5rem] tabular-nums text-white/35"
      >
        {pos.gap ?? '—'}
      </span>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface LiveModeProps {
  status: LiveStatusDto | undefined;
  season: SeasonCurrentDto | undefined;
}

export function LiveMode({ status, season }: LiveModeProps) {
  const isRaceLive = status?.status === 'race-live';
  const positions = useLivePositions(isRaceLive);

  return (
    <section className="px-6 pb-24 md:px-16" aria-label="Live timing">
      <div className="mb-8 flex items-center gap-4">
        <span className="font-mono text-[0.52rem] uppercase tracking-[0.32em] text-white/25">
          Live Timing
        </span>
        {isRaceLive && (
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E10600] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E10600]" />
            </span>
            <span className="font-mono text-[0.44rem] uppercase tracking-widest text-[#E10600]">
              Race Live
            </span>
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isRaceLive ? (
          <motion.div
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {positions.length === 0 ? (
              <p className="font-mono text-[0.52rem] uppercase tracking-widest text-white/20 animate-pulse">
                Waiting for data&hellip;
              </p>
            ) : (
              <div className="max-w-sm">
                <AnimatePresence>
                  {positions.map((p, i) => (
                    <PositionRow key={p.driverNumber} pos={p} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="no-session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <NoSession season={season} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
