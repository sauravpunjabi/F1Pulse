'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const ThreeCarScene = dynamic(() => import('./ThreeCarScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center font-mono text-[0.65rem] text-accent tracking-[0.25em] animate-pulse uppercase bg-transparent">
      INITIALIZING 3D GRAPHICS DEVICE...
    </div>
  ),
});

const SPEC_DATA = [
  { label: 'Total output', target: 1000, suffix: 'BHP', dec: 0 },
  { label: 'Electric split', target: 50, suffix: '%', dec: 0 },
  { label: 'Top speed', target: 360, suffix: 'KM/H', dec: 0 },
  { label: 'Peak cornering', target: 5.0, suffix: 'G', dec: 1 },
  { label: 'Min. weight', target: 798, suffix: 'KG', dec: 0 },
];

export function CurrentEraCinematic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleWordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const floorRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const specRefs = useRef<(HTMLDivElement | null)[]>([]);
  const specValuesRef = useRef<(HTMLSpanElement | null)[]>([]);
  const hintRef = useRef<HTMLSpanElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);

  // Simulated Telemetry Jitter for the 3D Hotspots
  const [telemetry, setTelemetry] = useState<Record<string, number>>({
    'front-wing': 1980,
    'venturi-tunnels': -40,
    'rear-wing': 0.32,
    'sidepod-intake': 195,
    'airbox': 4.0,
    'mgu-k': 75.5,
  });

  useEffect(() => {
    const VALUE_RANGES: Record<string, [number, number]> = {
      'front-wing': [1800, 2200],
      'venturi-tunnels': [-45, -35],
      'rear-wing': [0.120, 0.450],
      'sidepod-intake': [180, 220],
      'airbox': [3.80, 4.20],
      'mgu-k': [40, 95],
    };

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
    if (!container) return;

    let rafId: number;
    let dashOffset = 0;

    // Helper functions matching broadsheet.js
    const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
    const sub = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
    const eo = (t: number) => 1 - Math.pow(1 - t, 3);
    const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const tick = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      
      const total = rect.height - vh;
      const p = clamp(-rect.top / Math.max(1, total));

      const isVisible = rect.bottom > 0 && rect.top < vh;
      const motionScale = (window as any).__f1motion ?? 0.8;

      // 1. Flow Venturi tunnels dash offset when visible
      if (isVisible) {
        dashOffset -= (0.6 + motionScale * 2);
        const tunnelPaths = container.querySelectorAll('.ce__tun');
        tunnelPaths.forEach((pathEl) => {
          (pathEl as SVGPathElement).style.strokeDashoffset = `${dashOffset.toFixed(1)}`;
        });
      }

      // ── YEAR (Slow parallax drift, scale and fade out late) ────────────────
      if (yearRef.current) {
        const yp = eo(sub(p, 0, 1));
        const scale = (1 + p * 0.18).toFixed(3);
        const opacity = (0.05 * (1 - sub(p, 0.55, 0.85) * 0.6)).toFixed(3);
        yearRef.current.style.transform = `translate3d(0, ${(-yp * 80).toFixed(1)}px, 0) scale(${scale})`;
        yearRef.current.style.opacity = opacity;
      }

      // ── TITLE (Staggered words rise, then lift and fade) ───────────────────
      const tIn = sub(p, 0.02, 0.22);
      const tOut = sub(p, 0.30, 0.46);

      titleWordsRef.current.forEach((wordEl, i) => {
        if (!wordEl) return;
        const delay = i * 0.12;
        const enter = eo(clamp((tIn - delay) / (1 - delay)));
        const y = (1 - enter) * 118 - tOut * 60;
        wordEl.style.transform = `translate3d(0, ${y.toFixed(1)}%, 0)`;
      });

      if (titleRef.current) {
        titleRef.current.style.opacity = (1 - tOut).toFixed(3);
      }

      if (eyebrowRef.current) {
        eyebrowRef.current.style.transform = `translate3d(0, ${(-tOut * 40).toFixed(1)}px, 0)`;
        eyebrowRef.current.style.opacity = (1 - tOut * 0.6).toFixed(3);
      }

      if (hintRef.current) {
        hintRef.current.style.opacity = (0.5 * (1 - sub(p, 0.05, 0.16))).toFixed(3);
      }

      // ── CAR (Clip-reveal from center, scale settle, parallax slide) ────────
      const tCar = sub(p, 0.18, 0.50);
      if (carRef.current) {
        const open = eio(tCar);
        const inset = (1 - open) * 50; // 50% -> 0%
        carRef.current.style.clipPath = `inset(0 ${inset.toFixed(2)}% 0 ${inset.toFixed(2)}%)`;
        
        const slide = (1 - open) * 70;
        const scale = 1.16 - open * 0.16;
        carRef.current.style.transform = `translate3d(calc(-50% + ${slide.toFixed(1)}px), calc(-50% - 50px), 0) scale(${scale.toFixed(3)})`;
      }

      // ── SCAN LINE (Sweeping red line) ──────────────────────────────────────
      if (scanRef.current) {
        const s = sub(p, 0.20, 0.46);
        scanRef.current.style.left = `${(s * 100).toFixed(1)}%`;
        scanRef.current.style.opacity = Math.sin(clamp(s) * Math.PI).toFixed(3);
      }

      // ── VENTURI FLOOR TUNNELS ──────────────────────────────────────────────
      const tFloor = sub(p, 0.42, 0.62);
      if (floorRef.current) {
        floorRef.current.style.opacity = eo(tFloor).toFixed(3);
        floorRef.current.style.transform = `translate3d(-50%, ${(-10 - eo(tFloor) * 50).toFixed(1)}px, 0)`;
      }

      // ── CAPTION ────────────────────────────────────────────────────────────
      const tCap = sub(p, 0.54, 0.70);
      if (captionRef.current) {
        captionRef.current.style.opacity = eo(tCap).toFixed(3);
        captionRef.current.style.transform = `translate3d(0, ${((1 - eo(tCap)) * 40).toFixed(1)}px, 0)`;
      }

      // ── SPECS (Staggered rise and numeric counting) ───────────────────────
      specRefs.current.forEach((specEl, i) => {
        if (!specEl) return;
        const startVal = 0.58 + i * 0.055;
        const endVal = startVal + 0.16;
        const t = sub(p, startVal, endVal);
        const e = eo(t);

        specEl.style.opacity = e.toFixed(3);
        specEl.style.transform = `translate3d(0, ${((1 - e) * 46).toFixed(1)}px, 0)`;

        const valSpan = specValuesRef.current[i];
        const data = SPEC_DATA[i];
        if (valSpan && data) {
          const animatedValue = (data.target * e).toFixed(data.dec);
          valSpan.textContent = animatedValue;
        }
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const p = clamp(-rect.top / Math.max(1, total));
      setScrollProgress(p);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="ce" id="ground" ref={containerRef}>
      <div className="ce__pin" ref={pinRef}>
        {/* Year graphic */}
        <div className="ce__year" ref={yearRef}>
          2026
        </div>

        {/* Section Header */}
        <div className="ce__eyebrow" ref={eyebrowRef}>
          <span className="broadsheet-label broadsheet-label--accent">02 / The Current Era</span>
          <span className="broadsheet-label">2026 Regulations · Ground Effect</span>
        </div>

        {/* Title */}
        <h2 className="ce__title" ref={titleRef}>
          <span className="ln">
            <span
              ref={(el) => {
                titleWordsRef.current[0] = el;
              }}
              className="inline-block"
            >
              The
            </span>
          </span>
          <span className="ln">
            <span
              ref={(el) => {
                titleWordsRef.current[1] = el;
              }}
              className="inline-block"
            >
              Current
            </span>
          </span>
          <span className="ln">
            <span
              ref={(el) => {
                titleWordsRef.current[2] = el;
              }}
              className="inline-block italic text-accent font-serif font-medium"
            >
              Era
            </span>
          </span>
        </h2>

        {/* SVG Flowing Venturi Tunnels */}
        <div className="ce__floor" ref={floorRef}>
          <svg viewBox="0 0 1080 230" preserveAspectRatio="none" aria-hidden="true">
            <path
              className="ce__tunglow"
              d="M40,20 C300,10 780,10 1040,20 L980,150 C760,120 320,120 100,150 Z"
            />
            <path className="ce__tun" d="M70,30 C320,20 760,20 1010,30" />
            <path className="ce__tun" d="M95,70 C340,60 740,60 985,70" />
            <path className="ce__tun" d="M120,110 C360,100 720,100 960,110" />
            <g className="ce__vec" style={{ color: 'var(--broadsheet-accent)' }}>
              <line x1="300" y1="0" x2="300" y2="44" />
              <line x1="540" y1="0" x2="540" y2="44" />
              <line x1="780" y1="0" x2="780" y2="44" />
            </g>
            <text className="ce__floorlab" x="40" y="200">
              Venturi floor — low pressure
            </text>
            <text className="ce__floorlab" x="1040" y="200" textAnchor="end">
              Downforce ↓
            </text>
          </svg>
        </div>

        {/* Interactive 3D Model with Clip Reveal */}
        <div className="ce__car" ref={carRef} style={{ pointerEvents: 'auto' }}>
          <ThreeCarScene hoveredGroup={null} telemetry={telemetry} scrollProgress={scrollProgress} />
          <div className="ce__scan" ref={scanRef} style={{ pointerEvents: 'none' }} />
        </div>

        {/* Caption */}
        <div className="ce__caption" ref={captionRef}>
          <h3>Underbody tunnels glue the car to the road.</h3>
          <p>
            Cleaner air, closer racing — wings give way to the floor. 1.6L turbo-hybrid, 100%
            sustainable fuel.
          </p>
        </div>

        {/* Specifications specs with dynamic count-up */}
        <div className="ce__specs" ref={captionRef}>
          {SPEC_DATA.map((spec, i) => (
            <div
              key={i}
              className="ce__spec"
              ref={(el) => {
                specRefs.current[i] = el;
              }}
            >
              <div className="v broadsheet-tnum">
                <span
                  ref={(el) => {
                    specValuesRef.current[i] = el;
                  }}
                >
                  0
                </span>
                <small>{spec.suffix}</small>
              </div>
              <div className="l broadsheet-label">{spec.label}</div>
            </div>
          ))}
        </div>

        {/* Hint */}
        <span className="ce__hint broadsheet-label" ref={hintRef}>
          Scroll — the era builds ↓
        </span>
      </div>
    </section>
  );
}
