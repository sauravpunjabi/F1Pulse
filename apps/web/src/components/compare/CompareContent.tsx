'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDriverProfile, useDriverSeasons } from '@/lib/api';
import { MaskReveal } from '@/components/primitives';
import { RivalryPicker } from './RivalryPicker';
import { CompareHero } from './CompareHero';
import { StatClash } from './StatClash';
import { ProgressionChart } from './ProgressionChart';
import { CareerOverlap } from './CareerOverlap';

// ── Empty/error states ────────────────────────────────────────────────────────

function NotFoundState({ driverId }: { driverId: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/40">
        Driver not found
      </p>
      <p className="font-mono text-[0.58rem] uppercase tracking-widest text-white/20">
        &ldquo;{driverId}&rdquo; is not in the database
      </p>
      <Link
        href="/drivers"
        className="mt-1 font-mono text-[0.58rem] uppercase tracking-widest text-white/30 underline underline-offset-4 hover:text-white/60 transition-colors"
      >
        Browse drivers →
      </Link>
    </div>
  );
}

function PickState() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-8 px-6 text-center">
      <p className="font-mono text-[0.58rem] uppercase tracking-[0.35em] text-white/20">
        Select a rivalry above &mdash; or hit Compare on any driver card
      </p>
      <Link
        href="/drivers"
        className="border border-white/12 px-6 py-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/35 transition-colors hover:border-white/28 hover:text-white/65"
      >
        Browse Drivers
      </Link>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CompareContent() {
  const params = useSearchParams();
  const idA = params.get('a') ?? '';
  const idB = params.get('b') ?? '';

  const profileA = useDriverProfile(idA);
  const profileB = useDriverProfile(idB);
  const seasonsA = useDriverSeasons(idA);
  const seasonsB = useDriverSeasons(idB);

  const hasA = !!idA;
  const hasB = !!idB;
  const hasBoth = hasA && hasB;

  const loadingA = hasA && (profileA.isLoading || seasonsA.isLoading);
  const loadingB = hasB && (profileB.isLoading || seasonsB.isLoading);
  const isLoading = loadingA || loadingB;

  const aFound = hasA && !profileA.isError && !!profileA.data;
  const bFound = hasB && !profileB.isError && !!profileB.data;
  const bothReady =
    aFound && bFound && !!seasonsA.data && !!seasonsB.data && !isLoading;

  return (
    <main
      className="min-h-dvh bg-[--bg] text-[--text-primary]"
      // CSS cascade: components consume var(--compare-a) and var(--compare-b)
      style={
        {
          '--compare-a': '#E10600',
          '--compare-b': '#f5f5f5',
        } as React.CSSProperties
      }
    >
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="px-6 pt-24 pb-12 md:px-16">
        <MaskReveal direction="bottom" preset="cinematic" trigger="mount">
          <h1 className="mb-8 font-display font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(1.8rem,4vw,3.2rem)' }}
          >
            Rivalry
          </h1>
        </MaskReveal>
        <RivalryPicker
          current={hasBoth ? { a: idA, b: idB } : undefined}
        />
      </div>

      {/* ── Loading ───────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <p className="animate-pulse font-mono text-[0.6rem] uppercase tracking-[0.3em] text-white/20">
            Loading&hellip;
          </p>
        </div>
      )}

      {/* ── Nothing selected ──────────────────────────────────── */}
      {!hasA && !hasB && !isLoading && <PickState />}

      {/* ── Partial selection ─────────────────────────────────── */}
      {(hasA !== hasB) && !isLoading && (
        <div className="px-6 py-12 md:px-16">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-white/30">
            {hasA
              ? `${profileA.data?.familyName ?? idA} selected — pick a rival above`
              : `${profileB.data?.familyName ?? idB} selected — pick a rival above`}
          </p>
        </div>
      )}

      {/* ── Driver not found ──────────────────────────────────── */}
      {hasBoth && !isLoading && (!aFound || !bFound) && (
        <div className="grid grid-cols-2 gap-8 px-6 py-12 md:px-16">
          {!aFound && <NotFoundState driverId={idA} />}
          {!bFound && <NotFoundState driverId={idB} />}
        </div>
      )}

      {/* ── Full comparison ───────────────────────────────────── */}
      {bothReady && (
        <>
          {/* 1. Split-screen hero */}
          <CompareHero
            driverA={profileA.data!}
            driverB={profileB.data!}
            seasonsA={seasonsA.data!}
            seasonsB={seasonsB.data!}
          />

          {/* 2. Head-to-head stat clashes */}
          <section
            className="px-6 py-20 md:px-16"
            aria-label="Head-to-head statistics"
          >
            <p className="mb-12 font-mono text-xs uppercase tracking-[0.25em] text-white/30">
              Head to Head
            </p>
            <div className="flex flex-col gap-12">
              <StatClash
                label="Championships"
                valueA={profileA.data!.stats.championships}
                valueB={profileB.data!.stats.championships}
              />
              <StatClash
                label="Race Wins"
                valueA={profileA.data!.stats.wins}
                valueB={profileB.data!.stats.wins}
              />
              <StatClash
                label="Pole Positions"
                valueA={profileA.data!.stats.poles}
                valueB={profileB.data!.stats.poles}
              />
              <StatClash
                label="Podiums"
                valueA={profileA.data!.stats.podiums}
                valueB={profileB.data!.stats.podiums}
              />
            </div>
          </section>

          {/* 3. Championship progression chart */}
          <ProgressionChart
            seasonsA={seasonsA.data!}
            seasonsB={seasonsB.data!}
            nameA={profileA.data!.familyName}
            nameB={profileB.data!.familyName}
          />

          {/* 4. Career overlap timeline */}
          <CareerOverlap
            seasonsA={seasonsA.data!}
            seasonsB={seasonsB.data!}
            nameA={profileA.data!.familyName}
            nameB={profileB.data!.familyName}
          />
        </>
      )}
    </main>
  );
}
