import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RivalryExperience } from '@/components/rivalry/RivalryExperience';
import { findRivalry, RIVALRIES } from '@/config/rivalries';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return RIVALRIES.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const rivalry = findRivalry(params.id);
  if (!rivalry) return { title: 'Not Found | F1Pulse' };
  const title = rivalry.id
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' vs ');
  return {
    title: `${title} | F1Pulse`,
    description: `The ${rivalry.eraStart}–${rivalry.eraEnd} rivalry. ${rivalry.definingTitle}.`,
  };
}

function LoadingShell() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-black">
      <p className="animate-pulse font-mono text-[0.6rem] uppercase tracking-[0.3em] text-white/20">
        Loading&hellip;
      </p>
    </div>
  );
}

export default function RivalryPage({ params }: PageProps) {
  const config = findRivalry(params.id);
  if (!config) notFound();

  return (
    <Suspense fallback={<LoadingShell />}>
      <RivalryExperience config={config} />
    </Suspense>
  );
}
