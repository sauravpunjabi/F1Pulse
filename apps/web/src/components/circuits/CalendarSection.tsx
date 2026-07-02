'use client';

/**
 * CalendarSection — region filter + the calendar grid.
 *
 * Every card is one round from /api/schedule; the footer stats (first held /
 * GPs held) come from /api/circuits. Track silhouettes are decorative art
 * (track-art.ts) drawn on scroll: a single rAF loop scrubs each visible
 * card's stroke-dashoffset and rides a "pen" dot along the leading edge,
 * exactly like the design prototype.
 */

import { useEffect, useMemo, useRef } from 'react';
import type { RaceScheduleDto } from '@/lib/api';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { trackPath } from './track-art';
import { beatFor, ccFor, dateShort, pad2, regionFor, REGION_ORDER } from './meta';

export interface CircuitSeasonStats {
  firstRaceYear: number;
  totalRaces: number;
}

interface CardAnimRefs {
  card: HTMLElement | null;
  line: SVGPathElement | null;
  car: SVGCircleElement | null;
  sf: SVGCircleElement | null;
  length: number;
}

interface CalendarSectionProps {
  seasonYear: number | null;
  races: RaceScheduleDto[];
  statsByCircuit: Map<string, CircuitSeasonStats>;
  hoveredRound: number | null;
  activeRegion: string;
  onRegionChange: (region: string) => void;
  onHoverRound: (round: number | null) => void;
  onSelectRound: (round: number) => void;
}

