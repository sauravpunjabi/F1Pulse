'use client';

import { useSeasonCurrent, useDriverStandings, useConstructorStandings } from '@/lib/api';
import { useCountdown } from './useCountdown';
import { SplitTextReveal } from '@/components/primitives';
import dynamic from 'next/dynamic';

// Dynamically load the client-only 3D track scene
const ThreeTrackScene = dynamic(() => import('./ThreeTrackScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#0a0a0b] border border-steel/20 rounded-2xl shadow-2xl">
      <div className="font-mono text-[0.65rem] text-accent tracking-[0.25em] animate-pulse uppercase">
        CALIBRATING TRACK GEOMETRY...
      </div>
    </div>
  ),
});

const TEAM_COLORS: Record<string, string> = {
  'Red Bull Racing': '#3671C6',
  'Red Bull': '#3671C6',
  'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2',
  'McLaren': '#FF8000',
  'Aston Martin': '#229971',
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
  if (!teamName) return '#7A7872';
  const normalized = Object.keys(TEAM_COLORS).find(
    (key) => teamName.toLowerCase().includes(key.toLowerCase())
  );
  return normalized ? TEAM_COLORS[normalized] : '#7A7872';
};

export function CurrentEra() {
  const seasonQuery = useSeasonCurrent();
  const driversQuery = useDriverStandings('current');
  const constructorsQuery = useConstructorStandings('current');

  const nextRace = seasonQuery.data?.nextRace;
  const countdown = useCountdown(nextRace?.date);

  const topDrivers = driversQuery.data?.standings.slice(0, 3) ?? [];
  const topConstructors = constructorsQuery.data?.standings.slice(0, 3) ?? [];

  const location = nextRace
    ? [nextRace.circuit.locality, nextRace.circuit.country].filter(Boolean).join(', ')
    : '';

  return (
    <section className="relative min-h-screen w-full bg-off-white px-8 py-20 text-black md:px-16 lg:py-32">
      {/* ── Section Title ──────────────────────────────────────────────────── */}
      <div className="mb-16 md:mb-24">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-accent">
          02 // THE CURRENT ERA
        </span>
        <h2 className="mt-2 font-display text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl lg:text-8xl">
          <SplitTextReveal text="GROUND EFFECT" />
        </h2>
        <p className="mt-4 max-w-xl font-serif text-lg italic text-silver leading-relaxed">
          Venturi tunnels, high-downforce floor dynamics, and hybrid turbo integration define the modern era of Formula 1.
        </p>
      </div>

      {/* ── Asymmetrical Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Massive Editorial Image & Regulation Sub-box */}
        <div className="flex flex-col gap-8 lg:col-span-7">
          <div className="w-full aspect-[16/10] relative">
            <ThreeTrackScene circuitId={nextRace?.circuit.id} circuitName={nextRace?.name} />
          </div>

          {/* Unified Track Specification Cards */}
          <div className="flex flex-col gap-6 font-serif text-base leading-relaxed text-silver md:flex-row md:gap-8">
            <div className="flex-1 border-t-2 border-steel/30 pt-4 text-left">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] font-bold text-black">
                Circuit DNA
              </span>
              <p className="mt-2 text-xs md:text-sm text-silver leading-relaxed">
                High speed thresholds, mechanical grip stress levels, and precise corner entries define the track characteristics of the upcoming Grand Prix.
              </p>
            </div>

            <div className="flex-1 border-t-2 border-steel/30 pt-4 text-left">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] font-bold text-black">
                Telemetry Target
              </span>
              <p className="mt-2 text-xs md:text-sm text-silver leading-relaxed">
                Optimal setup demands a compromise between straightline velocity efficiency (DRS gain) and aerodynamic downforce recovery in slow, technical sectors.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Data and Standings Widgets */}
        <div className="flex flex-col gap-12 lg:col-span-5">
          {/* Next Race Timing Gantry Card */}
          <div className="relative overflow-hidden bg-[#121214] text-white border border-white/[0.08] shadow-2xl rounded-2xl p-6">
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-accent/20 to-transparent rotate-45 translate-x-8 -translate-y-8" />
            <div className="absolute top-0 left-0 w-1.5 h-12 bg-accent" />

            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.25em] text-accent font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                LIVE TIMING FEED
              </span>
              <span className="font-mono text-[0.55rem] text-white/40 uppercase tracking-widest">
                ROUND {seasonQuery.data?.nextRace ? '08' : '--'}
              </span>
            </div>

            {nextRace ? (
              <div>
                <h3 className="font-serif text-2xl font-bold leading-none tracking-tight text-white mb-1.5">
                  {nextRace.name}
                </h3>
                <p className="font-mono text-[0.6rem] text-white/50 uppercase tracking-wider mb-6">
                  {nextRace.circuit.name} {location ? `// ${location}` : ''}
                </p>

                {/* Gantry Clock display */}
                {countdown && !countdown.isPast ? (
                  <div className="grid grid-cols-3 gap-2 border-y border-white/[0.08] py-4 text-center font-mono">
                    <div className="flex flex-col">
                      <span className="text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] tabular-nums">
                        {countdown.days}
                      </span>
                      <span className="text-[0.5rem] text-white/40 uppercase tracking-widest mt-1">Days</span>
                    </div>
                    <div className="flex flex-col border-x border-white/[0.08]">
                      <span className="text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] tabular-nums">
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[0.5rem] text-white/40 uppercase tracking-widest mt-1">Hours</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-3xl font-extrabold text-accent drop-shadow-[0_0_8px_rgba(201,32,26,0.5)] tracking-tight tabular-nums">
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[0.5rem] text-accent/80 uppercase tracking-widest mt-1">Mins</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 border-y border-white/[0.08] font-mono text-xs uppercase tracking-widest text-accent font-bold text-center animate-pulse">
                    RACE IN PROGRESS // LIGHTS OUT
                  </div>
                )}

                {/* Simulated weather and telemetry */}
                <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[0.6rem] text-white/50">
                  <div>
                    <span className="block text-white/30 uppercase">Air Temp</span>
                    <span className="font-bold text-white">24.2 °C</span>
                  </div>
                  <div className="border-x border-white/[0.08] px-2 text-center">
                    <span className="block text-white/30 uppercase">Track Temp</span>
                    <span className="font-bold text-white">35.8 °C</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-white/30 uppercase">Humidity</span>
                    <span className="font-bold text-white">42 %</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="font-mono text-xs text-white/40 py-4">Schedule currently unavailable.</p>
            )}
          </div>

          {/* Championship Standings Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-steel/30 pt-8">
            {/* Drivers Standings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-black font-bold">
                  DRIVERS LEADERBOARD
                </span>
                <span className="font-mono text-[0.55rem] text-silver uppercase">TOP 3</span>
              </div>
              <div className="flex flex-col gap-3">
                {topDrivers.length > 0 ? (
                  topDrivers.map((item, idx) => {
                    const teamName = item.constructors[0]?.name ?? '';
                    const teamColor = getTeamColor(teamName);
                    return (
                      <div
                        key={item.driver.id}
                        className="group/row relative flex justify-between items-center bg-white/40 border border-steel/10 rounded-xl pl-4 pr-4 py-3 transition-all duration-300 hover:bg-white hover:shadow-lg hover:-translate-y-0.5"
                      >
                        {/* Left edge team color indicator */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                          style={{ backgroundColor: teamColor }}
                        />

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-silver tabular-nums w-4">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-display font-bold text-base uppercase leading-none text-black tracking-wide group-hover/row:text-accent transition-colors">
                              {item.driver.givenName.charAt(0)}. {item.driver.familyName}
                            </p>
                            <p className="font-mono text-[0.55rem] uppercase text-silver mt-1">
                              {teamName || 'Independent'}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-sm font-bold tabular-nums text-black">
                          {item.points} <span className="text-[0.6rem] text-silver font-normal">PTS</span>
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="font-mono text-xs text-silver">Loading standings...</p>
                )}
              </div>
            </div>

            {/* Constructors Standings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-black font-bold">
                  CONSTRUCTORS
                </span>
                <span className="font-mono text-[0.55rem] text-silver uppercase">TOP 3</span>
              </div>
              <div className="flex flex-col gap-3">
                {topConstructors.length > 0 ? (
                  topConstructors.map((item, idx) => {
                    const teamName = item.constructor.name;
                    const teamColor = getTeamColor(teamName);
                    return (
                      <div
                        key={item.constructor.id}
                        className="group/row relative flex justify-between items-center bg-white/40 border border-steel/10 rounded-xl pl-4 pr-4 py-3 transition-all duration-300 hover:bg-white hover:shadow-lg hover:-translate-y-0.5"
                      >
                        {/* Left edge team color indicator */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                          style={{ backgroundColor: teamColor }}
                        />

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-silver tabular-nums w-4">
                            {idx + 1}
                          </span>
                          <p className="font-display font-bold text-base uppercase leading-none text-black tracking-wide group-hover/row:text-accent transition-colors">
                            {teamName}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-bold tabular-nums text-black">
                          {item.points} <span className="text-[0.6rem] text-silver font-normal">PTS</span>
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="font-mono text-xs text-silver">Loading standings...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
