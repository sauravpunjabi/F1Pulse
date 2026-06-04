'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[F1Pulse error]', error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#050505] px-6">
      <div className="w-1 h-12 bg-[#E10600]" aria-hidden="true" />
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-white/30">
        Something went wrong
      </p>
      <button
        onClick={reset}
        className="font-mono text-xs uppercase tracking-widest text-[#E10600] transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E10600] focus-visible:outline-offset-4"
      >
        Try again
      </button>
    </main>
  );
}
