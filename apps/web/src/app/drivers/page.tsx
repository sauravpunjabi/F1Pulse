'use client';

/**
 * /drivers — current season driver paddock page.
 *
 * Implements the premium editorial "Drivers Paddock" design from the prototype.
 * Features:
 *   - Sort by Standing, Name, or Team.
 *   - Filter by Constructor (Team) with dynamic team accent colors.
 *   - Density settings (Cozy, Default, Dense).
 *   - Dark mode toggle.
 *   - Featured Leader (P1) card spanning two columns.
 *   - Collapsible Tweaks Panel for live adjustment of grid aesthetics.
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useDriverStandings } from '@/lib/api';
import './drivers.css';

// ── SVG Icons ───────────────────────────────────────────────────────────────
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Sun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
  </svg>
);

const Moon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z" />
  </svg>
);

const Crown = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
    <path d="M3 7l4 4 5-7 5 7 4-4-2 12H5L3 7z" />
  </svg>
);

// ── Static Driver Number Registry ──────────────────────────────────────────
const DRIVER_NUMBERS: Record<string, number> = {
  norris: 4,
  piastri: 81,
  max_verstappen: 1,
  verstappen: 1,
  leclerc: 16,
  russell: 63,
  hamilton: 44,
  antonelli: 12,
  alonso: 14,
  sainz: 55,
  albon: 23,
  gasly: 10,
  hadjar: 6,
  stroll: 18,
  hulkenberg: 27,
  lawson: 30,
  bearman: 87,
  ocon: 31,
  tsunoda: 22,
  colapinto: 43,
  bortoleto: 5,
  perez: 11,
  bottas: 77,
  magnussen: 20,
  zhou: 24,
  sargeant: 2,
  ricciardo: 3,
};

// ── Dynamic Color Mapping helper ───────────────────────────────────────────
const getConstructorColor = (id?: string) => {
  if (!id) return '#8C887E';
  const colors: Record<string, string> = {
    mclaren: '#F47600',
    red_bull: '#2C56B8',
    ferrari: '#E8002D',
    mercedes: '#00A19C',
    aston_martin: '#1F8A6B',
    williams: '#1868DB',
    alpine: '#0093CC',
    rb: '#5E7BE0',
    audi: '#00876B',
    haas: '#5A5E62',
    sauber: '#52E252',
  };
  return colors[id.toLowerCase()] ?? '#8C887E';
};

// ── Constructor Short Names helper ─────────────────────────────────────────
const getTeamShortName = (name: string) => {
  if (name.includes('Red Bull')) return 'Red Bull';
  if (name.includes('Aston Martin')) return 'Aston Martin';
  if (name.includes('Mercedes')) return 'Mercedes';
  if (name.includes('Ferrari')) return 'Ferrari';
  if (name.includes('McLaren')) return 'McLaren';
  if (name.includes('Williams')) return 'Williams';
  if (name.includes('Alpine')) return 'Alpine';
  if (name.includes('Sauber') || name.includes('Kick')) return 'Sauber';
  if (name.includes('Haas')) return 'Haas';
  if (name.includes('RB') || name.includes('Racing Bulls') || name.includes('Visa')) return 'Racing Bulls';
  return name;
};

// ── Tweaks Drawer Component ────────────────────────────────────────────────
interface TweaksPanelProps {
  accent: string;
  setAccent: (val: string) => void;
  teamColors: boolean;
  setTeamColors: (val: boolean) => void;
  density: 'cozy' | 'default' | 'dense';
  setDensity: (val: 'cozy' | 'default' | 'dense') => void;
  featureLeader: boolean;
  setFeatureLeader: (val: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (val: 'light' | 'dark') => void;
  motion: number;
  setMotion: (val: number) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

function TweaksPanel({
  accent,
  setAccent,
  teamColors,
  setTeamColors,
  density,
  setDensity,
  featureLeader,
  setFeatureLeader,
  theme,
  setTheme,
  motion,
  setMotion,
  isOpen,
  setIsOpen,
}: TweaksPanelProps) {
  const ACCENTS = ['#C9201A', '#F25C1F', '#C8E000', '#2A6FDB'];

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          id="btn-tweaks-trigger"
          className="twk-trigger"
          onClick={() => setIsOpen(true)}
          aria-label="Open tweaks panel"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      )}

      {/* Drawer */}
      <div className="twk-drawer" data-open={isOpen} aria-label="Aesthetic Tweaks Panel">
        <div className="twk-hd">
          <b>Tweaks</b>
          <button className="twk-x" onClick={() => setIsOpen(false)} aria-label="Close tweaks">
            ✕
          </button>
        </div>
        <div className="twk-body">
          <div className="twk-sect">Accent</div>
          
          <div className="twk-row">
            <div className="twk-lbl">
              <span>Accent color</span>
            </div>
            <div className="twk-chips" role="radiogroup">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="twk-chip"
                  role="radio"
                  aria-checked={accent === c}
                  style={{ background: c }}
                  onClick={() => setAccent(c)}
                  aria-label={`Accent color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="twk-row twk-row-h">
            <div className="twk-lbl">
              <span>Use team colors</span>
            </div>
            <button
              type="button"
              className="twk-toggle"
              data-on={teamColors}
              onClick={() => setTeamColors(!teamColors)}
              role="switch"
              aria-checked={teamColors}
              aria-label="Toggle team colors"
            >
              <i />
            </button>
          </div>

          <div className="twk-sect">Layout</div>

          <div className="twk-row">
            <div className="twk-lbl">
              <span>Density</span>
            </div>
            <div className="twk-seg" role="radiogroup">
              {(['cozy', 'default', 'dense'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={density === d}
                  onClick={() => setDensity(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="twk-row twk-row-h">
            <div className="twk-lbl">
              <span>Feature leader</span>
            </div>
            <button
              type="button"
              className="twk-toggle"
              data-on={featureLeader}
              onClick={() => setFeatureLeader(!featureLeader)}
              role="switch"
              aria-checked={featureLeader}
              aria-label="Toggle feature leader"
            >
              <i />
            </button>
          </div>

          <div className="twk-sect">Theme & Motion</div>

          <div className="twk-row twk-row-h">
            <div className="twk-lbl">
              <span>Dark mode</span>
            </div>
            <button
              type="button"
              className="twk-toggle"
              data-on={theme === 'dark'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Toggle dark mode"
            >
              <i />
            </button>
          </div>

          <div className="twk-row">
            <div className="twk-lbl">
              <span>Motion</span>
              <span className="twk-val">{motion.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              className="twk-slider"
              min={0}
              max={2}
              step={0.1}
              value={motion}
              onChange={(e) => setMotion(parseFloat(e.target.value))}
              aria-label="Motion scale multiplier"
            />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────
export default function DriversPage() {
  const standings = useDriverStandings('current');

  // Tweaks states
  const [accent, setAccent] = useState<string>('#C9201A');
  const [teamColors, setTeamColors] = useState<boolean>(true);
  const [density, setDensity] = useState<'cozy' | 'default' | 'dense'>('default');
  const [featureLeader, setFeatureLeader] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [motion, setMotion] = useState<number>(1);
  const [tweaksOpen, setTweaksOpen] = useState<boolean>(false);

  // Filters & Sorting states
  const [sort, setSort] = useState<'standing' | 'name' | 'team'>('standing');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Sync state values with Document variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('theme-dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
  }, [accent]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  useEffect(() => {
    document.documentElement.setAttribute('data-motion', motion === 0 ? 'off' : 'on');
  }, [motion]);

  // Extract season data details
  const season = standings.data?.season ?? new Date().getFullYear();
  const round = standings.data?.round ?? 0;
  const totalRounds = 24; // Standard rounds in modern seasons

  // Compute constructors list dynamically from standings data
  const teams = useMemo(() => {
    if (!standings.data) return [];
    const map = new Map<string, { id: string; name: string }>();
    standings.data.standings.forEach((entry) => {
      const constructor = entry.constructors[0];
      if (constructor && !map.has(constructor.id)) {
        map.set(constructor.id, { id: constructor.id, name: constructor.name });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [standings.data]);

  // Filter and Sort Standings list
  const filteredAndSorted = useMemo(() => {
    if (!standings.data) return [];
    let list = [...standings.data.standings];

    // 1. Filtering
    if (teamFilter !== 'all') {
      list = list.filter((item) => item.constructors[0]?.id === teamFilter);
    }

    // 2. Sorting
    if (sort === 'standing') {
      list.sort((a, b) => a.position - b.position);
    } else if (sort === 'name') {
      list.sort((a, b) => a.driver.familyName.localeCompare(b.driver.familyName));
    } else if (sort === 'team') {
      list.sort(
        (a, b) =>
          (a.constructors[0]?.name ?? '').localeCompare(b.constructors[0]?.name ?? '') ||
          a.position - b.position
      );
    }

    return list;
  }, [standings.data, teamFilter, sort]);

  const showLeader = featureLeader && sort === 'standing' && teamFilter === 'all';

  return (
    <>
      <title>F1Pulse — The Paddock · Driver Grid</title>
      <meta name="description" content="Every name on the F1 grid, ranked by standings. View detailed driver statistics, career results, and profiles." />

      <div className="drivers-page" data-theme={theme}>
        <div className="paddock-grain" aria-hidden="true" />

        {/* ── Top Chrome ────────────────────────────────────────────────────── */}
        <div className="paddock-chrome">
          <Link href="/" className="paddock-chrome__brand">
            <span className="dot" />
            F1PULSE
          </Link>
          <div className="paddock-chrome__right">
            <button
              id="btn-theme-toggle"
              className="icbtn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun /> : <Moon />}
            </button>
          </div>
        </div>

        {/* ── Masthead ──────────────────────────────────────────────────────── */}
        <header className="mast">
          <div className="mast__eyebrow">
            <span className="ln" />
            <span className="lbl lbl--accent">Championship Standings</span>
          </div>
          <h1 className="mast__title">Drivers</h1>
          <div className="mast__sub">
            <p className="mast__lede">
              Every name on the {season} grid, ranked by the only number that matters. Tap a driver for the full profile.
            </p>
            <div className="mast__season">
              <span className="lbl">Round {round} / {totalRounds}</span>
              <b>{season}</b>
            </div>
          </div>
        </header>

        {/* ── Controls Bar ──────────────────────────────────────────────────── */}
        <div className="bar">
          <div className="seg" role="group" aria-label="Sort Order">
            {(['standing', 'name', 'team'] as const).map((k) => (
              <button
                key={k}
                id={`btn-sort-${k}`}
                aria-pressed={sort === k}
                onClick={() => setSort(k)}
              >
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>

          <div className="bar__teams">
            <button
              id="btn-team-all"
              className="tchip"
              aria-pressed={teamFilter === 'all'}
              onClick={() => setTeamFilter('all')}
              style={teamFilter === 'all' ? { color: 'var(--accent)' } : {}}
            >
              All Teams
            </button>
            {teams.map((tm) => {
              const c = getConstructorColor(tm.id);
              return (
                <button
                  key={tm.id}
                  id={`btn-team-${tm.id}`}
                  className="tchip"
                  aria-pressed={teamFilter === tm.id}
                  onClick={() => setTeamFilter(teamFilter === tm.id ? 'all' : tm.id)}
                  style={teamFilter === tm.id ? { color: c } : {}}
                >
                  <i style={{ background: c }} />
                  {getTeamShortName(tm.name)}
                </button>
              );
            })}
          </div>

          <span className="bar__meta tnum">{filteredAndSorted.length} drivers</span>
        </div>

        {/* ── Drivers Grid ──────────────────────────────────────────────────── */}
        <main className="wrap">
          {standings.isLoading && (
            <div className="grid">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    opacity: 0.5,
                    height: '320px',
                    background: 'var(--card)',
                    border: '1.5px dashed var(--card-edge)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-hidden="true"
                >
                  <span className="font-mono text-xs text-silver uppercase animate-pulse">
                    fetching...
                  </span>
                </div>
              ))}
            </div>
          )}

          {standings.isError && (
            <div
              style={{
                padding: '40px',
                border: '1px solid var(--rule)',
                borderRadius: '8px',
                background: 'var(--card)',
                textAlign: 'center',
              }}
            >
              <p className="font-mono text-sm text-ink-soft">
                Could not load standings. Verify server or API connections.
              </p>
            </div>
          )}

          {standings.data && (
            <div className="grid">
              {filteredAndSorted.map((item, idx) => {
                const { driver, position, points, wins, constructors } = item;
                const teamObj = constructors[0];
                const teamId = teamObj?.id ?? '';
                const teamName = teamObj?.name ?? 'Independent';
                const teamShort = getTeamShortName(teamName);
                
                // Get constructor paddock color, or fallback to accent
                const tc = teamColors ? getConstructorColor(teamId) : accent;
                const num = DRIVER_NUMBERS[driver.id] ?? DRIVER_NUMBERS[driver.familyName.toLowerCase()] ?? '';

                const delay = motion === 0 ? 0 : Math.min(idx * 0.05, 0.55);
                const revealStyle = {
                  '--tc': tc,
                  '--d': `${delay}s`,
                } as React.CSSProperties;

                const isLeaderCard = showLeader && idx === 0;

                if (isLeaderCard) {
                  return (
                    <Link
                      key={driver.id}
                      className="card card--leader in"
                      href={`/driver/${driver.id}`}
                      style={revealStyle}
                    >
                      <span className="card__spine" />
                      <div className="card__photo">
                        <span className="card__ghost">{driver.code}</span>
                      </div>
                      <div className="card__main">
                        <div className="card__top">
                          <span className="card__crown">
                            <Crown /> Championship Leader
                          </span>
                          <span className="card__num">{num}</span>
                        </div>
                        <div className="card__body">
                          <div className="card__name">
                            <span className="card__first">{driver.givenName}</span>
                            <span className="card__last">{driver.familyName}</span>
                          </div>
                          <div className="card__team">
                            <i />
                            <span>{teamName}</span>
                          </div>
                        </div>
                        <div className="card__foot">
                          <div className="card__stat">
                            <span className="lbl">Points</span>
                            <b className="statnum tnum">{points}</b>
                          </div>
                          <div className="card__stat">
                            <span className="lbl">Wins</span>
                            <b className="tnum">{wins}</b>
                          </div>
                          <div className="card__stat">
                            <span className="lbl">Pos</span>
                            <b>P{position}</b>
                          </div>
                          <span className="card__cta">
                            <Arrow />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={driver.id}
                    className="card in"
                    href={`/driver/${driver.id}`}
                    style={revealStyle}
                  >
                    <span className="card__spine" />
                    <div className="card__top">
                      <span className="card__pos">
                        <span className="p">P</span>
                        <span className="n">{position}</span>
                      </span>
                      {num && <span className="card__num">{num}</span>}
                    </div>
                    <div className="card__photo">
                      <span className="card__ghost">{driver.code}</span>
                    </div>
                    <div className="card__body">
                      <div className="card__name">
                        <span className="card__first">{driver.givenName}</span>
                        <span className="card__last">{driver.familyName}</span>
                      </div>
                      <div className="card__team">
                        <i />
                        <span>{teamShort}</span>
                      </div>
                    </div>
                    <div className="card__foot">
                      <div className="card__stat">
                        <span className="lbl">Points</span>
                        <b className="statnum tnum">{points}</b>
                      </div>
                      <div className="card__stat">
                        <span className="lbl">Wins</span>
                        <b className="tnum">{wins}</b>
                      </div>
                      <span className="card__cta">
                        <Arrow />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="footer">
          <span className="lbl">F1Pulse · The Paddock · Driver Grid</span>
          <span className="lbl tnum">
            {season} · {filteredAndSorted.length} entries
          </span>
        </footer>

        {/* ── Tweaks Panel ──────────────────────────────────────────────────── */}
        <TweaksPanel
          accent={accent}
          setAccent={setAccent}
          teamColors={teamColors}
          setTeamColors={setTeamColors}
          density={density}
          setDensity={setDensity}
          featureLeader={featureLeader}
          setFeatureLeader={setFeatureLeader}
          theme={theme}
          setTheme={setTheme}
          motion={motion}
          setMotion={setMotion}
          isOpen={tweaksOpen}
          setIsOpen={setTweaksOpen}
        />
      </div>
    </>
  );
}
