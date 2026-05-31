'use client';

/**
 * <Atmosphere />
 *
 * Fixed full-screen overlay that sits above every page at z-atmosphere.
 * Two layers stacked:
 *   1. Film grain — SVG feTurbulence animated noise, very low opacity.
 *      Creates the "watched in a cinema, not on a screen" texture.
 *   2. Vignette   — radial-gradient darkening the frame edges.
 *      Draws the eye inward; deepens perceived depth.
 *
 * Neither layer captures pointer events or affects layout.
 *
 * Opacity values come from CSS vars (--grain-opacity, --vignette-opacity)
 * defined in globals.css — tune them there, not here.
 *
 * TODO: When the signature GLSL / SVG-mask "Telemetry Masking" effect lands,
 *       it mounts inside this component so the z-order stays managed in one
 *       place. For now it's pure CSS/SVG — no three.js overhead on first load.
 */

export function Atmosphere() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-atmosphere)' as unknown as number,
        pointerEvents: 'none',
        /* Isolate compositing to avoid affecting child stacking contexts */
        isolation: 'isolate',
      }}
    >
      {/* ── Layer 1: Film grain ──────────────────────────────────────────── */}
      {/*
       * SVG feTurbulence generates Perlin noise that looks like film grain.
       * baseFrequency: higher = finer grain. TODO: tune 0.65 up/down.
       * numOctaves: more octaves = richer texture, more GPU cost.
       * The SVG is stretched to fill the viewport via CSS.
       *
       * Note: the grain is static. For animated grain (more cinematic, more
       * expensive) add a <animate> on the seed attribute (0→100 at ~12fps).
       * Hold off until performance budget is known.
       */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 'var(--grain-opacity)',
          mixBlendMode: 'screen',
        }}
      >
        <filter id="f1pulse-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"   /* TODO: tune — higher = finer grain */
            numOctaves="3"         /* TODO: tune — more = richer texture */
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#f1pulse-grain)" />
      </svg>

      {/* ── Layer 2: Vignette ────────────────────────────────────────────── */}
      {/*
       * Radial gradient darkening the corners/edges.
       * --vignette-spread controls how far inward the dark zone reaches.
       * TODO: Art director — try different stop positions and the ellipse
       * aspect ratio (currently 100% 100%) for a more lens-like falloff.
       */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 'var(--vignette-opacity)',
          background: `radial-gradient(
            ellipse var(--vignette-spread) var(--vignette-spread) at 50% 50%,
            transparent 0%,
            rgba(0, 0, 0, 0.6) 60%,
            rgba(0, 0, 0, 0.95) 100%
          )`,
        }}
      />
    </div>
  );
}
