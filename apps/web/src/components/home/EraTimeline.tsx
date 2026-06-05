'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useHistoryChampions } from '@/lib/api';
import type { SeasonChampionDto } from '@/lib/api';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface EraConfig {
  id: string;
  name: string;
  years: string;
  subtitle: string;
  themeClass: string;
  fontClass: string;
  description: string;
  accentColor: string;
  startYear: number;
  endYear: number;
}

const ERAS: EraConfig[] = [
  {
    id: 'era-pioneers',
    name: 'The Pioneers',
    years: '1950 – 1965',
    subtitle: 'Danger, Drum Brakes & Cigar Chassis',
    themeClass: 'text-black',
    fontClass: 'font-serif',
    description: 'Front-engine cigar racers with zero seatbelts, drum brakes, and narrow canvas tires. Driving was an act of extreme courage.',
    accentColor: '#8E8D86',
    startYear: 1950,
    endYear: 1965,
  },
  {
    id: 'era-analogue',
    name: 'Analogue Speed',
    years: '1966 – 1987',
    subtitle: 'Wings, Ground Effect & Ford Cosworth DFV',
    themeClass: 'text-stone-900',
    fontClass: 'font-sans uppercase font-extrabold tracking-tight',
    description: 'The mid-engine revolution, massive wings, ground-effect Venturi tunnels, and wild turbochargers. The golden era of pure driver feel.',
    accentColor: '#BCA374',
    startYear: 1966,
    endYear: 1987,
  },
  {
    id: 'era-electronic',
    name: 'Electronic Reign',
    years: '1988 – 2008',
    subtitle: 'Active Suspension, Carbon Fiber & V10 Screams',
    themeClass: 'text-stone-100',
    fontClass: 'font-mono text-accent',
    description: 'Carbon fiber chassis, active suspension, traction control, semi-automatic gearboxes, and the high-revving screams of V10 engines.',
    accentColor: '#C9201A',
    startYear: 1988,
    endYear: 2008,
  },
  {
    id: 'era-hybrid',
    name: 'Hybrid efficiency',
    years: '2009 – 2021',
    subtitle: 'MGU-K, V6 Turbos & Aerodynamic Precision',
    themeClass: 'text-slate-100',
    fontClass: 'font-sans tracking-wide',
    description: 'High-efficiency thermal units, dual energy recovery systems (MGU-K/H), DRS wing flaps, and clinical computational aerodynamic design.',
    accentColor: '#00D2BE',
    startYear: 2009,
    endYear: 2021,
  },
  {
    id: 'era-revival',
    name: 'Modern Ground Effect',
    years: '2022 – 2026',
    subtitle: 'Venturi Floors, Close Racing & Neon Future',
    themeClass: 'text-white',
    fontClass: 'font-display uppercase font-black tracking-tighter',
    description: 'The return of 3D floor tunnels to reduce dirty wake. Closer racing, massive 18-inch wheels, and sustainable fuels aiming for 2026.',
    accentColor: '#E10600',
    startYear: 2022,
    endYear: 2026,
  },
];

