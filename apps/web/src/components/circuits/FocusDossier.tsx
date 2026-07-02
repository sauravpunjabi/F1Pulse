'use client';

/**
 * FocusDossier — cinematic-dark round overlay.
 *
 * Left: decorative track stage (stylised silhouette, sector-coloured thirds,
 * looping car) — pure ornament, labelled as such. Right: real data only —
 * round/date from the schedule, first-held / GPs-held / most-wins and the
 * winners' archive from /api/circuit/:id. The prototype's simulated hot-lap
 * clock was dropped deliberately: no fabricated numbers, ever.
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCircuitProfile, type RaceScheduleDto } from '@/lib/api';
import { useLenis } from '@/providers/LenisProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { trackPath } from './track-art';
import {
  beatFor,
  ccFor,
  dateShort,
  formatLat,
  formatLng,
  pad2,
  regionFor,
} from './meta';

const EASE = 'cubic-bezier(0.16,1,0.3,1)';
const LAP_SECONDS = 7; // decorative loop pace
const SECTORS: readonly [number, number] = [1 / 3, 2 / 3]; // decorative thirds

function sampleSubPath(base: SVGPathElement, total: number, a: number, b: number): string {
  const steps = Math.max(6, Math.round((b - a) * 240));
  let s = '';
  for (let i = 0; i <= steps; i++) {
    const t = a + (b - a) * (i / steps);
    const pt = base.getPointAtLength(t * total);
    s += `${i ? 'L' : 'M'}${pt.x.toFixed(2)} ${pt.y.toFixed(2)} `;
  }
  return s;
}

interface FocusDossierProps {
  race: RaceScheduleDto;
  seasonYear: number | null;
  totalRounds: number;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}

export function FocusDossier({ race, seasonYear, totalRounds, onClose, onStep }: FocusDossierProps) {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const profile = useCircuitProfile(race.circuit.id);
  const { circuit } = race;

  const baseRef = useRef<SVGPathElement>(null);
  const s1Ref = useRef<SVGPathElement>(null);
  const s2Ref = useRef<SVGPathElement>(null);
  const s3Ref = useRef<SVGPathElement>(null);
  const sfRef = useRef<SVGGElement>(null);
  const carRef = useRef<SVGCircleElement>(null);
  const ghostRef = useRef<SVGCircleElement>(null);

  // ── scroll lock while open ──────────────────────────────────────────────────
  useEffect(() => {
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [lenis]);

  // ── keyboard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onStep]);

  // ── decorative stage: sector thirds, draw-on, looping car ──────────────────
  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;
    const total = base.getTotalLength();
    const [f1, f2] = SECTORS;
    const sectors = [
      { el: s1Ref.current, a: 0, b: f1 },
      { el: s2Ref.current, a: f1, b: f2 },
      { el: s3Ref.current, a: f2, b: 1 },
    ];
    sectors.forEach(({ el, a, b }, i) => {
      if (!el) return;
      el.setAttribute('d', sampleSubPath(base, total, a, b));
      const len = el.getTotalLength();
      el.style.transition = 'none';
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = reduced ? '0' : `${len}`;
      if (!reduced) {
        requestAnimationFrame(() => {
          el.style.transition = `stroke-dashoffset 1s ${EASE} ${0.15 + i * 0.4}s`;
          el.style.strokeDashoffset = '0';
        });
      }
    });

    const start = base.getPointAtLength(0);
    sfRef.current?.setAttribute('transform', `translate(${start.x.toFixed(2)} ${start.y.toFixed(2)})`);

    const place = (t: number) => {
      const car = carRef.current;
      const ghost = ghostRef.current;
      if (!car || !ghost) return;
      const pc = base.getPointAtLength((t % 1) * total);
      car.setAttribute('cx', pc.x.toFixed(2));
      car.setAttribute('cy', pc.y.toFixed(2));
      const pg = base.getPointAtLength(((t - 0.018 + 1) % 1) * total);
      ghost.setAttribute('cx', pg.x.toFixed(2));
      ghost.setAttribute('cy', pg.y.toFixed(2));
    };
    place(0);
    if (reduced) return;

    let raf = 0;
    let t = 0;
    let last = 0;
    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t = (t + dt / LAP_SECONDS) % 1;
      place(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [race.round, reduced]);

  const beat = beatFor(circuit.id);
  const winners = (profile.data?.recentRaces ?? [])
    .filter((r) => r.winnerFamilyName !== '')
    .slice(0, 5);
  const mostWins = profile.data?.mostWins ?? null;
  const stageD = trackPath(circuit.id, 2);

  return (
    <div className="gt-focus" role="dialog" aria-modal="true" aria-label={race.name}>
      <motion.div
        className="gt-focus__scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClose}
      />
      <motion.div
        className="gt-focus__panel"
        initial={{ opacity: 0, y: 26, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 26, scale: 0.985 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── stage ── */}
        <div className="gt-fx__stage">
          <div className="gt-fx__grid" />
          <div className="gt-fx__big">{ccFor(circuit.country)}</div>
          <div className="gt-fx__chips">
            <span className="gt-fx__chip">
              <i style={{ background: 'var(--broadsheet-accent)' }} />
              {regionFor(circuit.country)}
            </span>
            <span className="gt-fx__chip">
              <i style={{ background: '#E0A33A' }} />
              RD {pad2(race.round)}
            </span>
            {race.isSprintWeekend && (
              <span className="gt-fx__chip">
                <i style={{ background: '#3FA8C4' }} />
                Sprint weekend
              </span>
            )}
          </div>
          <svg
            key={race.round}
            className="gt-fx__svg"
            viewBox="0 0 200 200"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <path ref={baseRef} className="gt-fx__base" d={stageD} />
            <path ref={s1Ref} className="gt-fx__s1" />
            <path ref={s2Ref} className="gt-fx__s2" />
            <path ref={s3Ref} className="gt-fx__s3" />
            <g ref={sfRef}>
              <circle className="gt-fx__sf" r={4.4} />
              <circle className="gt-fx__sfp" r={1.9} />
            </g>
            <circle ref={ghostRef} className="gt-fx__ghost" r={2.4} />
            <circle ref={carRef} className="gt-fx__car" r={3} />
          </svg>
          <div className="gt-fx__hint">Stylised silhouette · not to scale</div>
        </div>

        {/* ── info ── */}
        <div className="gt-fx__info" data-lenis-prevent>
          <div className="gt-fx__nav">
            <button type="button" className="gt-fxbtn" aria-label="Previous round" onClick={() => onStep(-1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button type="button" className="gt-fxbtn" aria-label="Next round" onClick={() => onStep(1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <button type="button" className="gt-fxbtn" aria-label="Close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="gt-fx__rd">
            <span>
              Round {pad2(race.round)} / {pad2(totalRounds)}
            </span>
            <span className="gt-ln" />
            <span>
              {dateShort(race.date)}
              {seasonYear ? ` · ${seasonYear}` : ''}
            </span>
          </div>
          <h2 className="gt-fx__name">{circuit.locality ?? circuit.name}</h2>
          <p className="gt-fx__circuit">
            {circuit.name}
            {circuit.country ? ` — ${circuit.country}` : ''}
          </p>
          {beat && <p className="gt-fx__beat">{beat}</p>}

          <div className="gt-fx__stats">
            <div className="gt-fx__stat">
              <div className="gt-v broadsheet-tnum">{profile.data?.firstRaceYear ?? '—'}</div>
              <div className="gt-l">First held</div>
            </div>
            <div className="gt-fx__stat">
              <div className="gt-v broadsheet-tnum">{profile.data?.totalRaces ?? '—'}</div>
              <div className="gt-l">GPs held</div>
            </div>
            <div className="gt-fx__stat">
              <div className="gt-v broadsheet-tnum">
                {mostWins ? (
                  <>
                    {mostWins.wins}
                    <small>{mostWins.familyName.toUpperCase()}</small>
                  </>
                ) : (
                  '—'
                )}
              </div>
              <div className="gt-l">Most wins</div>
            </div>
            <div className="gt-fx__stat">
              <div className="gt-v broadsheet-tnum">{pad2(race.round)}</div>
              <div className="gt-l">Season round</div>
            </div>
            <div className="gt-fx__stat">
              <div className="gt-v broadsheet-tnum">{circuit.lat !== null ? formatLat(circuit.lat) : '—'}</div>
              <div className="gt-l">Latitude</div>
            </div>
            <div className="gt-fx__stat">
              <div className="gt-v broadsheet-tnum">{circuit.lng !== null ? formatLng(circuit.lng) : '—'}</div>
              <div className="gt-l">Longitude</div>
            </div>
          </div>

          <div className="gt-fx__arch">
            <div className="gt-fx__archhd">
              <span>Winners&apos; archive</span>
              <b>
                <span className="gt-d" />
                {profile.isLoading
                  ? 'Consulting the record'
                  : winners.length > 0
                    ? `Last ${winners.length} Grands Prix`
                    : 'Awaiting its first winner'}
              </b>
            </div>

            {profile.isLoading && (
              <>
                <div className="gt-fx__skel" style={{ width: '82%' }} />
                <div className="gt-fx__skel" style={{ width: '68%' }} />
                <div className="gt-fx__skel" style={{ width: '74%' }} />
              </>
            )}
            {profile.isError && (
              <p className="gt-fx__empty">The archive is unreachable — check the API connection.</p>
            )}
            {profile.isSuccess && winners.length === 0 && (
              <p className="gt-fx__empty">
                An inaugural venue — no Grand Prix has been decided here yet.
              </p>
            )}
            {winners.map((w) => (
              <div className="gt-fx__winrow" key={`${w.season}-${w.round}`}>
                <span className="gt-yr">{w.season}</span>
                <span className="gt-wn">
                  {w.winnerGivenName} {w.winnerFamilyName}
                </span>
                <span className="gt-tm">{w.constructorName}</span>
              </div>
            ))}

            <Link className="gt-fx__more" href={`/circuit/${circuit.id}`}>
              Full circuit dossier <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
