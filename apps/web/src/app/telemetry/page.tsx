import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TelemetryContent } from '@/features/telemetry/TelemetryContent';

export const metadata: Metadata = {
  title: 'Telemetry Theatre | F1Pulse',
  description: 'Inside the machine. Live race data and finishing order from every Grand Prix.',
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

export default function TelemetryPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <TelemetryContent />
    </Suspense>
  );
}
