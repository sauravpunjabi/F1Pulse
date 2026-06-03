'use client';

/**
 * EraChapter — generic pinned chapter scaffold for /history.
 *
 * Each of the 7 era chapters uses this component.  It handles:
 *   - ScrollTrigger pin (section sticks for `pinDuration` px of scroll)
 *   - Reporting the chapter's index to EraContext when it enters/leaves focus
 *   - Injecting era-specific CSS custom properties onto the section element
 *     so descendant text / motion tokens can read them
 *
 * Content is passed as `children`.  Day 16: structural scaffold only.
 * Day 17: rich content fills in via the children prop of each call-site.
 *
 * Theme vars injected per chapter:
 *   --era-accent        accent colour for the era (text, lines)
 *   --era-grain         grain opacity override (stays at body level)
 *   --motion-duration   CSS duration in ms — shortens in modern eras
 */

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEraContext } from '@/contexts/EraContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export interface EraChapterConfig {
  /** 0-indexed position in the 7-chapter sequence. */
  index: number;
  /** Short year range label — e.g. "1950 – 1959". */
  yearRange: string;
  /** Chapter title — e.g. "Birth of F1". */
  title: string;
  /** Chapter number displayed as large ordinal — e.g. "01". */
  chapterNumber: string;
  /** CSS custom properties injected onto the section element. */
  themeVars: Record<string, string>;
  /** Scroll distance (px) the section is pinned for. Default 900. */
  pinDuration?: number;
  children?: ReactNode;
}

export function EraChapter({
  index,
  yearRange,
  title,
  chapterNumber,
  themeVars,
  pinDuration = 900,
  children,
}: EraChapterConfig) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { setActiveChapter } = useEraContext();

  useEffect(() => {
    if (!sectionRef.current || reduced) return;

    const ctx = gsap.context(() => {
      // Pin the section for pinDuration px of scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${pinDuration}`,
        pin: true,
        anticipatePin: 1,
      });

      // Track active chapter for EraContext
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter:     () => setActiveChapter(index),
        onEnterBack: () => setActiveChapter(index),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced, index, pinDuration, setActiveChapter]);

  // Build inline CSS vars for era theming
  const style: CSSProperties = Object.fromEntries(
    Object.entries(themeVars).map(([k, v]) => [k, v]),
  ) as CSSProperties;

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg)]"
      style={style}
      aria-label={`Era chapter: ${title}`}
    >
      {/* ── Era identifier grid ────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-8 pt-8 md:px-16">
        <span
          className="font-mono text-[0.55rem] uppercase tracking-[0.3em]"
          style={{ color: 'var(--era-accent, var(--text-secondary))' }}
        >
          {yearRange}
        </span>
        <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-white/20">
          Chapter {chapterNumber}
        </span>
      </div>

      {/* ── Chapter title — large display ─────────────────────────────────── */}
      <div className="relative z-10 px-6 text-center">
        <p
          className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.35em]"
          style={{ color: 'var(--era-accent, var(--text-secondary))' }}
        >
          {yearRange}
        </p>
        <h2
          className="font-display font-black uppercase leading-none tracking-[-0.025em] text-white"
          style={{ fontSize: 'clamp(2.2rem, 7vw, 7rem)' }}
        >
          {title}
        </h2>

        {/* Day 17 content slot */}
        {children ? (
          <div className="mt-16">{children}</div>
        ) : (
          <p className="mt-10 font-mono text-[0.55rem] uppercase tracking-[0.25em] text-white/15">
            Content · Day 17
          </p>
        )}
      </div>

      {/* ── Bottom accent line ────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 h-px w-full"
        style={{ background: 'var(--era-accent, var(--border))', opacity: 0.2 }}
      />
    </section>
  );
}
