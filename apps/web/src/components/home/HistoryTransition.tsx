'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function HistoryTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const textModernRef = useRef<HTMLDivElement>(null);
  const textRetroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const curtain1Ref = useRef<HTMLDivElement>(null);
  const curtain2Ref = useRef<HTMLDivElement>(null);
  const curtain3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const trigger = triggerRef.current;
    if (!container || !trigger) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger,
          start: 'top top',
          end: '+=150%',
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      // 1. Sweep diagonal curtains across the screen to wipe out the old and reveal the new
      tl.fromTo(
        [curtain1Ref.current, curtain2Ref.current, curtain3Ref.current],
        { x: '-130%' },
        {
          x: '150vw',
          stagger: 0.12,
          ease: 'power2.inOut',
          duration: 1.2,
        },
        0
      );

      // 2. Transition background color from off-white to matte black
      tl.to(container, {
        backgroundColor: '#111111',
        color: '#FAF9F6',
        ease: 'power2.inOut',
        duration: 1,
      }, 0);

      // 3. Crossfade typography (modern sans-serif out, classic serif in)
      tl.to(
        textModernRef.current,
        {
          opacity: 0,
          y: -30,
          ease: 'power2.in',
          duration: 0.6,
        },
        '-=0.8'
      );

      tl.fromTo(
        textRetroRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          duration: 0.8,
        },
        '-=0.3'
      );

      // 4. Fade and scale in the archival vintage car image
      tl.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 0.85,
          scale: 1,
          ease: 'power2.out',
          duration: 0.8,
        },
        '-=0.4'
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    // We wrap in a container that allows the ScrollTrigger to pin while scrolling down the parent track
    <div ref={triggerRef} className="relative w-full overflow-hidden bg-off-white">
      <div
        ref={containerRef}
        className="relative flex h-screen w-full flex-col justify-between px-8 py-16 text-black transition-colors duration-300 md:px-16 overflow-hidden"
      >
        {/* Skewed Parallax curtains sweeping across */}
        {/* Skewed Parallax curtains sweeping across (z-20 and opaque for a physical transition wipe) */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div
            ref={curtain1Ref}
            className="absolute top-[-20%] left-0 h-[140%] w-[60vw] bg-accent"
            style={{ transform: 'skewX(-16deg)', willChange: 'transform' }}
          />
          <div
            ref={curtain2Ref}
            className="absolute top-[-20%] left-0 h-[140%] w-[55vw] bg-zinc-800"
            style={{ transform: 'skewX(-16deg)', willChange: 'transform' }}
          />
          <div
            ref={curtain3Ref}
            className="absolute top-[-20%] left-0 h-[140%] w-[70vw] bg-[#111111]"
            style={{ transform: 'skewX(-16deg)', willChange: 'transform' }}
          />
        </div>

        {/* Top Info */}
        <div className="z-10 flex justify-between font-mono text-[0.6rem] uppercase tracking-[0.3em] opacity-40">
          <span>Scene 03 // Transition</span>
          <span>Archival Chronology Entering</span>
        </div>

        {/* Centered Transition Content */}
        <div className="z-10 flex flex-1 flex-col items-center justify-center relative w-full max-w-5xl mx-auto">
          {/* Text 1: Modern Sans-Serif */}
          <div
            ref={textModernRef}
            className="absolute text-center max-w-2xl px-4"
          >
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              The Present
            </span>
            <h3 className="mt-3 font-display font-black uppercase text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none">
              High-Speed Hybrid Realities
            </h3>
            <p className="mt-4 font-sans text-sm text-silver max-w-md mx-auto leading-relaxed">
              Every millisecond tracked, every watt calculated. A digital showcase of aerodynamic perfection.
            </p>
          </div>

          {/* Text 2: Classic Serif (Fades in on dark background) */}
          <div
            ref={textRetroRef}
            className="absolute text-center max-w-3xl px-4 opacity-0 pointer-events-none select-none"
            style={{ pointerEvents: 'auto' }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent font-semibold">
              The Genesis
            </span>
            <h3 className="mt-3 font-serif italic text-4xl sm:text-5xl md:text-7xl leading-tight font-medium">
              Steel, Canvas & Courage
            </h3>
            <p className="mt-6 font-serif text-base text-silver/80 max-w-lg mx-auto italic leading-relaxed">
              “To drive is to feel the machine breathing beneath you. No telemetry, no sensors. Just the road and the ticking watch.”
            </p>
          </div>
        </div>

        {/* Bottom Vintage Image: fades in as we turn black */}
        <div className="z-10 flex flex-col items-center gap-6 w-full">
          <div
            ref={imageRef}
            className="relative w-full max-w-2xl aspect-[16/8] overflow-hidden border border-white/10 bg-zinc-900 opacity-0"
          >
            <Image
              src="/vintage_f1_car.png"
              alt="Vintage Formula One Racing Car"
              fill
              className="object-cover grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-4 font-mono text-[0.5rem] uppercase tracking-[0.3em] text-white/50">
              Archival Plate // 1950 British Grand Prix — Silverstone
            </div>
          </div>
          
          <div className="w-full flex justify-between font-mono text-[0.6rem] uppercase tracking-[0.2em] opacity-40">
            <span>Palette: Graphite / Monochromatic</span>
            <span>Est. 1950</span>
          </div>
        </div>
      </div>
    </div>
  );
}
