'use client';

/**
 * /driver/[driverId] — immersive driver profile page.
 *
 * Page sequence (choreographed top → bottom):
 *   1. DriverHero       — full-viewport portrait + giant surname reveal
 *   2. DriverIdentityLine — one oversized sentence (art-director copy)
 *   3. DriverTimeline   — GSAP horizontal scroll through career seasons
 *   4. DriverStats      — CountUp career aggregates (wins, poles, podiums, championships)
 *   5. DriverEraContext — era badges linking to /history
 *
 * Data: all from our own API — zero hardcoded values.
 * Theme: per-driver accent color + tempo preset from driverThemes.ts.
 */

import { useDriverProfile, useDriverSeasons } from '@/lib/api';
import { getDriverTheme } from '@/lib/driverThemes';
import { DriverHero } from '@/components/driver/DriverHero';
import { DriverIdentityLine } from '@/components/driver/DriverIdentityLine';
import { DriverTimeline } from '@/components/driver/DriverTimeline';
import { DriverStats } from '@/components/driver/DriverStats';
import { DriverEraContext } from '@/components/driver/DriverEraContext';

interface PageProps {
  params: { driverId: string };
}

export default function DriverPage({ params }: PageProps) {
  const { driverId } = params;
  const theme = getDriverTheme(driverId);

  const profile = useDriverProfile(driverId);
  const seasons = useDriverSeasons(driverId);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (profile.isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        {/* TODO: Replace with a StartLights-style loader or skeleton. */}
        <span className="font-mono text-xs uppercase tracking-widest text-white/30 animate-pulse">
          Loading
        </span>
      </main>
    );
  }

  // ── Error / not-found state ───────────────────────────────────────────────
  if (profile.isError || !profile.data) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-white/30">
            Driver not found
          </p>
          <p className="mt-2 font-display text-2xl text-white/60">{driverId}</p>
        </div>
      </main>
    );
  }

  const driver = profile.data;
  const careerSeasons = seasons.data ?? driver.career;

  return (
    <main
      className="relative bg-[--bg] text-[--text-primary]"
      // Expose driver-specific CSS vars at page scope.
      // Art director defines them in globals.css under [data-driver-accent="..."].
      data-driver-accent={driverId}
      data-driver-tempo={theme.tempoPreset}
    >
      {/* 1 — Hero */}
      <DriverHero driver={driver} theme={theme} driverId={driverId} />

      {/* 2 — Identity line */}
      <DriverIdentityLine driver={driver} driverId={driverId} />

      {/* Divider */}
      <div className="mx-6 border-t border-white/10 md:mx-16" aria-hidden="true" />

      {/* 3 — Career timeline */}
      {careerSeasons.length > 0 && (
        <DriverTimeline seasons={careerSeasons} />
      )}

      {/* Divider */}
      <div className="mx-6 border-t border-white/10 md:mx-16" aria-hidden="true" />

      {/* 4 — Career stats */}
      <DriverStats stats={driver.stats} />

      {/* Divider */}
      <div className="mx-6 border-t border-white/10 md:mx-16" aria-hidden="true" />

      {/* 5 — Era context */}
      <DriverEraContext career={driver.career} />
    </main>
  );
}
