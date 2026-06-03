'use client';

/**
 * /history — cinematic history mode page.
 *
 * Structure (top → bottom):
 *
 *   OpeningSequence         scroll-locked intro (TelemetryLine → text reveals)
 *   ───────────────────────────────────────────────────────────────────────────
 *   Chapter 01  Birth of F1          1950–1959   B&W, heavy grain, slow motion
 *   ColorTransitionScene             1967        THE signature moment
 *   Chapter 03  Golden Era           1970s–80s   warm tones, analogue weight
 *   Chapter 04  Senna / Prost        1988–1993   split-screen, scroll-year
 *   Chapter 05  Schumacher / Ferrari 2000–2006   metallic, telemetry-grid
 *   Chapter 06  Hybrid Era           2014–2020   cool, clinical, teal
 *   Chapter 07  Modern → 2026        2021–       reverts to live F1Pulse palette
 *   ───────────────────────────────────────────────────────────────────────────
 *   IconicMomentsSection             10 defining moments — full-viewport pins
 *
 * All era data from our own API. Zero hardcoded race data.
 */

import { OpeningSequence }        from '@/components/history/OpeningSequence';
import { ColorTransitionScene }    from '@/components/history/ColorTransitionScene';
import { EraChapter }              from '@/components/history/EraChapter';
import { BirthOfF1Content }        from '@/components/history/BirthOfF1Content';
import { GoldenEraContent }        from '@/components/history/GoldenEraContent';
import { SennaProstContent, SENNA_PROST_PIN_DURATION } from '@/components/history/SennaProstContent';
import { SchumacherContent }       from '@/components/history/SchumacherContent';
import { HybridEraContent }        from '@/components/history/HybridEraContent';
import { ModernEraContent }        from '@/components/history/ModernEraContent';
import { IconicMomentsSection }    from '@/components/history/IconicMomentsSection';
import { useHistoryChampions }     from '@/lib/api';

// ── Era chapter cosmetic config — no race data, only theming constants ─────────

export default function HistoryPage() {
  // Pre-load champions list into React Query cache so child chapters
  // don't trigger their own waterfall requests.
  useHistoryChampions();

  return (
    <main className="bg-[var(--bg)]" aria-label="Formula One history">

      {/* ── Scroll-locked opening sequence ────────────────────────────────── */}
      <OpeningSequence />

      {/* ── Chapter 01: Birth of F1 (1950–1959) ──────────────────────────── */}
      <EraChapter
        index={0}
        chapterNumber="01"
        yearRange="1950 – 1959"
        title="Birth of F1"
        pinDuration={1100}
        themeVars={{ '--era-accent': '#909090', '--motion-duration': '800ms' }}
      >
        <BirthOfF1Content />
      </EraChapter>

      {/* ── Chapter 02: The 1967 Colour Transition ────────────────────────── */}
      {/* Own complex scene; does not use the generic EraChapter scaffold.    */}
      <ColorTransitionScene />

      {/* ── Chapter 03: The Golden Era (1970s–1980s) ─────────────────────── */}
      <EraChapter
        index={2}
        chapterNumber="03"
        yearRange="1970s – 1980s"
        title="The Golden Era"
        pinDuration={1100}
        themeVars={{ '--era-accent': '#C4956A', '--motion-duration': '700ms' }}
      >
        <GoldenEraContent />
      </EraChapter>

      {/* ── Chapter 04: Senna / Prost (1988–1993) ────────────────────────── */}
      {/* Increased pinDuration to SENNA_PROST_PIN_DURATION (2400 px) so     */}
      {/* SennaProstContent's GSAP sub-trigger can scrub years 1988 → 1991.   */}
      <EraChapter
        index={3}
        chapterNumber="04"
        yearRange="1988 – 1993"
        title="Senna / Prost"
        pinDuration={SENNA_PROST_PIN_DURATION}
        themeVars={{ '--era-accent': '#FF1801', '--motion-duration': '600ms' }}
      >
        <SennaProstContent />
      </EraChapter>

      {/* ── Chapter 05: The Schumacher Era (2000–2006) ───────────────────── */}
      <EraChapter
        index={4}
        chapterNumber="05"
        yearRange="2000 – 2006"
        title="The Schumacher Era"
        pinDuration={1100}
        themeVars={{ '--era-accent': '#E10600', '--motion-duration': '500ms' }}
      >
        <SchumacherContent />
      </EraChapter>

      {/* ── Chapter 06: Hybrid Dominance (2014–2020) ─────────────────────── */}
      <EraChapter
        index={5}
        chapterNumber="06"
        yearRange="2014 – 2020"
        title="Hybrid Dominance"
        pinDuration={1100}
        themeVars={{ '--era-accent': '#00D2BE', '--motion-duration': '400ms' }}
      >
        <HybridEraContent />
      </EraChapter>

      {/* ── Chapter 07: The Modern Era → Live 2026 ───────────────────────── */}
      {/* This chapter reverts to full F1Pulse colour — grayscale is gone.   */}
      <EraChapter
        index={6}
        chapterNumber="07"
        yearRange="2021 – 2026"
        title="The Modern Era"
        pinDuration={1100}
        themeVars={{ '--era-accent': 'var(--color-red)', '--motion-duration': '280ms' }}
      >
        <ModernEraContent />
      </EraChapter>

      {/* ── Iconic Moments — 10 full-viewport pinned sections ────────────── */}
      <IconicMomentsSection />

    </main>
  );
}
