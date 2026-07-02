'use client';

/**
 * GrandTourHero — editorial masthead for the circuits atlas.
 *
 * Kinetic display title, decorative ghost-track backdrop, and a stat strip
 * where every number is computed from the fetched schedule (rounds, countries,
 * continents, month span) — nothing hardcoded.
 */

import { motion } from 'framer-motion';
import type { RaceScheduleDto } from '@/lib/api';
import { CountUp } from '@/components/primitives';
import { HERO_GHOST_PATH } from './track-art';
import { monthSpan, regionFor, romanYear } from './meta';

const lineReveal = {
  hidden: { y: '110%' },
  show: (i: number) => ({
    y: '0%',
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const, delay: 0.15 + i * 0.14 },
  }),
};

interface GrandTourHeroProps {
  seasonYear: number | null;
  races: RaceScheduleDto[];
}

export function GrandTourHero({ seasonYear, races }: GrandTourHeroProps) {
  const countries = new Set(
    races.map((r) => r.circuit.country).filter((c): c is string => !!c),
  );
  const continents = new Set(
    races.map((r) => regionFor(r.circuit.country)).filter((reg) => reg !== 'World'),
  );
  const months = monthSpan(races.map((r) => r.date));
  const first = races[0];
  const last = races[races.length - 1];

  return (
    <section className="gt-hero" id="top">
      <div className="gt-hero__ghost" aria-hidden="true">
        <svg viewBox="0 0 600 400">
          <path className="gt-gline" d={HERO_GHOST_PATH} />
          <path className="gt-gdash" d={HERO_GHOST_PATH} />
        </svg>
      </div>

      <div className="gt-hero__top">
        <span className="broadsheet-serif-it">A luxury motorsport chronicle</span>
        <span className="broadsheet-label">
          Vol. I — The Atlas{seasonYear ? ` · ${romanYear(seasonYear)}` : ''}
        </span>
      </div>

      <div className="gt-hero__mid">
        <div className="gt-hero__eyebrow">
          <span className="gt-ln" />
          <span className="broadsheet-label broadsheet-label--accent">
            Circuits{seasonYear ? ` / ${seasonYear} World Championship` : ''}
          </span>
        </div>
        <h1 className="gt-kinetic">
          <span className="gt-kline">
            <motion.span variants={lineReveal} initial="hidden" animate="show" custom={0}>
              The Grand
            </motion.span>
          </span>
          <span className="gt-kline">
            <motion.span variants={lineReveal} initial="hidden" animate="show" custom={1}>
              <em>Tour</em>
            </motion.span>
          </span>
        </h1>
        <motion.p
          className="gt-hero__lede"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
        >
          {first && last
            ? `From ${first.circuit.name} to ${last.circuit.name} — a world championship drawn across the globe. Trace every lap of the season.`
            : 'A world championship drawn across the globe. Trace every lap of the season.'}
        </motion.p>
      </div>

      <div className="gt-hero__bottom">
        <div className="gt-hero__stats">
          <div className="gt-hstat">
            <div className="gt-v broadsheet-tnum"><CountUp to={races.length} /></div>
            <div className="gt-l broadsheet-label">Rounds</div>
          </div>
          <div className="gt-hstat">
            <div className="gt-v broadsheet-tnum"><CountUp to={countries.size} /></div>
            <div className="gt-l broadsheet-label">Countries</div>
          </div>
          <div className="gt-hstat">
            <div className="gt-v broadsheet-tnum"><CountUp to={continents.size} /></div>
            <div className="gt-l broadsheet-label">Continents</div>
          </div>
          <div className="gt-hstat">
            <div className="gt-v broadsheet-tnum"><CountUp to={months} /></div>
            <div className="gt-l broadsheet-label">Months</div>
          </div>
        </div>
        <a className="gt-scroll-cue broadsheet-label" href="#atlas">
          The atlas <span className="gt-arr">↓</span>
        </a>
      </div>
    </section>
  );
}
