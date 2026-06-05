'use client';


import { useSeasonCurrent, useDriverStandings, useConstructorStandings } from '@/lib/api';
import { useCountdown } from './useCountdown';
import dynamic from 'next/dynamic';

const ThreeTrackScene = dynamic(() => import('./ThreeTrackScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#0C0B0A] border border-broadsheet-rule rounded-xl shadow-2xl">
      <div className="font-mono text-[0.65rem] text-accent tracking-[0.25em] animate-pulse uppercase">
        CALIBRATING 3D TRACK GEOMETRY...
      </div>
    </div>
  ),
});

const TEAM_COLORS: Record<string, string> = {
  'Red Bull Racing': '#3671C6',
  'Red Bull': '#3671C6',
  'Ferrari': '#DA291C',
  'Mercedes': '#12C2B0',
  'McLaren': '#FF7A1A',
  'Aston Martin': '#00594F',
  'Alpine': '#0093CC',
  'Haas F1 Team': '#B6BABD',
  'Haas': '#B6BABD',
  'Williams': '#37BEDD',
  'Kick Sauber': '#52E252',
  'Sauber': '#52E252',
  'RB': '#6692FF',
  'Visa Cash App RB': '#6692FF',
};

const getTeamColor = (teamName: string) => {
  if (!teamName) return '#8C887E';
  const normalized = Object.keys(TEAM_COLORS).find(
    (key) => teamName.toLowerCase().includes(key.toLowerCase())
  );
  return normalized ? TEAM_COLORS[normalized] : '#8C887E';
};