export function CalendarSection({
  seasonYear,
  races,
  statsByCircuit,
  hoveredRound,
  activeRegion,
  onRegionChange,
  onHoverRound,
  onSelectRound,
}: CalendarSectionProps) {
  const reduced = useReducedMotion();
  const anims = useRef(new Map<number, CardAnimRefs>());

  const getAnim = (round: number): CardAnimRefs => {
    let entry = anims.current.get(round);
    if (!entry) {
      entry = { card: null, line: null, car: null, sf: null, length: 0 };
      anims.current.set(round, entry);
    }
    return entry;
  };

  const regions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const race of races) {
      const region = regionFor(race.circuit.country);
      counts.set(region, (counts.get(region) ?? 0) + 1);
    }
    const ordered: Array<{ name: string; count: number }> = [
      { name: 'All', count: races.length },
    ];
    for (const name of REGION_ORDER) {
      const count = counts.get(name);
      if (count) ordered.push({ name, count });
    }
    return ordered;
  }, [races]);

  // Measure path lengths once the cards exist, then scrub on scroll.
  useEffect(() => {
    const entries = [...anims.current.values()];
    for (const entry of entries) {
      if (!entry.line) continue;
      entry.length = entry.line.getTotalLength();
      entry.line.style.strokeDasharray = `${entry.length}`;
      entry.line.style.strokeDashoffset = reduced ? '0' : `${entry.length}`;
      const start = entry.line.getPointAtLength(0);
      entry.sf?.setAttribute('cx', start.x.toFixed(2));
      entry.sf?.setAttribute('cy', start.y.toFixed(2));
      if (reduced) entry.card?.setAttribute('data-spine', '1');
    }
    if (reduced) return;

    let raf = 0;
    const frame = () => {
      const vh = window.innerHeight;
      for (const entry of entries) {
        const { card, line, car, length } = entry;
        if (!card || !line || !length) continue;
        const rect = card.getBoundingClientRect();
        if (rect.width === 0 || rect.bottom < -40 || rect.top > vh + 40) continue;
        // draws from card top at 88% viewport height until it reaches 36%
        let p = (vh * 0.88 - rect.top) / (vh * 0.52);
        p = Math.max(0, Math.min(1, p));
        line.style.strokeDashoffset = (length * (1 - p)).toFixed(1);
        if (p > 0.04) card.setAttribute('data-spine', '1');
        if (car) {
          const tip = line.getPointAtLength(Math.max(0.001, p) * length);
          car.setAttribute('cx', tip.x.toFixed(2));
          car.setAttribute('cy', tip.y.toFixed(2));
          car.style.opacity = p > 0.02 && p < 0.995 ? '1' : '0';
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [races, reduced]);

  return (
    <section
      className="gt-sec"
      id="calendar"
      style={{ borderTop: '1px solid var(--broadsheet-rule)', paddingTop: 'clamp(40px,6vh,70px)' }}
    >
      <div className="gt-sec__head">
        <span className="gt-sec__num">02</span>
        <span className="gt-sec__title">
          The <em>Calendar</em>
        </span>
      </div>

      <div className="gt-filter" role="tablist" aria-label="Filter by region">
        {regions.map(({ name, count }) => (
          <button
            key={name}
            type="button"
            className="gt-fchip"
            aria-pressed={activeRegion === name}
            onClick={() => onRegionChange(name)}
          >
            {name} <span className="gt-ct">{pad2(count)}</span>
          </button>
        ))}
      </div>

      <div className="gt-grid">
        {races.map((race) => {
          const { circuit } = race;
          const region = regionFor(circuit.country);
          const hidden = activeRegion !== 'All' && region !== activeRegion;
          const stats = statsByCircuit.get(circuit.id);
          const beat =
            beatFor(circuit.id) ??
            `Round ${race.round} of the ${seasonYear ?? ''} World Championship — ${circuit.country ?? 'on the calendar'}.`;
          const anim = getAnim(race.round);
          const d = trackPath(circuit.id);
          const cls = [
            'gt-ccard',
            race.round === hoveredRound ? 'gt-hot' : '',
            hidden ? 'gt-hide' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <article
              key={race.round}
              className={cls}
              ref={(node) => {
                anim.card = node;
              }}
              onPointerEnter={() => onHoverRound(race.round)}
              onPointerLeave={() => onHoverRound(null)}
              onClick={() => onSelectRound(race.round)}
            >
              <div className="gt-ccard__spine" />
              <div className="gt-ccard__top">
                <div className="gt-ccard__rd">
                  <span className="gt-p">RD</span>
                  <span className="gt-n broadsheet-tnum">{pad2(race.round)}</span>
                </div>
                <div className="gt-ccard__date">
                  <b>{dateShort(race.date)}</b>
                  <span>{seasonYear ?? ''}</span>
                </div>
              </div>

              <div className="gt-ccard__map">
                <span className="gt-ccard__cc">{ccFor(circuit.country)}</span>
                <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <path className="gt-t-base" d={d} />
                  <path
                    className="gt-t-line"
                    d={d}
                    ref={(node) => {
                      anim.line = node;
                    }}
                  />
                  <circle
                    className="gt-t-sf"
                    r={2.2}
                    ref={(node) => {
                      anim.sf = node;
                    }}
                  />
                  <circle
                    className="gt-t-car"
                    r={2.6}
                    ref={(node) => {
                      anim.car = node;
                    }}
                  />
                </svg>
              </div>

              <div className="gt-ccard__body">
                <div className="gt-ccard__gp">
                  {race.name}
                  {race.isSprintWeekend ? ' · Sprint' : ''}
                </div>
                <h3 className="gt-ccard__name">{circuit.locality ?? circuit.name}</h3>
                <p className="gt-ccard__loc">{circuit.name}</p>
                <p className="gt-ccard__beat">{beat}</p>
              </div>

              <div className="gt-ccard__foot">
                <div className="gt-ccard__stat">
                  <b className="broadsheet-tnum">{stats?.firstRaceYear ?? '—'}</b>
                  <span className="broadsheet-label">First held</span>
                </div>
                <div className="gt-ccard__stat">
                  <b className="broadsheet-tnum">{stats?.totalRaces ?? '—'}</b>
                  <span className="broadsheet-label">GPs held</span>
                </div>
                <div className="gt-ccard__cta" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
