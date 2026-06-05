'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import type { SeasonCurrentDto, StandingsDto } from '@/lib/api';
import type { Tempo } from './adaptive';
import { useEffect, useRef } from 'react';

export interface HeroProps {
  season: UseQueryResult<SeasonCurrentDto>;
  drivers: UseQueryResult<StandingsDto>;
  revealed: boolean;
  tempo: Tempo;
}

export function Hero({ season, revealed, tempo }: HeroProps) {
  const nextRace = season.data?.nextRace;
  const raceLabel = nextRace 
    ? `Next up · Round ${nextRace.round.toString().padStart(2, '0')} — ${nextRace.name}`
    : 'Next up · Calendar En Route';

  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const charRefs = useRef<HTMLSpanElement[]>([]);

  // Coordinates for pointer tracking
  const mouseCoords = useRef({ px: -1000, py: -1000, tx: 0, ty: 0 });
  const driftCoords = useRef({ cx: 0, cy: 0 });

  // Array of characters for "FORMULA" and "ONE"
  const formulaChars = Array.from('FORMULA');
  const oneChars = Array.from('ONE');
  const totalCharsCount = formulaChars.length + oneChars.length;

  // Initialize character offsets
  const charOffsets = useRef<{ x: number; y: number; cx: number; cy: number }[]>(
    Array.from({ length: totalCharsCount }, () => ({ x: 0, y: 0, cx: 0, cy: 0 }))
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia('(pointer: coarse)').matches) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      // Hero-level ambient drift target calculations
      const tx = ((x - rect.left) / rect.width - 0.5) * 46;
      const ty = ((y - rect.top) / rect.height - 0.5) * 30;

      mouseCoords.current = { px: x, py: y, tx, ty };
    };

    const handlePointerLeave = () => {
      mouseCoords.current = { px: -1000, py: -1000, tx: 0, ty: 0 };
    };

    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    // Animation Loop
    let rafId: number;
    const tick = () => {
      const { px, py, tx, ty } = mouseCoords.current;

      // 1. Interpolate ambient drift (car and title)
      driftCoords.current.cx += (tx - driftCoords.current.cx) * 0.06;
      driftCoords.current.cy += (ty - driftCoords.current.cy) * 0.06;

      const { cx, cy } = driftCoords.current;
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate3d(${(cx * 1.5).toFixed(1)}px, ${(cy * 1.2).toFixed(1)}px, 0)`;
      }
      if (titleRef.current) {
        titleRef.current.style.transform = `translate3d(${(cx * -0.35).toFixed(1)}px, ${(cy * -0.28).toFixed(1)}px, 0)`;
      }

      // 2. Interpolate magnetic character offsets
      const radius = 180;
      charRefs.current.forEach((charEl, idx) => {
        if (!charEl) return;
        const offsetObj = charOffsets.current[idx];
        if (!offsetObj) return;

        if (px < 0) {
          // pointer left, return to rest
          offsetObj.x = 0;
          offsetObj.y = 0;
        } else {
          const r = charEl.getBoundingClientRect();
          const charCenterX = r.left + r.width / 2;
          const charCenterY = r.top + r.height / 2;
          const dx = charCenterX - px;
          const dy = charCenterY - py;
          const dist = Math.hypot(dx, dy);

          if (dist < radius) {
            const force = Math.max(0, 1 - dist / radius);
            const push = force * force * 46;
            offsetObj.x = (dx / (dist || 1)) * push;
            offsetObj.y = (dy / (dist || 1)) * push;
          } else {
            offsetObj.x = 0;
            offsetObj.y = 0;
          }
        }

        // Apply easing
        offsetObj.cx += (offsetObj.x - offsetObj.cx) * 0.12;
        offsetObj.cy += (offsetObj.y - offsetObj.cy) * 0.12;

        charEl.style.transform = `translate3d(${offsetObj.cx.toFixed(2)}px, ${offsetObj.cy.toFixed(2)}px, 0)`;
      });

      rafId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, [totalCharsCount]);

  return (
    <section
      ref={containerRef}
      className="hero"
      data-tempo={tempo}
      id="top"
    >
      {/* Top editorial border strip */}
      <div className="hero__top">
        <span className="broadsheet-serif-it">A luxury motorsport chronicle</span>
        <span className="broadsheet-label">Vol. I — Editorial Archive · MMXXVI</span>
      </div>

      {/* Main title container */}
      <div className="hero__mid">
        {/* Background drifting F1 car silhouette */}
        <div className="hero__ghost" ref={ghostRef}>
          <svg className="carfig" viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g fill="currentColor">
              {/* floor */}
              <rect x="64" y="104" width="362" height="20" rx="7"/>
              {/* main body / sidepod */}
              <path d="M96 98 L150 64 L252 64 L300 86 L308 98 L308 112 L96 112 Z"/>
              {/* airbox hump */}
              <path d="M156 66 L172 38 L190 38 L198 66 Z"/>
              {/* cockpit surround */}
              <path d="M206 66 L216 54 L246 54 L254 66 Z"/>
              {/* helmet */}
              <ellipse cx="231" cy="56" rx="12" ry="11"/>
              {/* long nose */}
              <path d="M250 66 L300 84 L444 116 L444 126 L250 96 Z"/>
              {/* rear wing top plane */}
              <rect x="10" y="42" width="62" height="13" rx="3"/>
              {/* rear wing endplate */}
              <rect x="16" y="42" width="14" height="62" rx="2"/>
              {/* rear beam wing */}
              <rect x="22" y="92" width="56" height="9" rx="3"/>
              {/* front wing main plane */}
              <rect x="398" y="118" width="74" height="11" rx="3"/>
              {/* front wing endplate */}
              <rect x="458" y="96" width="13" height="34" rx="2"/>
            </g>
            {/* front wing upper flap (accent) */}
            <path className="ca" d="M414 117 L472 105 L472 113 L414 124 Z"/>
            {/* nose accent */}
            <path className="ca" d="M392 110 L444 121 L444 126 L392 116 Z" opacity="0.9"/>
            {/* rear wing accent edge */}
            <rect className="ca" x="10" y="42" width="62" height="4" rx="2"/>
            {/* halo */}
            <path d="M198 64 C198 44 232 40 256 56" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
            {/* wheels */}
            <g>
              <circle cx="128" cy="98" r="42" fill="currentColor"/>
              <circle cx="128" cy="98" r="14" className="ca"/>
              <circle cx="128" cy="98" r="5.5" fill="var(--broadsheet-paper)"/>
              <circle cx="372" cy="98" r="42" fill="currentColor"/>
              <circle cx="372" cy="98" r="14" className="ca"/>
              <circle cx="372" cy="98" r="5.5" fill="var(--broadsheet-paper)"/>
            </g>
          </svg>
        </div>

        {/* Magnetic kinetic title */}
        {revealed && (
          <h1 className="kinetic select-none text-center" ref={titleRef}>
            <span className="block">
              {formulaChars.map((ch, idx) => (
                <span
                  key={idx}
                  className="mchar"
                  ref={(el) => {
                    if (el) charRefs.current[idx] = el;
                  }}
                >
                  {ch}
                </span>
              ))}
            </span>
            <span className="block">
              {oneChars.map((ch, idx) => (
                <span
                  key={idx}
                  className="mchar"
                  ref={(el) => {
                    if (el) charRefs.current[formulaChars.length + idx] = el;
                  }}
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              ))}
            </span>
          </h1>
        )}

        {/* Subtitle info strip */}
        <div className="hero__sub justify-center">
          <span className="ln" />
          <span className="broadsheet-label broadsheet-label--ink">1950 → 2026</span>
          <span className="ln" />
          <span className="broadsheet-serif-it" style={{ color: 'var(--broadsheet-ink-soft)' }}>
            Seventy-six seasons of speed
          </span>
        </div>
      </div>

      {/* Bottom editorial border strip */}
      <div className="hero__bottom">
        <span className="broadsheet-label">{raceLabel}</span>
        <a className="scroll-cue broadsheet-label" href="#race">
          Scroll to begin <span className="arr">↓</span>
        </a>
      </div>
    </section>
  );
}