export function CurrentEra() {
  const seasonQuery = useSeasonCurrent();
  const driversQuery = useDriverStandings('current');
  const constructorsQuery = useConstructorStandings('current');

  const nextRace = seasonQuery.data?.nextRace;
  const countdown = useCountdown(nextRace?.date);

  const topDrivers = driversQuery.data?.standings.slice(0, 5) ?? [];
  const topConstructors = constructorsQuery.data?.standings.slice(0, 5) ?? [];

  const location = nextRace
    ? [nextRace.circuit.locality, nextRace.circuit.country].filter(Boolean).join(', ')
    : 'Monte Carlo, MC';



  return (
    <section className="sec" id="race" data-screen-label="Next Race">
      <div className="sec__head">
        <span className="sec__num">01</span>
        <span className="broadsheet-label">/ Mission control — the next lights-out</span>
      </div>

      <div className="race2">
        {/* Interactive 3D Track Map */}
        <div className="circuit in" data-reveal>
          <div className="circuit__cap">
            <span className="broadsheet-label">
              Circuit map // {nextRace?.name ?? 'Monaco Grand Prix'}
            </span>
            <span className="broadsheet-label broadsheet-label--accent">
              Interactive 3D Render
            </span>
          </div>

          <div className="w-full aspect-[16/10] relative mt-2 border border-broadsheet-rule bg-broadsheet-paper-2 overflow-hidden rounded-lg shadow-inner">
            <ThreeTrackScene circuitId={nextRace?.circuit.id} circuitName={nextRace?.name} />
          </div>

          <div className="circuit__legend">
            <div>
              <div className="v broadsheet-tnum">{nextRace?.circuit.locality === 'Monaco' ? '19' : '16'}</div>
              <div className="l broadsheet-label">Corners</div>
            </div>
            <div>
              <div className="v broadsheet-tnum">{nextRace?.circuit.locality === 'Monaco' ? '78' : '58'}</div>
              <div className="l broadsheet-label">Laps</div>
            </div>
            <div>
              <div className="v broadsheet-tnum">
                {nextRace?.circuit.locality === 'Monaco' ? '260.3' : '306.1'}<span style={{ fontSize: '0.5em' }}> km</span>
              </div>
              <div className="l broadsheet-label">Distance</div>
            </div>
            <div>
              <div className="v broadsheet-tnum">
                {nextRace?.circuit.locality === 'Monaco' ? '1:10.166' : '1:18.841'}
              </div>
              <div className="l broadsheet-label">Lap record</div>
            </div>
          </div>
        </div>

        {/* Live Timing Feed Box */}
        <aside className="feed in" data-reveal data-reveal-d="2">
          <div className="feed__top">
            <span className="feed__live">
              <span className="d" />
              Live timing feed
            </span>
            <span className="feed__rd">Round {nextRace ? nextRace.round.toString().padStart(2, '0') : '08'} / 24</span>
          </div>

          <h3 className="feed__name">{nextRace?.name ?? 'Monaco Grand Prix'}</h3>
          <p className="feed__sub">{nextRace?.circuit.name ?? 'Circuit de Monaco'} // {location}</p>

          <div className="feed__cd">
            <div className="feed__cell">
              <span className="n broadsheet-tnum" data-cd="d">
                {countdown && !countdown.isPast ? countdown.days.toString().padStart(2, '0') : '00'}
              </span>
              <span className="u">Days</span>
            </div>
            <div className="feed__cell">
              <span className="n broadsheet-tnum" data-cd="h">
                {countdown && !countdown.isPast ? countdown.hours.toString().padStart(2, '0') : '00'}
              </span>
              <span className="u">Hrs</span>
            </div>
            <div className="feed__cell">
              <span className="n broadsheet-tnum" data-cd="m">
                {countdown && !countdown.isPast ? countdown.minutes.toString().padStart(2, '0') : '00'}
              </span>
              <span className="u">Min</span>
            </div>
          </div>

          <div className="feed__cond">
            <div>
              <div className="l">Air temp</div>
              <div className="v">24.2°C</div>
            </div>
            <div>
              <div className="l">Track temp</div>
              <div className="v">35.8°C</div>
            </div>
            <div>
              <div className="l">Humidity</div>
              <div className="v">42%</div>
            </div>
          </div>

          <div className="feed__tele">
            <div className="hd">
              <span>Telemetry // sector delta</span>
              <b>● Live</b>
            </div>
            <div className="feed__bars" id="feedbars">
              {Array.from({ length: 30 }).map((_, i) => {
                const delay = (-Math.random() * 1.3).toFixed(2) + 's';
                const duration = (1 + Math.random() * 0.9).toFixed(2) + 's';
                return (
                  <i
                    key={i}
                    style={{
                      animationDelay: delay,
                      animationDuration: duration,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Standings Tables */}
      <div className="standings">
        {/* Drivers Standings */}
        <div className="stand">
          <div className="stand__hd">
            <span className="broadsheet-label broadsheet-label--ink">Drivers&apos; championship</span>
            <span className="broadsheet-label">Top 5</span>
          </div>

          {topDrivers.length > 0 ? (
            topDrivers.map((item, idx) => {
              const driverName = `${item.driver.givenName.charAt(0)}. ${item.driver.familyName}`;
              const teamName = item.constructors[0]?.name ?? '';
              const teamColor = getTeamColor(teamName);
              return (
                <div
                  key={item.driver.id}
                  className={`row ${idx === 0 ? 'lead' : ''}`}
                  style={{ '--tc': teamColor } as React.CSSProperties}
                >
                  <span className="row__pos broadsheet-tnum">{idx + 1}</span>
                  <span className="row__bar" />
                  <div>
                    <div className="row__nm">{driverName}</div>
                    <div className="row__tm">{teamName || 'Independent'}</div>
                  </div>
                  <div className="row__pts broadsheet-tnum">
                    {item.points}
                    <span> PTS</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="font-mono text-xs text-silver mt-4">Standings feed loading...</p>
          )}
        </div>

        {/* Constructors Standings */}
        <div className="stand">
          <div className="stand__hd">
            <span className="broadsheet-label broadsheet-label--ink">Constructors&apos; championship</span>
            <span className="broadsheet-label">Top 5</span>
          </div>

          {topConstructors.length > 0 ? (
            topConstructors.map((item, idx) => {
              const teamName = item.constructor.name;
              const teamColor = getTeamColor(teamName);
              const nationality = item.constructor.nationality;
              return (
                <div
                  key={item.constructor.id}
                  className={`row ${idx === 0 ? 'lead' : ''}`}
                  style={{ '--tc': teamColor } as React.CSSProperties}
                >
                  <span className="row__pos broadsheet-tnum">{idx + 1}</span>
                  <span className="row__bar" />
                  <div>
                    <div className="row__nm">{teamName}</div>
                    <div className="row__tm">{nationality}</div>
                  </div>
                  <div className="row__pts broadsheet-tnum">
                    {item.points}
                    <span> PTS</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="font-mono text-xs text-silver mt-4">Standings feed loading...</p>
          )}
        </div>
      </div>
    </section>
  );
}
