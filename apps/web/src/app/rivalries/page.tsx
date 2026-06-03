import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RivalriesContent } from '@/components/rivalry/RivalriesContent';

export const metadata: Metadata = {
  title: 'Rivalries | F1Pulse',
  description: 'The battles that defined Formula 1. Directed cinematic experiences built from real data.',
};

function LoadingShell() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#050505]">
      <p className="animate-pulse font-mono text-[0.6rem] uppercase tracking-[0.3em] text-white/20">
        Loading&hellip;
      </p>
    </div>
  );
}

export default function RivalriesPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <RivalriesContent />
    </Suspense>
  );
}
