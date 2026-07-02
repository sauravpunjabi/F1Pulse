'use client';

/**
 * AtlasGlobe — draggable orthographic globe plotting every round of the
 * season by its true geo-position (lat/lng straight from /api/schedule).
 *
 * Rendering strategy: React owns the pin elements (hover/click/classes);
 * the projection geometry (sphere, graticule, land, pin transforms) is
 * written imperatively on drag frames so spinning the globe never re-renders
 * the React tree. Land shapes are served from our own /public/geo asset —
 * the frontend makes no third-party calls.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import type { GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { RaceScheduleDto } from '@/lib/api';
import { dateShort, pad2, regionFor } from './meta';

const SIZE = 640;
const RADIUS = 300;
const DRAG_K = 0.34;

interface PinRace {
  race: RaceScheduleDto;
  ll: [number, number]; // [lng, lat]
}

interface AtlasGlobeProps {
  races: RaceScheduleDto[];
  nextRound: number | null;
  hoveredRound: number | null;
  activeRegion: string;
  onHoverRound: (round: number | null) => void;
  onSelectRound: (round: number) => void;
}

export function AtlasGlobe({
  races,
  nextRound,
  hoveredRound,
  activeRegion,
  onHoverRound,
  onSelectRound,
}: AtlasGlobeProps) {
  const pinRaces = useMemo<PinRace[]>(
    () =>
      races
        .filter((r) => r.circuit.lat !== null && r.circuit.lng !== null)
        .map((r) => ({ race: r, ll: [r.circuit.lng as number, r.circuit.lat as number] })),
    [races],
  );

  const projection = useMemo(
    () =>
      geoOrthographic()
        .scale(RADIUS)
        .translate([SIZE / 2, SIZE / 2])
        .rotate([-18, -22])
        .clipAngle(90),
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => geoGraticule10(), []);

  const sphereRef = useRef<SVGPathElement>(null);
  const landRef = useRef<SVGPathElement>(null);
  const gratRef = useRef<SVGPathElement>(null);
  const landFeature = useRef<GeoPermissibleObjects | null>(null);
  const pinRefs = useRef(new Map<number, SVGGElement>());

  const [tip, setTip] = useState<{ round: number; x: number; y: number } | null>(null);

  const render = useCallback(() => {
    sphereRef.current?.setAttribute('d', path({ type: 'Sphere' }) ?? '');
    gratRef.current?.setAttribute('d', path(graticule) ?? '');
    if (landFeature.current) {
      landRef.current?.setAttribute('d', path(landFeature.current) ?? '');
    }
    const rot = projection.rotate();
    const center: [number, number] = [-rot[0], -rot[1]];
    for (const { race, ll } of pinRaces) {
      const g = pinRefs.current.get(race.round);
      if (!g) continue;
      const dist = geoDistance(ll, center);
      if (dist > Math.PI / 2 - 0.02) {
        g.style.display = 'none';
        continue;
      }
      const p = projection(ll);
      if (!p) {
        g.style.display = 'none';
        continue;
      }
      g.style.display = '';
      g.setAttribute('transform', `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
      const fade = Math.max(0.18, Math.min(1, (Math.PI / 2 - dist) / 0.42));
      g.style.opacity = fade.toFixed(2);
    }
  }, [path, graticule, projection, pinRaces]);

  // First paint + whenever the pin set changes.
  useLayoutEffect(() => {
    render();
  }, [render]);

  // Rotate once so the next round faces the viewer when data arrives.
  const centeredOnce = useRef(false);
  useEffect(() => {
    if (centeredOnce.current || nextRound === null) return;
    const next = pinRaces.find((p) => p.race.round === nextRound);
    if (!next) return;
    centeredOnce.current = true;
    projection.rotate([-next.ll[0], -next.ll[1]]);
    render();
  }, [nextRound, pinRaces, projection, render]);

  // Land silhouette from our own static asset (vendored world-atlas).
  useEffect(() => {
    let cancelled = false;
    fetch('/geo/land-110m.json')
      .then((r) => r.json())
      .then((raw: unknown) => {
        if (cancelled) return;
        const topo = raw as Topology;
        const landObj = topo.objects['land'];
        if (!landObj) return;
        landFeature.current = feature(topo, landObj) as GeoPermissibleObjects;
        render();
      })
      .catch(() => {
        /* globe still works without land shapes */
      });
    return () => {
      cancelled = true;
    };
  }, [render]);

  // ── drag to rotate ──────────────────────────────────────────────────────────
  const drag = useRef({ active: false, moved: false, x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { active: true, moved: false, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setTip(null);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.current.moved = true;
    const r = projection.rotate();
    const lat = Math.max(-90, Math.min(90, r[1] - dy * DRAG_K));
    projection.rotate([r[0] + dx * DRAG_K, lat]);
    render();
  };
  const endDrag = () => {
    drag.current.active = false;
    window.setTimeout(() => {
      drag.current.moved = false;
    }, 0);
  };

  // ── pin interaction ─────────────────────────────────────────────────────────
  const showTip = (pin: PinRace) => {
    const p = projection(pin.ll);
    if (!p) return;
    setTip({ round: pin.race.round, x: (p[0] / SIZE) * 100, y: (p[1] / SIZE) * 100 });
    onHoverRound(pin.race.round);
  };
  const hideTip = () => {
    setTip(null);
    onHoverRound(null);
  };

  const tipRace = tip ? races.find((r) => r.round === tip.round) ?? null : null;
  const nextRace = nextRound !== null ? races.find((r) => r.round === nextRound) ?? null : null;

  return (
    <>
      <div
        className="gt-globe-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <svg
          className="gt-globe-svg"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          aria-hidden="true"
        >
          <defs>
            <filter id="gt-g-shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="16" stdDeviation="26" floodColor="rgba(20,17,14,0.30)" />
            </filter>
          </defs>
          <path ref={sphereRef} className="gt-g-sphere" filter="url(#gt-g-shadow)" />
          <path ref={landRef} className="gt-g-land" />
          <path ref={gratRef} className="gt-g-grat" />
          <g>
            {pinRaces.map(({ race, ll }) => {
              const region = regionFor(race.circuit.country);
              const dim = activeRegion !== 'All' && region !== activeRegion;
              const cls = [
                'gt-g-pin',
                race.round === nextRound ? 'gt-next' : '',
                race.round === hoveredRound ? 'gt-hot' : '',
                dim ? 'gt-dim' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <g
                  key={race.round}
                  ref={(node) => {
                    if (node) pinRefs.current.set(race.round, node);
                    else pinRefs.current.delete(race.round);
                  }}
                  className={cls}
                  onPointerEnter={() => showTip({ race, ll })}
                  onPointerLeave={hideTip}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!drag.current.moved) onSelectRound(race.round);
                  }}
                >
                  <circle className="gt-g-pin__ring" r={8} />
                  <circle className="gt-g-pin__dot" r={4} />
                  <circle className="gt-g-pin__hit" r={14} />
                </g>
              );
            })}
          </g>
        </svg>

        <div
          className={`gt-atlas__tip${tipRace ? ' gt-on' : ''}`}
          style={tip ? { left: `${tip.x}%`, top: `${tip.y}%` } : undefined}
          role="status"
        >
          {tipRace && (
            <>
              <div className="gt-rd">
                Round {pad2(tipRace.round)} · {regionFor(tipRace.circuit.country)}
              </div>
              <div className="gt-nm">{tipRace.circuit.locality ?? tipRace.circuit.name}</div>
              <div className="gt-dt">
                {tipRace.circuit.name} — {dateShort(tipRace.date)}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="gt-atlas__legend">
        {nextRace && (
          <span className="gt-item">
            <span className="gt-swatch" />
            <span className="broadsheet-label">
              Next round · {nextRace.circuit.locality ?? nextRace.circuit.name}
            </span>
          </span>
        )}
        <span className="gt-item">
          <span className="gt-swatch gt-swatch--o" />
          <span className="broadsheet-label">Calendar round</span>
        </span>
        <span className="gt-item">
          <span className="broadsheet-label">Drag to rotate ⟳</span>
        </span>
      </div>
    </>
  );
}
