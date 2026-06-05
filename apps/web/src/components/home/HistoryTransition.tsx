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
  const carCanvasRef = useRef<HTMLDivElement>(null);

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

      // 2. Transition background color from matte black to off-white
      tl.to(container, {
        backgroundColor: '#F5F4F0',
        color: '#111111',
        ease: 'power2.inOut',
        duration: 1,
      }, 0);

      // 3. Fade out the classic Genesis text
      tl.to(
        textRetroRef.current,
        {
          opacity: 0,
          y: -30,
          pointerEvents: 'none',
          ease: 'power2.in',
          duration: 0.6,
        },
        0
      );

      // 4. Fade out the vintage car image
      tl.to(
        imageRef.current,
        {
          opacity: 0,
          scale: 0.95,
          ease: 'power2.in',
          duration: 0.6,
        },
        0
      );

      // 5. Fade in the modern hybrid realities text & 3D car backdrop
      tl.fromTo(
        textModernRef.current,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          ease: 'power2.out',
          duration: 0.8,
        },
        '-=0.2'
      );
      tl.fromTo(
        carCanvasRef.current,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          ease: 'power2.out',
          duration: 0.8,
        },
        '<'
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={triggerRef} className="relative w-full overflow-hidden bg-[#111111]">
      <div
        ref={containerRef}
        className="relative flex h-screen w-full flex-col justify-between px-8 py-4 sm:py-6 md:py-10 text-[#FAF9F6] transition-colors duration-300 md:px-16 overflow-hidden"
      >
        {/* Fullscreen Static F1 Car Background */}
        <div
          ref={carCanvasRef}
          className="absolute inset-0 w-full h-full z-0 opacity-0 pointer-events-none flex items-center justify-center"
        >
          <div className="relative w-full max-w-5xl aspect-[16/7] px-4">
            <Image
              src="/modern_f1_car.png"
              alt="Modern Formula 1 Car"
              fill
              className="object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>

        {/* Skewed Parallax curtains sweeping across */}
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
        <div className="z-10 hidden sm:flex flex-row justify-between items-center w-full font-mono text-[0.6rem] uppercase tracking-[0.3em] opacity-40">
          <span>Scene 03 // Transition</span>
          <span>Archival Chronology Entering</span>
        </div>

        {/* Centered Transition Content */}
        <div className="z-10 flex flex-1 flex-col items-center justify-center relative w-full max-w-7xl mx-auto">
          {/* Text 2: Classic Serif (Fades in on dark background) */}
          <div
            ref={textRetroRef}
            className="absolute text-center max-w-3xl px-4 z-10 opacity-100 pointer-events-auto"
            style={{ pointerEvents: 'auto' }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent font-semibold">
              The Genesis
            </span>
            <h3 className="mt-3 font-serif italic text-4xl sm:text-5xl md:text-7xl leading-tight font-medium text-current">
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
            className="relative w-full max-w-2xl aspect-[16/8] overflow-hidden border border-white/10 bg-zinc-900 opacity-85"
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

        {/* Modern Layout (Fullscreen overlay) */}
        <div
          ref={textModernRef}
          className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between items-center w-full max-w-7xl mx-auto px-8 py-10 md:py-14 z-20 opacity-0 pointer-events-none"
        >
          {/* Top Header Statement */}
          <div className="text-center mt-6 md:mt-8">
            <span className="font-mono text-[0.6rem] sm:text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              The Present
            </span>
            <h3 className="mt-1 font-display font-black uppercase text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-none text-current">
              High-Speed Hybrid Realities
            </h3>
            <p className="mt-2 font-sans text-[0.7rem] sm:text-xs md:text-sm text-silver max-w-xl mx-auto leading-relaxed">
              Every millisecond tracked, every watt calculated. A digital showcase of aerodynamic perfection.
            </p>
          </div>

          {/* Middle Spacer to let the 3D car show fullscreen */}
          <div className="flex-1 min-h-[100px] pointer-events-none" />


        </div>
        </div>
    </div>
  );
}
