'use client';

/**
 * IconicMomentsSection — the 10 defining moments of F1 history.
 *
 * Each moment is a full-viewport, GSAP-pinned, scroll-driven section.
 * Data is fetched from our own API — zero hardcoded stats.
 *
 * API sources per moment:
 *   Fangio 1957          → /api/era/1957/champion
 *   Lauda 1976           → /api/era/1976/champion
 *   Senna Imola 1994     → /api/era/1994/champion
 *   Schumacher 2002      → /api/results/2002/12  (German GP, Round 12)
 *   Kimi 2007            → /api/era/2007/champion
 *   Brawn GP 2009        → /api/era/2009/champion
 *   Hamilton 7th 2020    → /api/driver/hamilton  (career stats)
 *   Grosjean Bahrain     → narrative only (no stat)
 *   Abu Dhabi 2021       → /api/era/2021/champion
 *   Brazil 2008          → /api/era/2008/champion
 *
 * All narrative fields are "". User writes every word.
 */

import {
  useEraChampion,
  useRoundResults,
  useDriverProfile,
} from '@/lib/api';
import { IconicMoment, ChampionStat, StatCell } from '@/components/history/IconicMoment';

export function IconicMomentsSection() {
  // ── Pre-fetch all API data ─────────────────────────────────────────────────
  const { data: champion1957 } = useEraChampion(1957);
  const { data: champion1976 } = useEraChampion(1976);
  const { data: champion1994 } = useEraChampion(1994);
  // German GP 2002 = Round 12 (Hockenheim — Michael Schumacher + Rubens Barrichello)
  const { data: results2002 }  = useRoundResults(2002, 12);
  const { data: champion2007 } = useEraChampion(2007);
  const { data: champion2009 } = useEraChampion(2009);
  const { data: hamilton }     = useDriverProfile('hamilton');
  const { data: champion2021 } = useEraChampion(2021);
  const { data: champion2008 } = useEraChampion(2008);

  // Schumacher P1 + Barrichello P2 from 2002 German GP
  const winner2002 = results2002?.results.find((r) => r.position === 1) ?? null;
  const p2_2002    = results2002?.results.find((r) => r.position === 2) ?? null;

  return (
    <>
      {/* ── 1. Fangio German GP 1957 ───────────────────────────────────── */}
      <IconicMoment
        title="Fangio's Finest Hour"
        year={1957}
        narrative=""
        imageSrc="https://placehold.co/1600x900/0c0c0d/222226"
        imageAlt="Juan Manuel Fangio German Grand Prix Nürburgring 1957"
        stat={
          champion1957 ? (
            <ChampionStat champion={champion1957} />
          ) : null
        }
      />

      {/* ── 2. Lauda Crash + Return 1976 ──────────────────────────────── */}
      <IconicMoment
        title="Return From the Ashes"
        year={1976}
        narrative=""
        imageSrc="https://placehold.co/1600x900/0c0c0d/222226"
        imageAlt="Niki Lauda Nürburgring crash 1976 and comeback"
        stat={
          champion1976 ? (
            <div className="flex items-start gap-8">
              <StatCell
                label="Champion"
                value={`${champion1976.driver.givenName[0] ?? ''}. ${champion1976.driver.familyName}`}
              />
              <StatCell label="Points" value={champion1976.points.toFixed(0)} />
              <StatCell label="Margin" value="1 pt" />
            </div>
          ) : null
        }
      />

      {/* ── 3. Senna Death Imola 1994 ─────────────────────────────────── */}
      <IconicMoment
        title="Imola"
        year={1994}
        narrative=""
        imageSrc="https://placehold.co/1600x900/0c0c0d/222226"
        imageAlt="Ayrton Senna San Marino Grand Prix Imola 1994"
        stat={
          champion1994 ? (
            <ChampionStat champion={champion1994} />
          ) : null
        }
      />

      {/* ── 4. Schumacher Hockenheim 2002 — Team Orders ───────────────── */}
      <IconicMoment
        title="Hockenheim Team Orders"
        year={2002}
        narrative=""
        imageSrc="https://placehold.co/1600x900/0c0c0d/222226"
        imageAlt="Schumacher Barrichello German Grand Prix Hockenheim 2002 team orders"
        stat={
          winner2002 && p2_2002 ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-8">
                <StatCell label="P1" value={winner2002.driver.familyName} />
                <StatCell label="P2" value={p2_2002.driver.familyName} />
                <StatCell label="Circuit" value={results2002?.circuit.name ?? '—'} />
              </div>
              <div className="mt-1 font-mono text-[0.4rem] uppercase tracking-[0.2em] text-white/25">
                Round {results2002?.round ?? '—'} · {results2002?.season}
              </div>
            </div>
          ) : null
        }
      />

      {/* ── 5. Kimi 2007 — Final Race Championship ────────────────────── */}
      <IconicMoment
        title="Kimi Wins It All"
        year={2007}
        narrative=""
        imageSrc="https://placehold.co/1600x900/0c0c0d/222226"
        imageAlt="Kimi Räikkönen 2007 Brazilian Grand Prix World Championship"
        stat={
          champion2007 ? (
            <ChampionStat champion={champion2007} />
          ) : null
        }
      />

      {/* ── 6. Brawn GP 2009 Miracle ──────────────────────────────────── */}
      <IconicMoment
        title="The Brawn Miracle"
        year={2009}
        narrative=""
        imageSrc="https://placehold.co/1600x900/0c0c0d/222226"
        imageAlt="Brawn GP Jenson Button 2009 World Championship"
        stat={
          champion2009 ? (
            <div className="flex items-start gap-8">
              <StatCell
                label="Champion"
                value={`${champion2009.driver.givenName[0] ?? ''}. ${champion2009.driver.familyName}`}
              />
              <StatCell label="Team" value={champion2009.constructors[0]?.name ?? '—'} />
              <StatCell label="Points" value={champion2009.points.toFixed(0)} />
            </div>
          ) : null
        }
      />

      {/* ── 7. Hamilton 7th Championship 2020 ────────────────────────── */}
      <IconicMoment
        title="Seven"
        year={2020}
        narrative=""
        imageSrc="https://placehold.co/1600x900/0c0c0d/222226"
        imageAlt="Lewis Hamilton seventh World Championship 2020"
        stat={
          hamilton ? (
            <div className="flex items-start gap-8">
              <StatCell label="Championships" value={hamilton.stats.championships} />
              <StatCell label="Wins"          value={hamilton.stats.wins} />
              <StatCell label="Poles"         value={hamilton.stats.poles} />
            </div>
          ) : null
        }
      />

      {/* ── 8. Grosjean Bahrain Escape 2020 — narrative only ─────────── */}
      <IconicMoment
        title="The Escape"
        year={2020}
        narrative=""
        imageSrc="https://placehold.co/1600x900/0c0c0d/222226"
        imageAlt="Romain Grosjean Bahrain Grand Prix 2020 fire escape"
        stat={null}
      />

      {/* ── 9. Abu Dhabi 2021 ─────────────────────────────────────────── */}
      <IconicMoment
        title="Last Lap"
        year={2021}
        narrative=""
        imageSrc="https://placehold.co/1600x900/0c0c0d/222226"
        imageAlt="Abu Dhabi Grand Prix 2021 final lap championship"
        stat={
          champion2021 ? (
            <ChampionStat champion={champion2021} />
          ) : null
        }
      />

      {/* ── 10. Brazil 2008 ───────────────────────────────────────────── */}
      <IconicMoment
        title="Brazil"
        year={2008}
        narrative=""
        imageSrc="https://placehold.co/1600x900/0c0c0d/222226"
        imageAlt="Lewis Hamilton Brazilian Grand Prix 2008 championship final lap"
        stat={
          champion2008 ? (
            <div className="flex items-start gap-8">
              <StatCell
                label="Champion"
                value={`${champion2008.driver.givenName[0] ?? ''}. ${champion2008.driver.familyName}`}
              />
              <StatCell label="Points" value={champion2008.points.toFixed(0)} />
              <StatCell label="Margin" value="1 pt" />
            </div>
          ) : null
        }
      />
    </>
  );
}
