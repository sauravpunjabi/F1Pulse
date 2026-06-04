'use client';

import { useEffect, useRef, useState } from 'react';

export function GlobalCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [speed, setSpeed] = useState(0);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    // Avoid rendering on server or touch devices
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setMousePos({ x, y });

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = 
          target.closest('a') || 
          target.closest('button') || 
          target.closest('[role="button"]') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('textarea') ||
          window.getComputedStyle(target).cursor === 'pointer';
        
        setIsHoveringInteractive(!!isInteractive);
      }

      const now = performance.now();
      const dt = now - lastMousePos.current.time;
      if (dt > 10) {
        const dx = x - lastMousePos.current.x;
        const dy = y - lastMousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Instantaneous speed scaled to KM/H
        const targetSpeed = Math.min(340, Math.round((dist / dt) * 1200));
        setSpeed((prev) => Math.round(prev + (targetSpeed - prev) * 0.3));
        lastMousePos.current = { x, y, time: now };
      }
    };

    const handleMouseLeave = () => {
      setSpeed(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Inject CSS to hide default cursor globally
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // Slowly decay speed back to 0 when mouse is stationary
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setSpeed((prev) => {
        if (prev <= 0) return 0;
        const decay = Math.max(1, Math.round(prev * 0.15));
        return prev - decay;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[99999] flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 will-change-transform transition-transform duration-150 ease-out"
      style={{
        left: `${mousePos.x}px`,
        top: `${mousePos.y}px`,
        transform: `translate(-50%, -50%) scale(${isHoveringInteractive ? 1.35 : 1.0})`,
      }}
    >
      {/* Custom SVG Reticle */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg 
          width="44" 
          height="44" 
          viewBox="0 0 44 44" 
          className="text-accent animate-[spin_25s_linear_infinite] opacity-90 transition-colors duration-300"
        >
          <circle cx="22" cy="22" r="16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 6" />
          <line x1="22" y1="1" x2="22" y2="4" stroke="currentColor" strokeWidth="1.5" />
          <line x1="22" y1="40" x2="22" y2="43" stroke="currentColor" strokeWidth="1.5" />
          <line x1="1" y1="22" x2="4" y2="22" stroke="currentColor" strokeWidth="1.5" />
          <line x1="40" y1="22" x2="43" y2="22" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {/* Center Red Dot */}
        <div className="absolute w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_6px_#C9201A]" />
      </div>
      {/* Speed Text */}
      <div className="mt-1 font-mono text-[0.55rem] text-accent font-bold tracking-widest bg-black/75 px-1.5 py-0.5 rounded shadow-lg border border-white/5">
        {speed} KM/H
      </div>
    </div>
  );
}
