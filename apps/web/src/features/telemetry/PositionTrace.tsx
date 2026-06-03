'use client';

/**
 * PositionTrace
 *
 * SVG visualization: each driver gets a bezier curve from their grid position
 * (left) to their finishing position (right). Crossed lines = position changes.
 * Leader = #E10600, finishers = white/18, retired = white/6.
 * Draws via pathLength animation triggered on scroll entry.
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { RaceResultDto } from '@/lib/api';

interface PositionTraceProps {
  results: RaceResultDto[];
  raceName: string;
}

const W = 600;
const H = 440;
const PAD_X = 80;
const PAD_Y = 20;
const USABLE_H = H - PAD_Y * 2;

function yForPos(pos: number, total: number): number {
  return PAD_Y + ((pos - 1) / Math.max(total - 1, 1)) * USABLE_H;
}

function isRetiredText(text: string): boolean {
  return ['R', 'D', 'E', 'W', 'N', 'F'].includes(text);
}

export function PositionTrace({ results, raceName }: PositionTraceProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.2 });

  const drivers = results.filter((r) => r.grid > 0 && r.position > 0);
  const total = drivers.length;
  if (total === 0) return null;

  const shouldDraw = inView || reduced;

  return (
    <section
      ref={containerRef}
      className="relative px-6 pb-20 pt-4 md:px-16"
      aria-label="Race position trace"
    >
      <p className="mb-6 font-mono text-[0.52rem] uppercase tracking-[0.32em] text-white/25">
        Position Changes — {raceName}
      </p>

      <div className="relative w-full" style={{ maxWidth: 700 }}>
        <div className="mb-2 flex justify-between px-1">
          <span className="font-mono text-[0.42rem] uppercase tracking-widest text-white/20">Grid</span>
          <span className="font-mono text-[0.42rem] uppercase tracking-widest text-white/20">Finish</span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full"
          aria-hidden="true"
        >
          {/* Start-position dots */}
          {drivers.map((r) => (
            <circle
              key={`g-${r.driver.id}`}
              cx={PAD_X}
              cy={yForPos(r.grid, total)}
              r={2}
              fill="rgba(255,255,255,0.12)"
            />
          ))}

          {/* Finish-position dots */}
          {drivers.map((r) => (
            <circle
              key={`f-${r.driver.id}`}
              cx={W - PAD_X}
              cy={yForPos(r.position, total)}
              r={r.position === 1 ? 3.5 : 2}
              fill={r.position === 1 ? '#E10600' : 'rgba(255,255,255,0.22)'}
            />
          ))}

          {/* Bezier trace lines */}
          {drivers.map((r, i) => {
            const yG = yForPos(r.grid, total);
            const yF = yForPos(r.position, total);
            const mx = W / 2;
            const d = `M ${PAD_X} ${yG} C ${mx} ${yG}, ${mx} ${yF}, ${W - PAD_X} ${yF}`;
            const retired = isRetiredText(r.positionText);
            const color = r.position === 1
              ? '#E10600'
              : retired
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(255,255,255,0.16)';

            return (
              <motion.path
                key={r.driver.id}
                d={d}
                stroke={color}
                strokeWidth={r.position === 1 ? 1.5 : 0.75}
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  shouldDraw
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={
                  reduced
                    ? { duration: 0.01 }
                    : {
                        pathLength: {
                          duration: 1.2,
                          delay: i * 0.035,
                          ease: [0.16, 1, 0.3, 1],
                        },
                        opacity: { duration: 0.2, delay: i * 0.035 },
                      }
                }
              />
            );
          })}

          {/* Driver codes — top 3 finishers only */}
          {drivers.slice(0, 3).map((r) => (
            <text
              key={`lbl-${r.driver.id}`}
              x={W - PAD_X + 10}
              y={yForPos(r.position, total) + 3}
              fill={r.position === 1 ? '#E10600' : 'rgba(255,255,255,0.28)'}
              fontSize={8}
              fontFamily="var(--font-mono, monospace)"
            >
              {r.driver.code ?? r.driver.familyName.slice(0, 3).toUpperCase()}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