export function EraTimeline() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const championsQuery = useHistoryChampions();
  const champions = championsQuery.data ?? [];

  useEffect(() => {
    const panels = panelsRef.current;
    const trigger = triggerRef.current;
    if (!panels || !trigger) return;

    const ctx = gsap.context(() => {
      // 1. Pinned horizontal scroll scroll animation
      const scrollWidth = panels.scrollWidth;
      const windowWidth = window.innerWidth;
      const xDistance = scrollWidth - windowWidth;

      gsap.to(panels, {
        x: -xDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: trigger,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${xDistance * 1.2}`,
          invalidateOnRefresh: true,
        },
      });

      // 2. Color shifts matching each era's mood
      const colorTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: trigger,
          scrub: 1,
          start: 'top top',
          end: () => `+=${xDistance * 1.2}`,
          invalidateOnRefresh: true,
        },
      });

      colorTimeline
        .to(trigger, { backgroundColor: '#F5F4F0', duration: 1 }) // Start off-white
        .to(trigger, { backgroundColor: '#EADBC8', duration: 1 }) // Pioneers to Analogue (Gold/Sepia)
        .to(trigger, { backgroundColor: '#1C1C1C', duration: 1 }) // Analogue to Electronic (Charcoal)
        .to(trigger, { backgroundColor: '#0F172A', duration: 1 }) // Electronic to Hybrid (Slate Slate)
        .to(trigger, { backgroundColor: '#070707', duration: 1 }); // Hybrid to Modern (Rich Matte Black)
    }, trigger);

    return () => ctx.revert();
  }, [champions]);

  return (
    <div
      ref={triggerRef}
      id="eras"
      className="relative min-h-screen w-full bg-off-white transition-colors duration-500 overflow-hidden"
    >
      {/* Horizontal Panels Row */}
      <div
        ref={panelsRef}
        className="flex h-screen items-center flex-row whitespace-nowrap will-change-transform"
        style={{ width: `${ERAS.length * 100}vw` }}
      >
        {ERAS.map((era, index) => {
          const eraChampions = champions.filter(
            (c) => c.season >= era.startYear && c.season <= era.endYear
          );
          
          // Select up to 4 key champions to show to prevent horizontal overflow inside panel
          const keyChampions = eraChampions
            .filter((_, idx) => idx % Math.max(1, Math.ceil(eraChampions.length / 4)) === 0)
            .slice(0, 4);

          return (
            <div
              key={era.id}
              className={`flex-shrink-0 inline-flex flex-col justify-between h-full w-screen px-6 py-16 md:px-16 lg:py-24 whitespace-normal ${era.themeClass}`}
            >
              {/* Top Banner info */}
              <div className="flex justify-between items-center border-b border-current/10 pb-3 font-mono text-[0.6rem] uppercase tracking-[0.3em] opacity-50">
                <span>Timeline // Era 0{index + 1}</span>
                <span>{era.years}</span>
              </div>

              {/* Central Details and Storytelling */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-12 my-auto">
                <div className="max-w-xl space-y-4 md:space-y-6">
                  {/* Years Tag */}
                  <span className="font-mono text-[0.65rem] sm:text-xs font-semibold tracking-[0.25em] text-accent">
                    {era.years}
                  </span>
                  
                  {/* Era Title */}
                  <h3 className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.9] whitespace-normal ${era.fontClass}`}>
                    {era.name}
                  </h3>
                  
                  {/* Era Subtitle */}
                  <h4 className="font-serif italic text-sm sm:text-base md:text-lg opacity-80 whitespace-normal">
                    {era.subtitle}
                  </h4>
                  
                  {/* Era Description */}
                  <p className="font-sans text-xs sm:text-sm md:text-base leading-relaxed opacity-75 max-w-lg whitespace-normal">
                    {era.description}
                  </p>
                </div>

                {/* Dynamic Champions Sub-list for Era */}
                <div className="flex flex-col gap-3 md:gap-4 w-full max-w-md lg:max-w-none lg:min-w-[400px]">
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.25em] opacity-40">
                    Era Champions Snapshot
                  </span>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {keyChampions.length > 0 ? (
                      keyChampions.map((champion) => (
                        <ChampionCard
                          key={champion.season}
                          champion={champion}
                          era={era}
                        />
                      ))
                    ) : (
                      <div className="border border-current/10 p-4 text-center font-mono text-xs opacity-50">
                        {championsQuery.isLoading ? 'Querying feeds...' : 'Championship Archive'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom footer bar */}
              <div className="flex justify-between font-mono text-[0.55rem] uppercase tracking-[0.2em] opacity-40 border-t border-current/10 pt-4">
                <span>PULSE HISTORICAL TIMELINE // ARCHIVE</span>
                <span>Formula 1 Documentary</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Champion Card Sub-component ──────────────────────────────────────────────

function ChampionCard({
  champion,
  era,
}: {
  champion: SeasonChampionDto;
  era: EraConfig;
}) {
  // Era-specific card border/background
  const cardBorderColor = 
    era.id === 'era-pioneers' ? 'border-black/20 hover:border-black' :
    era.id === 'era-analogue' ? 'border-stone-800/20 hover:border-stone-800' :
    era.id === 'era-electronic' ? 'border-white/10 hover:border-accent' :
    era.id === 'era-hybrid' ? 'border-white/10 hover:border-[#00D2BE]' :
    'border-white/15 hover:border-accent';

  const cardBgColor = 
    era.id === 'era-pioneers' ? 'bg-black/[0.02]' :
    era.id === 'era-analogue' ? 'bg-stone-900/[0.02]' :
    'bg-white/[0.02]';

  return (
    <div
      className={`border p-2 sm:p-4 rounded-sm flex flex-col justify-between transition-all duration-300 ${cardBorderColor} ${cardBgColor}`}
    >
      <div className="flex justify-between items-start gap-1">
        <span className="font-mono text-sm sm:text-lg font-bold tabular-nums">
          {champion.season}
        </span>
        <span className="font-mono text-[0.45rem] sm:text-[0.5rem] uppercase opacity-40 mt-1">
          {champion.wins} wins
        </span>
      </div>

      <div className="mt-2 sm:mt-3">
        {/* Champion Driver Name */}
        <p className={`text-xs sm:text-base font-bold uppercase truncate ${era.fontClass}`}>
          {champion.driver.familyName}
        </p>
        
        {/* Team */}
        <p className="font-mono text-[0.48rem] sm:text-[0.55rem] uppercase opacity-50 truncate">
          {champion.constructors[0]?.name ?? 'Independent'}
        </p>
      </div>

      <div className="mt-1.5 pt-1.5 border-t border-current/5 flex justify-between font-mono text-[0.45rem] sm:text-[0.5rem] opacity-40">
        <span>POINTS:</span>
        <span className="tabular-nums font-bold">{champion.points} PTS</span>
      </div>
    </div>
  );
}
