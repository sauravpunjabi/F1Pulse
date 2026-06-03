'use client';

import { MaskReveal } from '@/components/primitives/MaskReveal';
import { RivalryCard } from './RivalryCard';
import { RIVALRIES } from '@/config/rivalries';
import { useDriverProfile } from '@/lib/api';

function RivalryCardLoader({
  rivalry,
  index,
}: {
  rivalry: (typeof RIVALRIES)[number];
  index: number;
}) {
  const profileA = useDriverProfile(rivalry.driverAId);
  const profileB = useDriverProfile(rivalry.driverBId);

  const nameA = profileA.data?.familyName ?? rivalry.driverAId;
  const nameB = profileB.data?.familyName ?? rivalry.driverBId;

  return (
    <RivalryCard rivalry={rivalry} nameA={nameA} nameB={nameB} index={index} />
  );
}

export function RivalriesContent() {
  return (
    <main className="min-h-dvh bg-[#050505] text-white">
      <section className="px-6 pb-16 pt-32 md:px-16">
        <MaskReveal direction="left" preset="cinematic" trigger="mount">
          <h1
            className="mb-4 font-display font-black uppercase leading-none tracking-tight text-white"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5rem)' }}
          >
            Rivalries
          </h1>
        </MaskReveal>
        <MaskReveal direction="left" preset="measured" delay={0.3} trigger="mount">
          <p className="max-w-md font-mono text-[0.55rem] uppercase tracking-[0.3em] text-white/30">
            The battles that defined Formula 1. Directed experiences built from real data.
          </p>
        </MaskReveal>
      </section>

      <section className="px-6 pb-24 md:px-16" aria-label="Rivalry experiences">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {RIVALRIES.map((rivalry, i) => (
            <RivalryCardLoader key={rivalry.id} rivalry={rivalry} index={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
