'use client';

import { useEffect, useRef } from 'react';

export function SpeedSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowARef = useRef<HTMLDivElement>(null);
  const rowBRef = useRef<HTMLDivElement>(null);
  
  const axRef = useRef<number>(0);
  const bxRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const rowA = rowARef.current;
    const rowB = rowBRef.current;
    if (!container || !rowA || !rowB) return;

    let rafId: number;

    const tick = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const isVisible = rect.top < vh && rect.bottom > 0;
      
      const motionScale = (window as any).__f1motion ?? 0.8;
      // Boost speed if in viewport, otherwise slow drift
      const boost = isVisible ? (1 + motionScale * 2.2) : 0.4;

      // Update Row A (moves left)
      axRef.current -= boost;
      const halfA = rowA.scrollWidth / 2;
      if (-axRef.current >= halfA) {
        axRef.current += halfA;
      }
      rowA.style.transform = `translate3d(${axRef.current.toFixed(1)}px, 0, 0)`;

      // Update Row B (moves right)
      bxRef.current += boost * 0.8;
      const halfB = rowB.scrollWidth / 2;
      if (bxRef.current >= 0) {
        bxRef.current -= halfB;
      }
      rowB.style.transform = `translate3d(${bxRef.current.toFixed(1)}px, 0, 0)`;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  const rowAContent = (
    <>
      <span>Lights Out&nbsp;·&nbsp;Full Throttle&nbsp;·&nbsp;Apex&nbsp;·&nbsp;Slipstream&nbsp;·&nbsp;</span>
      <span>Lights Out&nbsp;·&nbsp;Full Throttle&nbsp;·&nbsp;Apex&nbsp;·&nbsp;Slipstream&nbsp;·&nbsp;</span>
    </>
  );

  const rowBContent = (
    <>
      <span>360 KM/H&nbsp;·&nbsp;1.6L Turbo Hybrid&nbsp;·&nbsp;5.0 G&nbsp;·&nbsp;DRS Open&nbsp;·&nbsp;</span>
      <span>360 KM/H&nbsp;·&nbsp;1.6L Turbo Hybrid&nbsp;·&nbsp;5.0 G&nbsp;·&nbsp;DRS Open&nbsp;·&nbsp;</span>
    </>
  );

  return (
    <section className="speed" id="speed" ref={containerRef}>
      {/* HUD Bar */}
      <div className="speed__hud">
        <span className="broadsheet-label speed__hud-live flex items-center gap-2 text-accent">
          <span className="d w-2 h-2 rounded-full bg-accent animate-pulse" />
          Telemetry stream // live
        </span>
        <span className="broadsheet-label">
          DRS · ENABLED &nbsp;·&nbsp; ERS · HARVEST &nbsp;·&nbsp; 8 GEARS
        </span>
      </div>

      {/* Opposing scrolling text rows */}
      <div className="speed__rows">
        <div className="speed__row" data-row="a">
          <div ref={rowARef} className="inline-block whitespace-nowrap">
            {rowAContent}
            {rowAContent}
          </div>
        </div>
        
        <div className="speed__row speed__row--alt" data-row="b">
          <div ref={rowBRef} className="inline-block whitespace-nowrap">
            {rowBContent}
            {rowBContent}
          </div>
        </div>
      </div>
    </section>
  );
}
