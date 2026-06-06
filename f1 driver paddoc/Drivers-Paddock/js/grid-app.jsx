/* ───────────────────────────────────────────────────────────────────────────
   grid-app.jsx — /drivers "The Paddock" grid: masthead, sort + team filter,
   championship-ordered cards (P1 featured), tweaks. Renders into #root.
   Cards link to the Marquee driver page.
   ─────────────────────────────────────────────────────────────────────────── */
const { useState, useEffect, useMemo, useRef } = React;

const GRID_ACCENTS = ['#C9201A', '#F25C1F', '#C8E000', '#2A6FDB'];
const DRIVER_HREF = 'Driver — The Marquee.html';

const GRID_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#C9201A",
  "dark": false,
  "density": "default",
  "motion": 1,
  "teamColors": true,
  "featureLeader": true
}/*EDITMODE-END*/;

/* icons */
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const Sun = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" /></svg>);
const Moon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z" /></svg>);
const Crown = () => (<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M3 7l4 4 5-7 5 7 4-4-2 12H5L3 7z" /></svg>);

function useReveal(reduce) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (reduce) { setSeen(true); return; }
    const el = ref.current; if (!el) { setSeen(true); return; }
    let done = false;
    const reveal = () => { if (!done) { done = true; setSeen(true); } };
    // already in view on mount?
    const r = el.getBoundingClientRect();
    if (r.top < (window.innerHeight || 800) && r.bottom > 0) {
      // reveal next frame so the transition still plays
      requestAnimationFrame(() => requestAnimationFrame(reveal));
    }
    let io;
    try {
      io = new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) { reveal(); io.disconnect(); } });
      }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
      io.observe(el);
    } catch (_) { reveal(); }
    // safety net: never leave a card invisible if IO doesn't fire (offscreen iframe, etc.)
    const t = setTimeout(reveal, 1400);
    return () => { if (io) io.disconnect(); clearTimeout(t); };
  }, [reduce]);
  return [ref, seen];
}

