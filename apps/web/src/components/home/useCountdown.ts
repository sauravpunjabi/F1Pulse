'use client';

/**
 * useCountdown — ticking countdown to an ISO date, computed entirely
 * client-side from the value the API returns. Never hardcodes "now".
 *
 * SSR-safe: returns null until mounted (the first client tick), so server and
 * first-client render agree. Ticks once per second while a target is set.
 *
 * Returns null when there is no target or before the first client tick.
 */

import { useEffect, useState } from 'react';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Remaining milliseconds, clamped at 0. */
  total: number;
  /** True once the target moment has passed. */
  isPast: boolean;
}

const MS_DAY = 86_400_000;
const MS_HOUR = 3_600_000;
const MS_MIN = 60_000;
const MS_SEC = 1_000;

export function useCountdown(target?: string | null): Countdown | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!target) {
      setNow(null);
      return;
    }
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), MS_SEC);
    return () => window.clearInterval(id);
  }, [target]);

  if (!target || now === null) return null;

  const targetMs = new Date(target).getTime();
  if (Number.isNaN(targetMs)) return null;

  const diff = targetMs - now;
  const isPast = diff <= 0;
  const total = Math.max(0, diff);

  return {
    days: Math.floor(total / MS_DAY),
    hours: Math.floor((total % MS_DAY) / MS_HOUR),
    minutes: Math.floor((total % MS_HOUR) / MS_MIN),
    seconds: Math.floor((total % MS_MIN) / MS_SEC),
    total,
    isPast,
  };
}
