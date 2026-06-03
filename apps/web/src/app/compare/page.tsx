import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CompareContent } from '@/components/compare/CompareContent';

export const metadata: Metadata = {
  title: 'Rivalry Simulator | F1Pulse',
  description: 'Head-to-head driver comparison across the entire F1 history.',
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

export default function ComparePage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <CompareContent />
    </Suspense>
  );
}
