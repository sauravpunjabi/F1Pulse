'use client';

/**
 * DriverIdentityLine — one oversized sentence that defines the driver.
 *
 * Copy comes from the driverCopy table keyed by driverId.
 * Art director fills the copy; fallback is "The story of [name]."
 *
 * TODO: Write copy for each driver and add to the driverCopy object below.
 */

import { MaskReveal } from '@/components/primitives';
import { type DriverProfileDto } from '@/lib/api';

// ── Art-director copy table ────────────────────────────────────────────────────
// Keys are Jolpica driverIds. Values are the identity sentences.
// Leave empty string to get the auto-generated fallback.
// TODO: Fill in copy before launch.
const driverCopy: Record<string, string> = {
  max_verstappen: '',
  hamilton:       '',
  leclerc:        '',
  norris:         '',
  antonelli:      '',
  senna:          '',
  schumacher:     '',
  prost:          '',
  lauda:          '',
  fangio:         '',
  vettel:         '',
  alonso:         '',
};

interface DriverIdentityLineProps {
  driver: DriverProfileDto;
  driverId: string;
}

export function DriverIdentityLine({ driver, driverId }: DriverIdentityLineProps) {
  const copy =
    driverCopy[driverId] ||
    `The story of ${driver.givenName} ${driver.familyName}.`;

  return (
    <section
      className="identity-line px-6 py-24 md:px-16 md:py-32"
      aria-label="Driver identity"
    >
      <MaskReveal direction="bottom" preset="cinematic">
        <p
          className="max-w-4xl font-display text-[clamp(1.75rem,4vw,4rem)] font-light leading-[1.15] text-white/90"
          // TODO: line-height and font-size refined once display face is wired
        >
          {copy}
        </p>
      </MaskReveal>
    </section>
  );
}
