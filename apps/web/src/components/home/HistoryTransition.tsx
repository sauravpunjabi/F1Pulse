'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import dynamic from 'next/dynamic';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Dynamically load the client-only 3D car scene
const ThreeCarScene = dynamic(() => import('./ThreeCarScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[220px] flex items-center justify-center bg-[#0a0a0b] border border-white/5 rounded-xl shadow-2xl">
      <div className="font-mono text-[0.65rem] text-accent tracking-[0.25em] animate-pulse uppercase">
        INITIALIZING GRAPHICS DEVICE...
      </div>
    </div>
  ),
});

const VALUE_RANGES: Record<string, [number, number]> = {
  'front-wing': [1800, 2200],
  'venturi-tunnels': [-45, -35],
  'rear-wing': [0.120, 0.450],
  'sidepod-intake': [180, 220],
  'airbox': [3.80, 4.20],
  'mgu-k': [40, 95],
};

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

  const [hoveredGroup, setHoveredGroup] = useState<'aero' | 'engine' | null>(null);



  // Simulated Telemetry Jitter
  const [telemetry, setTelemetry] = useState<Record<string, number>>({
    'front-wing': 1980,
    'venturi-tunnels': -40,
    'rear-wing': 0.32,
    'sidepod-intake': 195,
    'airbox': 4.0,
    'mgu-k': 75.5,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const next = { ...prev };
        Object.keys(VALUE_RANGES).forEach((id) => {
          const range = VALUE_RANGES[id];
          if (!range) return;
          const current = prev[id] ?? range[0];
          const delta = (range[1] - range[0]) * 0.08 * (Math.random() - 0.5);
          let val = current + delta;
          if (val < range[0]) val = range[0];
          if (val > range[1]) val = range[1];
          next[id] = parseFloat(val.toFixed(id === 'rear-wing' || id === 'airbox' ? 3 : 1));
        });
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

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
        {/* Fullscreen 3D Car Scene Background */}
        <div
          ref={carCanvasRef}
          className="absolute inset-0 w-full h-full z-0 opacity-0 pointer-events-none"
        >
          <ThreeCarScene hoveredGroup={hoveredGroup} telemetry={telemetry} />
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
          {/* Text 1: Modern Sans-Serif overlay with 3D Car visible behind */}
          <div
            ref={textModernRef}
            className="absolute inset-0 flex flex-col justify-between items-center w-full max-w-7xl mx-auto px-4 py-12 z-20 opacity-0 pointer-events-none"
          >
            <div className="text-center mt-4">
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
            <div className="flex-1 min-h-[120px] pointer-events-none" />

            {/* Unified Specs Dashboard Panel */}
            <div className="w-full max-w-4xl bg-black/85 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl pointer-events-auto flex flex-col md:flex-row gap-6 md:gap-10 transition-all duration-300">
              {/* Aerodynamics Column */}
              <div
                onMouseEnter={() => setHoveredGroup('aero')}
                onMouseLeave={() => setHoveredGroup(null)}
                className="flex-1 border-t border-white/15 pt-3 text-left transition-all duration-300 hover:border-[#27F4D2] group/spec cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] font-bold text-zinc-400 group-hover/spec:text-[#27F4D2] transition-colors">
                    Aerodynamics
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#27F4D2] shadow-[0_0_8px_#27F4D2] animate-pulse" />
                </div>
                <p className="mt-2 text-[0.7rem] sm:text-xs text-zinc-300 group-hover/spec:text-white transition-colors leading-relaxed">
                  Under-car Venturi tunnels create intense low pressure, pulling the chassis flat to the track surface and minimizing turbulent wake for closer wheel-to-wheel racing.
                </p>
              </div>

              {/* Power Unit Column */}
              <div
                onMouseEnter={() => setHoveredGroup('engine')}
                onMouseLeave={() => setHoveredGroup(null)}
                className="flex-1 border-t border-white/15 pt-3 text-left transition-all duration-300 hover:border-[#C9201A] group/spec cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] font-bold text-zinc-400 group-hover/spec:text-[#C9201A] transition-colors">
                    Power Unit
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#C9201A] shadow-[0_0_8px_#C9201A] animate-pulse" />
                </div>
                <p className="mt-2 text-[0.7rem] sm:text-xs text-zinc-300 group-hover/spec:text-white transition-colors leading-relaxed">
                  Hyper-efficient hybrid twin-turbochargers pairing thermal energy recovery (MGU-H) and kinetic energy harvesting (MGU-K) systems to deploy over 1000 horsepower.
                </p>
              </div>
            </div>
          </div>

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
        </div>
    </div>
  );
}
