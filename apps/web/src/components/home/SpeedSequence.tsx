'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function SpeedSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowLeftRef = useRef<HTMLDivElement>(null);
  const rowRightRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Horizontal scrub animations
      gsap.fromTo(
        rowLeftRef.current,
        { xPercent: 10 },
        {
          xPercent: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      );

      gsap.fromTo(
        rowRightRef.current,
        { xPercent: -30 },
        {
          xPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      );

      // Parallax effect on the image
      gsap.fromTo(
        imageContainerRef.current,
        { yPercent: -15, scale: 1.1 },
        {
          yPercent: 15,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="theme-dark relative h-[60vh] w-full overflow-hidden bg-black flex flex-col justify-center items-center select-none"
    >
      {/* ── Background Telemetry Image with Parallax ──────────────────────── */}
      <div 
        ref={imageContainerRef}
        className="absolute inset-0 z-0 opacity-25 w-full h-[120%] pointer-events-none"
      >
        <Image
          src="/telemetry_speed.png"
          alt="Speed Telemetry Graphic"
          fill
          className="object-cover object-center"
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />

      {/* ── Red Accents and Tech Details ────────────────────────────────────── */}
      <div className="absolute top-6 left-8 z-20 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-accent flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
        <span>Telemetry Scan // Active Speed Index</span>
      </div>
      
      <div className="absolute bottom-6 right-8 z-20 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-silver flex gap-4">
        <span>GRID_REF: 42.109 / 88.0</span>
        <span>LATERAL_G: 4.8G</span>
      </div>

      {/* ── Moving Telemetry Text Rows (The Speed Strip) ───────────────────── */}
      <div className="z-10 flex flex-col gap-4 sm:gap-6 w-full overflow-hidden">
        {/* Row 1: Leftward moving text */}
        <div className="whitespace-nowrap overflow-visible py-2">
          <div
            ref={rowLeftRef}
            className="inline-block font-display font-black text-6xl sm:text-8xl md:text-9xl uppercase tracking-tighter text-white/5"
            style={{ fontSize: 'clamp(50px, 8vw, 150px)' }}
          >
            DRS ACTIVE // GEAR 8 // 342 KM/H // RPM 12500 // DRS ACTIVE // GEAR 8 // 342 KM/H // RPM 12500
          </div>
        </div>

        {/* Row 2: Rightward moving text */}
        <div className="whitespace-nowrap overflow-visible py-2">
          <div
            ref={rowRightRef}
            className="inline-block font-display font-black text-6xl sm:text-8xl md:text-9xl uppercase tracking-tighter text-accent/15"
            style={{ fontSize: 'clamp(50px, 8vw, 150px)' }}
          >
            1:12.434 LAP DELTA // SECTOR 3 PURPLE // THROTTLE 100% // 1:12.434 LAP DELTA // SECTOR 3 PURPLE
          </div>
        </div>
      </div>

      {/* Technical Frame Borders */}
      <div className="absolute top-0 inset-x-8 h-[1px] bg-steel/30 z-20" />
      <div className="absolute bottom-0 inset-x-8 h-[1px] bg-steel/30 z-20" />
    </div>
  );
}
