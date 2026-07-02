'use client';

/**
 * /circuits — "The Grand Tour": the season's calendar as an editorial atlas.
 *
 * Implemented from the Claude Design handoff (Circuits - The Grand Tour.html).
 * Three movements: kinetic hero → draggable globe atlas → filterable calendar
 * grid, with a cinematic focus dossier per round.
 *
 * Data flow is unchanged: everything comes from our own API via lib/api —
 * /api/schedule (rounds, dates, circuits, geo), /api/season/current (next
 * round), /api/circuits (first-held / GPs-held), /api/circuit/:id (dossier
 * archive). No hardcoded race data; silhouettes and copy are cosmetic.
 */

import './grand-tour.css';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { useCircuitsList, useSchedule, useSeasonCurrent } from '@/lib/api';
import {
  AtlasGlobe,
  CalendarSection,
  FocusDossier,
  GrandTourHero,
  type CircuitSeasonStats,
} from '@/components/circuits';
import { romanYear } from '@/components/circuits/meta';

export default function CircuitsPage() {
  const schedule = useSchedule('current');
  const season = useSeasonCurrent();
  const circuitsList = useCircuitsList();

  const [hoveredRound, setHoveredRound] = useState<number | null>(null);
  const [activeRegion, setActiveRegion] = useState('All');
  const [openRound, setOpenRound] = useState<number | null>(null);

  const races = useMemo(
    () => [...(schedule.data?.races ?? [])].sort((a, b) => a.round - b.round),
    [schedule.data],
  );
  const seasonYear = schedule.data?.season ?? null;
  const nextRound = season.data?.nextRace?.round ?? null;

  const statsByCircuit = useMemo(() => {
    const map = new Map<string, CircuitSeasonStats>();
    for (const c of circuitsList.data ?? []) {
      map.set(c.id, { firstRaceYear: c.firstRaceYear, totalRaces: c.totalRaces });
    }
    return map;
  }, [circuitsList.data]);

  const openRace = openRound !== null ? races.find((r) => r.round === openRound) ?? null : null;

  const stepRound = (dir: 1 | -1) => {
    setOpenRound((current) => {
      if (current === null || races.length === 0) return current;
      const idx = races.findIndex((r) => r.round === current);
      const next = races[(idx + dir + races.length) % races.length];
      return next ? next.round : current;
    });
  };

  // Scroll progress for the top chrome bar (same contract as the homepage).
  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(
        1,
        (document.documentElement.scrollHeight || document.body.scrollHeight) -
          window.innerHeight,
      );
      const prog = Math.min(1, Math.max(0, window.scrollY / max));
      document.documentElement.style.setProperty('--prog', prog.toFixed(4));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="scrollbar" aria-hidden="true" />
      <header className="chrome">
        <Link className="chrome__brand" href="/">
          <span className="dot" />
          F1PULSE
        </Link>
        <nav className="chrome__nav">
          <Link href="/">Season</Link>
          <Link href="/drivers">Drivers</Link>
          <Link href="/history">History</Link>
          <a className="cta" href="#calendar">
            Circuits ↗
          </a>
        </nav>
      </header>

      <main className="gt-stage" id="top">
        <GrandTourHero seasonYear={seasonYear} races={races} />

        {/* ── 01 · THE ATLAS ── */}
        <section className="gt-sec gt-atlas" id="atlas">
          <div className="gt-sec__head">
            <span className="gt-sec__num">01</span>
            <span className="gt-sec__title">
              The <em>Atlas</em>
            </span>
          </div>
          <p
            className="broadsheet-label"
            style={{ maxWidth: '62ch', margin: '30px 0 12px', lineHeight: 2 }}
          >
            Every round plotted on the globe by true geo-position. Drag to spin the
            Earth — hover a marker to preview the round, select it to open the dossier.
          </p>
          <AtlasGlobe
            races={races}
            nextRound={nextRound}
            hoveredRound={hoveredRound}
            activeRegion={activeRegion}
            onHoverRound={setHoveredRound}
            onSelectRound={setOpenRound}
          />
        </section>

        {/* ── 02 · THE CALENDAR ── */}
        {schedule.isLoading && (
          <section className="gt-sec" style={{ borderTop: '1px solid var(--broadsheet-rule)' }}>
            <div className="gt-grid" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="gt-skelcard" />
              ))}
            </div>
          </section>
        )}
        {schedule.isError && (
          <section className="gt-sec" style={{ borderTop: '1px solid var(--broadsheet-rule)' }}>
            <p className="gt-error">Could not load the calendar. Check your API connection.</p>
          </section>
        )}
        {!schedule.isLoading && !schedule.isError && (
          <CalendarSection
            seasonYear={seasonYear}
            races={races}
            statsByCircuit={statsByCircuit}
            hoveredRound={hoveredRound}
            activeRegion={activeRegion}
            onRegionChange={setActiveRegion}
            onHoverRound={setHoveredRound}
            onSelectRound={setOpenRound}
          />
        )}

        <footer className="gt-foot">
          <div>
            <div className="gt-foot__big">
              SPEED,
              <br />
              MAPPED.
            </div>
            <p className="broadsheet-label" style={{ marginTop: 18 }}>
              Editorial archive · Built as an experience
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="broadsheet-label">
              © {seasonYear ? romanYear(seasonYear) : ''} — Vol. I
            </p>
            <p
              className="broadsheet-serif-it"
              style={{ color: 'var(--broadsheet-ink-soft)', marginTop: 8, fontSize: 18 }}
            >
              {races.length > 0 ? `${races.length} chances. One champion.` : 'One champion.'}
            </p>
          </div>
        </footer>
      </main>

      <AnimatePresence>
        {openRace && (
          <FocusDossier
            key="gt-dossier"
            race={openRace}
            seasonYear={seasonYear}
            totalRounds={races.length}
            onClose={() => setOpenRound(null)}
            onStep={stepRound}
          />
        )}
      </AnimatePresence>
    </>
  );
}
