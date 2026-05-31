'use client';

/**
 * Honest section states — shared loading / error / empty placeholders.
 *
 * HARD RULE: never fabricate race data. When a feed is unreachable we say so
 * and show nothing rather than guessing. These are intentionally neutral; the
 * art director restyles via the class hooks (home-state-*).
 */

export interface StateProps {
  label: string;
}

/** Skeleton rows while a feed is in flight. Pulse stills under reduced-motion. */
export function LoadingState({ label, rows = 5 }: StateProps & { rows?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="home-state-loading mx-auto w-full max-w-3xl space-y-3 py-6"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="h-12 w-full animate-pulse rounded bg-iron/60"
        />
      ))}
    </div>
  );
}

/** Backend unreachable — state the cause, show no data. */
export function ErrorState({ label }: StateProps) {
  return (
    <div
      role="alert"
      className="home-state-error mx-auto w-full max-w-3xl rounded border border-steel/60 bg-graphite/40 px-5 py-6"
    >
      <p className="font-mono text-sm text-off-white">{label}</p>
      <p className="mt-1 font-mono text-xs text-silver">
        Nothing is shown rather than guessed. This refreshes once the feed is back.
      </p>
    </div>
  );
}

/** Feed reachable but empty (e.g. season not yet populated). */
export function EmptyState({ label }: StateProps) {
  return (
    <div className="home-state-empty mx-auto w-full max-w-3xl rounded border border-steel/40 px-5 py-6">
      <p className="font-mono text-sm text-silver">{label}</p>
    </div>
  );
}

/** The four states every data section can be in. */
export type SectionStatus = 'loading' | 'error' | 'empty' | 'ready';
