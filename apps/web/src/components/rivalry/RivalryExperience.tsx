'use client';

/**
 * RivalryExperience — full scroll-driven rivalry narrative.
 *
 * Act 1: RivalryHero    — colliding surnames, thin red separator
 * Act 2: RivalryContext — era, years, championships during period
 * Act 3: ChampionshipBattle — per-season points race (scroll-driven)
 * Act 4: RivalryDefiningMoment — pinned iconic moment + API stat
 * Act 5: RivalryLegacy  — career totals side-by-side with CountUp
 */

import { useDriverProfile, useDriverSeasons } from '@/lib/api';
import type { RivalryConfig } from '@/config/rivalries';
import { RivalryHero } from './RivalryHero';
import { RivalryContext } from './RivalryContext';
import { ChampionshipBattle } from './ChampionshipBattle';
import { RivalryDefiningMoment } from './RivalryDefiningMoment';
import { RivalryLegacy } from './RivalryLegacy';

interface RivalryExperienceProps {
  config: RivalryConfig;
}

function LoadingState() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-black">
      <p className="animate-pulse font-mono text-[0.6rem] uppercase tracking-[0.32em] text-white/20">
        Loading&hellip;
      </p>
    </div>
  );
}

function NotFoundState({ id }: { id: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-6 text-center">
      <div>
        <p className="font-mono text-[0.56rem] uppercase tracking-widest text-white/30">
          Driver not found
        </p>
        <p className="mt-2 font-display text-xl text-white/40">{id}</p>
      </div>
    </div>
  );
}

export function RivalryExperience({ config }: RivalryExperienceProps) {
  const profileA = useDriverProfile(config.driverAId);
  const profileB = useDriverProfile(config.driverBId);
  const seasonsA = useDriverSeasons(config.driverAId);
  const seasonsB = useDriverSeasons(config.driverBId);

  const isLoading =
    profileA.isLoading ||
    profileB.isLoading ||
    seasonsA.isLoading ||
    seasonsB.isLoading;

  if (isLoading) return <LoadingState />;

  if (profileA.isError || !profileA.data) {
    return <NotFoundState id={config.driverAId} />;
  }
  if (profileB.isError || !profileB.data) {
    return <NotFoundState id={config.driverBId} />;
  }

  const driverA = profileA.data;
  const driverB = profileB.data;
  const careerA = seasonsA.data ?? driverA.career;
  const careerB = seasonsB.data ?? driverB.career;

  return (
    <main className="bg-black text-white">
      {/* Act 1 — Collision opening */}
      <RivalryHero nameA={driverA.familyName} nameB={driverB.familyName} />

      {/* Act 2 — Era context */}
      <section className="bg-[#050505]">
        <RivalryContext config={config} profileA={driverA} profileB={driverB} />
      </section>

      {/* Divider */}
      <div className="mx-6 border-t border-white/8 md:mx-16" aria-hidden="true" />

      {/* Act 3 — Championship battle */}
      <section className="bg-[#050505]">
        <ChampionshipBattle
          config={config}
          profileA={driverA}
          profileB={driverB}
          seasonsA={careerA}
          seasonsB={careerB}
        />
      </section>

      {/* Act 4 — Defining moment (full-viewport pinned section) */}
      <RivalryDefiningMoment config={config} />

      {/* Act 5 — Legacy */}
      <section className="bg-[#050505]">
        <RivalryLegacy profileA={driverA} profileB={driverB} />
      </section>
    </main>
  );
}
