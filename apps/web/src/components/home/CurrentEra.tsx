'use client';

import { useSeasonCurrent, useDriverStandings, useConstructorStandings } from '@/lib/api';
import { useCountdown } from './useCountdown';
import Image from 'next/image';
import { SplitTextReveal } from '@/components/primitives';

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
          <div className="relative aspect-[16/10] w-full overflow-hidden border border-steel/20 bg-iron/20">
            <Image
              src="/modern_f1_car.png"
              alt="Modern F1 Ground Effect Car"
              fill
              priority
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute bottom-4 left-4 bg-black/90 px-4 py-2 text-[0.6rem] font-mono uppercase tracking-[0.2em] text-white">
              Ground Effect Spec · 2026 Season
            </div>
          </div>

          <div className="flex flex-col gap-4 font-serif text-base leading-relaxed text-silver md:flex-row md:gap-12">
            <div className="flex-1 border-t border-steel/30 pt-4">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-black font-semibold">Aerodynamics</span>
              <p className="mt-2">
                Under-car tunnels create low pressure, pulling the chassis flat to the track surface and minimizing turbulent wake for closer racing.
              </p>
            </div>
            <div className="flex-1 border-t border-steel/30 pt-4">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-black font-semibold">Power Unit</span>
              <p className="mt-2">
                Hyper-efficient hybrid turbocharger units pairing MGU-K energy harvesting systems with sustainable, high-octane combustion fuels.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Data and Standings Widgets */}
        <div className="flex flex-col gap-12 lg:col-span-5">
          {/* Next Race Widget */}
          <div className="border-t-2 border-black pt-6">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-accent font-bold">
              UPCOMING GRAND PRIX
            </span>
            {nextRace ? (
              <div className="mt-4">
                <h3 className="font-serif text-3xl font-semibold leading-tight tracking-tight">
                  {nextRace.name}
                </h3>
                <p className="font-mono text-xs text-silver mt-1">
                  {nextRace.circuit.name} {location ? `· ${location}` : ''}
                </p>

                {/* Elegantly integrated countdown */}
                {countdown && !countdown.isPast ? (
                  <div className="mt-6 flex items-baseline gap-6 font-mono border-y border-steel/20 py-4">
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold tabular-nums">{countdown.days}</span>
                      <span className="text-[0.55rem] text-silver uppercase tracking-wider">Days</span>
                    </div>
                    <span className="text-xl text-steel/40">:</span>
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold tabular-nums">
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[0.55rem] text-silver uppercase tracking-wider">Hours</span>
                    </div>
                    <span className="text-xl text-steel/40">:</span>
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold tabular-nums">
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[0.55rem] text-silver uppercase tracking-wider">Mins</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 py-3 font-mono text-sm uppercase tracking-widest text-accent font-semibold">
                    RACE IN PROGRESS / LIGHTS OUT
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 font-mono text-sm text-silver">Schedule currently unavailable.</p>
            )}
          </div>

          {/* Championship Standings Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-steel/30 pt-8">
            {/* Drivers Standings */}
            <div>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-black font-bold">
                DRIVERS LEADERBOARD
              </span>
              <div className="mt-4 flex flex-col gap-4">
                {topDrivers.length > 0 ? (
                  topDrivers.map((item, idx) => (
                    <div key={item.driver.id} className="flex justify-between items-end border-b border-steel/10 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-silver tabular-nums w-4">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-display font-bold text-lg uppercase leading-none text-black">
                            {item.driver.familyName}
                          </p>
                          <p className="font-mono text-[0.55rem] uppercase text-silver">
                            {item.constructors[0]?.name ?? 'Independent'}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-semibold tabular-nums">
                        {item.points} <span className="text-[0.6rem] text-silver">PTS</span>
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="font-mono text-xs text-silver">Loading standings...</p>
                )}
              </div>
            </div>

            {/* Constructors Standings */}
            <div>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-black font-bold">
                CONSTRUCTORS
              </span>
              <div className="mt-4 flex flex-col gap-4">
                {topConstructors.length > 0 ? (
                  topConstructors.map((item, idx) => (
                    <div key={item.constructor.id} className="flex justify-between items-end border-b border-steel/10 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-silver tabular-nums w-4">
                          {idx + 1}
                        </span>
                        <p className="font-display font-bold text-lg uppercase leading-none text-black">
                          {item.constructor.name}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-semibold tabular-nums">
                        {item.points} <span className="text-[0.6rem] text-silver">PTS</span>
                      </span>
                    </div>
                  ))
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
