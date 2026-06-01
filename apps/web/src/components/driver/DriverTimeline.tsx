'use client';

/**
 * DriverTimeline — horizontally scrolling career timeline.
 *
 * Mechanic:
 *   - A full-width track is pinned while the user scrolls vertically.
 *   - GSAP ScrollTrigger translates the inner strip horizontally.
 *   - Each season = one node: year, team, final position, points.
 *   - Championship seasons get a gold accent class (.timeline-champion).
 *   - Animated connector lines between nodes.
 *
 * Data: DriverCareerSeasonDto[] from /api/driver/:driverId/seasons
 * Motion: measured Framer preset on node entrance, GSAP on horizontal travel.
 *
 * TODO: Tune scroll distance (scrub multiplier) once real data volume is known.
 * TODO: Add circuit country dots to the track line once circuit data is accessible.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type DriverCareerSeasonDto } from '@/lib/api';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeUpVariants } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface DriverTimelineProps {
  seasons: DriverCareerSeasonDto[];
}

function nodeLabel(position: number): string {
  if (position === 1) return '1st';
  if (position === 2) return '2nd';
  if (position === 3) return '3rd';
  return `${position}th`;
}

export function DriverTimeline({ seasons }: DriverTimelineProps) {
  const reduced = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const wrapper = wrapperRef.current;
    const strip = stripRef.current;
    if (!wrapper || !strip) return;

    const ctx = gsap.context(() => {
      const scrollWidth = strip.scrollWidth - strip.clientWidth;
      if (scrollWidth <= 0) return;

      gsap.to(strip, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          pin: true,
          scrub: 1,
          // TODO: end distance — "+=<scrollWidth>" gives 1:1 feel; tune multiplier.
          end: () => `+=${scrollWidth}`,
          invalidateOnRefresh: true,
        },
      });
    }, wrapper);

    return () => ctx.revert();
  }, [reduced, seasons]);

  const childVariants = fadeUpVariants('measured', 20);

  return (
    <section
      className="driver-timeline relative overflow-hidden"
      aria-label="Career timeline"
    >
      {/* Section heading — outside the pinned wrapper so it scrolls normally. */}
      <div className="px-6 pb-8 pt-24 md:px-16">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/40">
          Career Seasons
        </p>
      </div>

      {/* Pinned scroll container. */}
      <div ref={wrapperRef} className="relative">
        {/* Horizontal strip. */}
        <div
          ref={stripRef}
          className="flex items-stretch gap-0 will-change-transform"
          style={{ width: 'max-content', paddingLeft: '6rem', paddingRight: '6rem' }}
        >
          {seasons.map((s, i) => {
            const isChampion = s.position === 1;
            const team = s.constructors[0]?.name ?? '—';

            return (
              <motion.div
                key={`${s.season}-${i}`}
                className={[
                  'timeline-node relative flex flex-col justify-end',
                  'min-w-[160px] border-l border-white/10 pl-6 pr-8 py-10',
                  // TODO: championship year visual — gold accent text + marker
                  isChampion ? 'timeline-champion' : '',
                ].join(' ')}
                variants={childVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {/* Connector line decorative dot. */}
                <div
                  className={[
                    'absolute -left-[3px] top-10 h-1.5 w-1.5 rounded-full',
                    // TODO: champion dot gets gold color via .timeline-champion parent
                    isChampion
                      ? 'timeline-champion-dot bg-yellow-400'
                      : 'bg-white/30',
                  ].join(' ')}
                  aria-hidden="true"
                />

                <span
                  className={[
                    'mb-1 font-mono text-[0.65rem] uppercase tracking-widest',
                    isChampion ? 'text-yellow-400' : 'text-white/30',
                  ].join(' ')}
                >
                  {/* Championship marker */}
                  {isChampion ? 'Champion' : nodeLabel(s.position)}
                </span>

                <span className="font-display text-4xl font-black leading-none text-white">
                  {s.season}
                </span>

                <span className="mt-2 text-sm text-white/50">{team}</span>

                <div className="mt-3 flex gap-3 font-mono text-xs text-white/40">
                  <span>{s.wins}W</span>
                  {/* TODO: format points to locale string */}
                  <span>{s.points} pts</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Horizontal track line spanning the full strip. */}
        <div
          className="pointer-events-none absolute left-0 top-10 h-px bg-white/10"
          style={{ width: '200%' }} // overflows — clipped by overflow-hidden on section
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