function DriverCard({ d, idx, accent, teamColors, leader, motion }) {
  const tc = teamColors ? d.teamColor : accent;
  const delay = motion === 0 ? 0 : Math.min(idx * 0.05, 0.55);
  const revealStyle = { '--tc': tc, '--d': `${delay}s` };

  if (leader) {
    return (
      <a className="card card--leader" href={DRIVER_HREF} style={revealStyle}>
        <span className="card__spine" />
        <div className="card__photo">
          <span className="card__ghost">{d.code}</span>
          <image-slot id={`grid-${d.id}`} shape="rounded" radius="6" placeholder={`${d.familyName.toUpperCase()} PORTRAIT`}></image-slot>
        </div>
        <div className="card__main">
          <div className="card__top">
            <span className="card__crown"><Crown /> Championship Leader</span>
            <span className="card__num">{d.num}</span>
          </div>
          <div className="card__body">
            <div className="card__name">
              <span className="card__first">{d.givenName}</span>
              <span className="card__last">{d.familyName}</span>
            </div>
            <div className="card__team"><i /><span>{d.team}</span></div>
          </div>
          <div className="card__foot">
            <div className="card__stat"><span className="lbl">Points</span><b className="statnum tnum">{d.points}</b></div>
            <div className="card__stat"><span className="lbl">Wins</span><b className="tnum">{d.wins}</b></div>
            <div className="card__stat"><span className="lbl">Pos</span><b>P{d.position}</b></div>
            <span className="card__cta"><Arrow /></span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a className="card" href={DRIVER_HREF} style={revealStyle}>
      <span className="card__spine" />
      <div className="card__top">
        <span className="card__pos"><span className="p">P</span><span className="n">{d.position}</span></span>
        <span className="card__num">{d.num}</span>
      </div>
      <div className="card__photo">
        <span className="card__ghost">{d.code}</span>
        <image-slot id={`grid-${d.id}`} shape="rounded" radius="6" placeholder={`${d.familyName.toUpperCase()}`}></image-slot>
      </div>
      <div className="card__body">
        <div className="card__name">
          <span className="card__first">{d.givenName}</span>
          <span className="card__last">{d.familyName}</span>
        </div>
        <div className="card__team"><i /><span>{d.teamShort}</span></div>
      </div>
      <div className="card__foot">
        <div className="card__stat"><span className="lbl">Points</span><b className="statnum tnum">{d.points}</b></div>
        <div className="card__stat"><span className="lbl">Wins</span><b className="tnum">{d.wins}</b></div>
        <span className="card__cta"><Arrow /></span>
      </div>
    </a>
  );
}

function App() {
  const [t, setTweak] = useTweaks(GRID_DEFAULTS);
  const { drivers, teams, season, round, totalRounds } = window.GRID;
  const [sort, setSort] = useState('standing');
  const [team, setTeam] = useState('all');

  useEffect(() => { document.documentElement.setAttribute('data-theme', t.dark ? 'dark' : 'light'); }, [t.dark]);
  useEffect(() => { document.documentElement.style.setProperty('--accent', t.accent); }, [t.accent]);
  useEffect(() => { document.documentElement.setAttribute('data-density', t.density); }, [t.density]);
  useEffect(() => { window.__motionScale = t.motion; window.dispatchEvent(new Event('ds-motion')); document.documentElement.setAttribute('data-motion', t.motion === 0 ? 'off' : 'on'); }, [t.motion]);

  const view = useMemo(() => {
    let list = drivers.slice();
    if (team !== 'all') list = list.filter((d) => d.team === team);
    if (sort === 'standing') list.sort((a, b) => a.position - b.position);
    if (sort === 'name') list.sort((a, b) => a.familyName.localeCompare(b.familyName));
    if (sort === 'team') list.sort((a, b) => a.team.localeCompare(b.team) || a.position - b.position);
    return list;
  }, [drivers, sort, team]);

  const showLeader = t.featureLeader && sort === 'standing' && team === 'all';

  return (
    <div>
      <div className="chrome">
        <span className="chrome__brand"><span className="dot" />F1PULSE</span>
        <div className="chrome__right">
          <button className="icbtn" onClick={() => setTweak('dark', !t.dark)} aria-label="Toggle theme">{t.dark ? <Sun /> : <Moon />}</button>
        </div>
      </div>

      <header className="mast">
        <div className="mast__eyebrow"><span className="ln" /><span className="lbl lbl--accent">Championship Standings</span></div>
        <h1 className="mast__title">Drivers</h1>
        <div className="mast__sub">
          <p className="mast__lede">Every name on the {season} grid, ranked by the only number that matters. Tap a driver for the full file.</p>
          <div className="mast__season">
            <span className="lbl">Round {round} / {totalRounds}</span>
            <b>{season}</b>
          </div>
        </div>
      </header>

      <div className="bar">
        <div className="seg" role="group" aria-label="Sort">
          {[['standing', 'Standing'], ['name', 'Name'], ['team', 'Team']].map(([k, lab]) => (
            <button key={k} aria-pressed={sort === k} onClick={() => setSort(k)}>{lab}</button>
          ))}
        </div>
        <div className="bar__teams">
          <button className="tchip" aria-pressed={team === 'all'} onClick={() => setTeam('all')} style={team === 'all' ? { color: 'var(--accent)' } : {}}>All Teams</button>
          {teams.map((tm) => {
            const c = drivers.find((d) => d.team === tm).teamColor;
            return (
              <button key={tm} className="tchip" aria-pressed={team === tm} onClick={() => setTeam(team === tm ? 'all' : tm)} style={team === tm ? { color: c } : {}}>
                <i style={{ background: c }} />{drivers.find((d) => d.team === tm).teamShort}
              </button>
            );
          })}
        </div>
        <span className="bar__meta tnum">{view.length} drivers</span>
      </div>

      <main className="wrap">
        <div className="grid">
          {view.map((d, i) => (
            <DriverCard key={d.id} d={d} idx={i} accent={t.accent} teamColors={t.teamColors}
              leader={showLeader && i === 0} motion={t.motion} />
          ))}
        </div>
      </main>

      <footer className="footer">
        <span className="lbl">F1Pulse · The Paddock · Driver Grid Prototype</span>
        <span className="lbl tnum">{season} · {view.length} entries</span>
      </footer>

      <TweaksPanel>
        <TweakSection label="Accent" />
        <TweakColor label="Accent" value={t.accent} options={GRID_ACCENTS} onChange={(v) => setTweak('accent', v)} />
        <TweakToggle label="Use team colors" value={t.teamColors} onChange={(v) => setTweak('teamColors', v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={[['cozy', 'Cozy'], ['default', 'Default'], ['dense', 'Dense']].map(([value, label]) => ({ value, label }))} onChange={(v) => setTweak('density', v)} />
        <TweakToggle label="Feature leader" value={t.featureLeader} onChange={(v) => setTweak('featureLeader', v)} />
        <TweakSection label="Theme & Motion" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />
        <TweakSlider label="Motion" value={t.motion} min={0} max={2} step={0.1} unit="×" onChange={(v) => setTweak('motion', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
