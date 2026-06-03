'use client';

/**
 * Act 3 — Championship battle scroll.
 * Each overlapping season: winner highlighted, points gap as animated bar.
 * Data from useDriverSeasons for both drivers.
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { DriverCareerSeasonDto, DriverProfileDto } from '@/lib/api';
import type { RivalryConfig } from '@/config/rivalries';

interface ChampionshipBattleProps {
  config: RivalryConfig;
  profileA: DriverProfileDto;
  profileB: DriverProfileDto;
  seasonsA: DriverCareerSeasonDto[];
  seasonsB: DriverCareerSeasonDto[];
}

interface SeasonCompare {
  year: number;
  pointsA: number;
  pointsB: number;
  posA: number;
  posB: number;
}

function buildSeasonCompares(
  seasonsA: DriverCareerSeasonDto[],
  seasonsB: DriverCareerSeasonDto[],
  eraStart: number,
  eraEnd: number,
): SeasonCompare[] {
  const mapA = new Map(seasonsA.map((s) => [s.season, s]));
  const mapB = new Map(seasonsB.map((s) => [s.season, s]));
  const result: SeasonCompare[] = [];

  for (let y = eraStart; y <= eraEnd; y++) {
    const a = mapA.get(y);
    const b = mapB.get(y);
    if (a && b) {
      result.push({
        year: y,
        pointsA: a.points,
        pointsB: b.points,
        posA: a.position,
        posB: b.position,
      });
    }
  }
  return result;
}

interface BattleRowProps {
  season: SeasonCompare;
  nameA: string;
  nameB: string;
  index: number;
}

function BattleRow({ season, nameA, nameB, index }: BattleRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  const maxPts = Math.max(season.pointsA, season.pointsB, 1);
  const ratioA = season.pointsA / maxPts;
  const ratioB = season.pointsB / maxPts;

  const aWon = season.posA < season.posB;
  const bWon = season.posB < season.posA;
  const tied = season.posA === season.posB;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.25, 1, 0.5, 1] }}
      className="relative border-b border-white/6 py-8"
    >
      {/* Year */}
      <span
        className="mb-6 block font-mono text-[0.44rem] uppercase tracking-[0.35em] text-white/25"
      >
        {season.year}
        {!tied && (
          <span
            className="ml-3"
            style={{ color: aWon ? '#E10600' : 'rgba(255,255,255,0.5)' }}
          >
            {aWon ? nameA : nameB} champion
          </span>
        )}
      </span>

      {/* Points bars */}
      <div className="flex flex-col gap-4">
        {/* Driver A */}
        <div className="flex items-center gap-4">
          <span
            className="w-20 text-right font-display font-black uppercase leading-none text-white"
            style={{
              fontSize: 'clamp(0.65rem, 1.5vw, 0.85rem)',
              opacity: aWon ? 1 : 0.4,
            }}
          >
            {nameA}
          </span>
          <div className="flex flex-1 items-center gap-3">
            <div className="relative h-0.5 flex-1 bg-white/8">
              <motion.div
                className="absolute left-0 top-0 h-full"
                style={{ background: '#E10600', transformOrigin: 'left' }}
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: ratioA } : { scaleX: 0 }}
                transition={{
                  duration: 1.0,
                  delay: index * 0.06 + 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </div>
            <span
              className="font-mono text-[0.48rem] tabular-nums"
              style={{ color: aWon ? '#E10600' : 'rgba(255,255,255,0.4)', minWidth: 38 }}
            >
              {season.pointsA.toFixed(0)} pts
            </span>
          </div>
        </div>

        {/* Driver B */}
        <div className="flex items-center gap-4">
          <span
            className="w-20 text-right font-display font-black uppercase leading-none text-white"
            style={{
              fontSize: 'clamp(0.65rem, 1.5vw, 0.85rem)',
              opacity: bWon ? 1 : 0.4,
            }}
          >
            {nameB}
          </span>
          <div className="flex flex-1 items-center gap-3">
            <div className="relative h-0.5 flex-1 bg-white/8">
              <motion.div
                className="absolute left-0 top-0 h-full"
                style={{ background: 'rgba(255,255,255,0.55)', transformOrigin: 'left' }}
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: ratioB } : { scaleX: 0 }}
                transition={{
                  duration: 1.0,
                  delay: index * 0.06 + 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </div>
            <span
              className="font-mono text-[0.48rem] tabular-nums"
              style={{ color: bWon ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)', minWidth: 38 }}
            >
              {season.pointsB.toFixed(0)} pts
            </span>
          </div>
        </div>
      </div>

      {/* Points delta */}
      {season.pointsA !== season.pointsB && (
        <div className="mt-4 flex items-center gap-2">
          <div className="h-px w-6 bg-white/12" />
          <span className="font-mono text-[0.42rem] uppercase tracking-widest text-white/20">
            Δ {Math.abs(season.pointsA - season.pointsB).toFixed(0)} pts
          </span>
        </div>
      )}
    </motion.div>
  );
}

export function ChampionshipBattle({
  config,
  profileA,
  profileB,
  seasonsA,
  seasonsB,
}: ChampionshipBattleProps) {
  const compares = buildSeasonCompares(seasonsA, seasonsB, config.eraStart, config.eraEnd);

  if (compares.length === 0) return null;

  return (
    <section
      className="px-6 py-20 md:px-16"
      aria-label="Championship battle by season"
    >
      <p className="mb-12 font-mono text-[0.52rem] uppercase tracking-[0.35em] text-white/25">
        Season by Season
      </p>

      <div className="flex flex-col">
        {compares.map((s, i) => (
          <BattleRow
            key={s.year}
            season={s}
            nameA={profileA.familyName}
            nameB={profileB.familyName}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
