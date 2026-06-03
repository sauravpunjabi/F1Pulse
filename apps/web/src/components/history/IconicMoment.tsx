'use client';

/**
 * <IconicMoment>
 *
 * Full-viewport, GSAP-pinned, scroll-driven section for a single
 * defining F1 moment. Each instance handles its own pin.
 *
 * - Title via MaskReveal (left-to-right)
 * - Year in giant monospace
 * - Narrative paragraph — always "" per spec; rendered only when non-empty
 * - Real stat from API passed as `stat` ReactNode; shown inside a telemetry cell
 * - Era photograph (ImageReveal with parallax)
 * - Honest empty state when no stat is available
 *
 * All narrative copy fields are empty. The user writes every word.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MaskReveal } from '@/components/primitives/MaskReveal';
import { ImageReveal } from '@/components/history/ImageReveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export interface IconicMomentProps {
  /** Display title — shown via MaskReveal */
  title: string;
  /** 4-digit year — displayed as giant mono number */
  year: number;
  /** Narrative copy — must be "" per spec; rendered only when non-empty */
  narrative: string;
  /** Real stat derived from API data — ReactNode or null when unavailable */
  stat: ReactNode;
  /** Placeholder image URL (placehold.co) */
  imageSrc: string;
  /** Image alt text */
  imageAlt: string;
  /** Scroll distance the section is pinned for. Default 700. */
  pinDuration?: number;
}

export function IconicMoment({
  title,
  year,
  narrative,
  stat,
  imageSrc,
  imageAlt,
  pinDuration = 700,
}: IconicMomentProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced    = useReducedMotion();

  useEffect(() => {
    if (!sectionRef.current || reduced) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${pinDuration}`,
        pin: true,
        anticipatePin: 1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced, pinDuration]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden bg-[var(--bg)]"
      aria-label={`Iconic moment: ${title}`}
    >
      {/* ── Full-bleed era photograph (background) ─────────────────────── */}
      <div className="absolute inset-0 z-0">
        {/* TODO: replace with real photography */}
        <ImageReveal
          src={imageSrc}
          alt={imageAlt}
          fill
          parallax
          className="h-full w-full opacity-35"
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50" />
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-5xl px-8 py-20 md:px-16">

        {/* Year — giant mono behind the title */}
        <div
          className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 select-none font-mono font-bold leading-none text-white/[0.05] md:left-16"
          style={{ fontSize: 'clamp(8rem, 22vw, 22rem)' }}
          aria-hidden="true"
        >
          {year}
        </div>

        {/* Label: year + ordinal marker */}
        <div className="mb-6 flex items-center gap-4">
          <span
            className="font-mono text-[0.5rem] font-bold tabular-nums"
            style={{ color: 'var(--accent)' }}
          >
            {year}
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Title via MaskReveal */}
        <MaskReveal direction="left" preset="cinematic">
          <h2
            className="font-display font-black uppercase leading-[0.92] text-white"
            style={{ fontSize: 'clamp(2rem, 6vw, 6rem)' }}
          >
            {title}
          </h2>
        </MaskReveal>

        {/* Narrative — only rendered if non-empty (user writes copy) */}
        {narrative.length > 0 && (
          <p className="mt-6 max-w-xl font-mono text-[0.65rem] leading-relaxed tracking-wide text-white/50">
            {narrative}
          </p>
        )}

        {/* Real stat from API */}
        <div className="mt-10">
          {stat != null ? (
            <div className="inline-block border border-white/12 bg-white/[0.03] px-5 py-4">
              {stat}
            </div>
          ) : (
            /* Honest empty state — no fake data */
            <div className="inline-flex items-center gap-2 border border-white/8 px-4 py-2 opacity-40">
              <div className="h-px w-4 bg-white/30" />
              <span className="font-mono text-[0.42rem] uppercase tracking-[0.3em] text-white/40">
                Data unavailable
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom accent line ──────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 h-px w-full opacity-15"
        style={{ background: 'var(--era-accent, var(--accent))' }}
      />
    </section>
  );
}

// ── Shared stat cell component used by IconicMomentsSection ──────────────────

export function StatCell({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col">
      <span
        className="font-mono font-bold tabular-nums leading-none text-white"
        style={{ fontSize: 'clamp(1.2rem, 3vw, 2.4rem)' }}
      >
        {value}
      </span>
      <span className="mt-1 font-mono text-[0.42rem] uppercase tracking-[0.25em] text-white/35">
        {label}
      </span>
    </div>
  );
}

export function ChampionStat({
  champion,
}: {
  champion: { driver: { givenName: string; familyName: string }; points: number; wins: number };
}) {
  return (
    <div className="flex items-start gap-8">
      <StatCell
        label="Champion"
        value={`${champion.driver.givenName[0] ?? ''}. ${champion.driver.familyName}`}
      />
      <StatCell label="Points" value={champion.points.toFixed(0)} />
      <StatCell label="Wins"   value={champion.wins} />
    </div>
  );
}
