'use client';

/**
 * <CircuitTrackMap> — lat/lng positioned on a minimal dark map.
 *
 * Equirectangular projection: x = (lng + 180) / 360, y = (90 - lat) / 180.
 * Renders a location dot + pulse ring + coordinate readout.
 * No Google Maps, no paid services — pure SVG.
 */

interface CircuitTrackMapProps {
  lat: number | null;
  lng: number | null;
  name: string;
  locality: string | null;
  country: string | null;
}

const SVG_W = 360;
const SVG_H = 180;

function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * SVG_W;
  const y = ((90 - lat) / 180) * SVG_H;
  return { x, y };
}

function formatCoord(val: number, posLabel: string, negLabel: string): string {
  const abs = Math.abs(val).toFixed(4);
  return `${abs}° ${val >= 0 ? posLabel : negLabel}`;
}

export function CircuitTrackMap({ lat, lng, name, locality, country }: CircuitTrackMapProps) {
  const hasCoords = lat !== null && lng !== null;
  const location = [locality, country].filter(Boolean).join(', ');

  return (
    <section className="circuit-track-map px-6 py-16 md:px-16">
      <p className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
        Location
      </p>

      <div
        className="relative w-full overflow-hidden border border-white/[0.07]"
        style={{ aspectRatio: '2 / 1', background: '#0a0a0b' }}
      >
        {hasCoords ? (
          <>
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {/* Subtle latitude lines */}
              {[-60, -30, 0, 30, 60].map((latLine) => {
                const y = ((90 - latLine) / 180) * SVG_H;
                return (
                  <line
                    key={latLine}
                    x1={0}
                    y1={y}
                    x2={SVG_W}
                    y2={y}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="0.4"
                  />
                );
              })}
              {/* Subtle longitude lines */}
              {[-120, -60, 0, 60, 120].map((lngLine) => {
                const x = ((lngLine + 180) / 360) * SVG_W;
                return (
                  <line
                    key={lngLine}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={SVG_H}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="0.4"
                  />
                );
              })}

              {/* Location dot */}
              {(() => {
                const { x, y } = project(lat!, lng!);
                return (
                  <>
                    {/* Outer pulse ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r={4}
                      fill="none"
                      stroke="var(--accent, #e10600)"
                      strokeWidth={0.5}
                      opacity={0.35}
                    />
                    {/* Mid ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r={2.2}
                      fill="none"
                      stroke="var(--accent, #e10600)"
                      strokeWidth={0.4}
                      opacity={0.6}
                    />
                    {/* Core dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={1.2}
                      fill="var(--accent, #e10600)"
                    />
                    {/* Crosshair arms */}
                    <line x1={x - 6} y1={y} x2={x - 2} y2={y} stroke="var(--accent, #e10600)" strokeWidth={0.3} opacity={0.5} />
                    <line x1={x + 2} y1={y} x2={x + 6} y2={y} stroke="var(--accent, #e10600)" strokeWidth={0.3} opacity={0.5} />
                    <line x1={x} y1={y - 6} x2={x} y2={y - 2} stroke="var(--accent, #e10600)" strokeWidth={0.3} opacity={0.5} />
                    <line x1={x} y1={y + 2} x2={x} y2={y + 6} stroke="var(--accent, #e10600)" strokeWidth={0.3} opacity={0.5} />
                  </>
                );
              })()}
            </svg>

            {/* Coordinate readout — bottom left */}
            <div className="absolute bottom-4 left-4">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/30">
                {formatCoord(lat!, 'N', 'S')} &nbsp;·&nbsp; {formatCoord(lng!, 'E', 'W')}
              </p>
            </div>

            {/* Circuit label — top right */}
            <div className="absolute right-4 top-4 text-right">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/25">
                {name}
              </p>
              {location && (
                <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-white/15">
                  {location}
                </p>
              )}
            </div>
          </>
        ) : (
          /* No coordinates — text fallback */
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="font-display text-xl font-black uppercase text-white/20">{name}</p>
              {location && (
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-white/15">
                  {location}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
