'use client';

import { useEffect, useRef, useState } from 'react';

export function PersistentLane() {
  const pctRef = useRef<HTMLSpanElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const maxScroll = Math.max(1, docHeight - vh);
      const prog = Math.min(1, Math.max(0, sy / maxScroll));

      // Update percent text
      if (pctRef.current) {
        pctRef.current.textContent = Math.round(prog * 100).toString();
      }

      // Update trail width
      if (trailRef.current) {
        trailRef.current.style.width = `calc((100% - var(--broadsheet-pad) * 2) * ${prog})`;
      }

      // Update car position
      if (carRef.current) {
        carRef.current.style.transform = `translateX(calc((100vw - var(--broadsheet-pad) * 2 - 96px) * ${prog}))`;
      }

      // Hide lane when entering the horizontal scroll timeline at the bottom of the page
      const erasSection = document.getElementById('eras');
      if (erasSection) {
        const r = erasSection.getBoundingClientRect();
        // Hide if the top of the horizontal timeline is within the viewport
        const engaged = r.top <= 10 && r.bottom >= vh - 10;
        document.body.classList.toggle('eras-active', engaged);
        setIsVisible(!engaged);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial run

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      className="lane" 
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div className="lane__lab">Lap progress</div>
      <div className="lane__pct">
        <span ref={pctRef}>0</span>%
      </div>
      <div className="lane__track" />
      <div className="lane__trail" ref={trailRef} />
      <div className="lane__car" ref={carRef}>
        <svg className="carfig" viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg">
          <g fill="currentColor">
            <rect x="64" y="104" width="362" height="20" rx="7" />
            <path d="M96 98 L150 64 L252 64 L300 86 L308 98 L308 112 L96 112 Z" />
            <path d="M156 66 L172 38 L190 38 L198 66 Z" />
            <path d="M206 66 L216 54 L246 54 L254 66 Z" />
            <ellipse cx="231" cy="56" rx="12" ry="11" />
            <path d="M250 66 L300 84 L444 116 L444 126 L250 96 Z" />
            <rect x="10" y="42" width="62" height="13" rx="3" />
            <rect x="16" y="42" width="14" height="62" rx="2" />
            <rect x="22" y="92" width="56" height="9" rx="3" />
            <rect x="398" y="118" width="74" height="11" rx="3" />
            <rect x="458" y="96" width="13" height="34" rx="2" />
          </g>
          <path className="ca" d="M414 117 L472 105 L472 113 L414 124 Z" />
          <path className="ca" d="M392 110 L444 121 L444 126 L392 116 Z" opacity="0.9" />
          <rect className="ca" x="10" y="42" width="62" height="4" rx="2" />
          <path d="M198 64 C198 44 232 40 256 56" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <g>
            <circle cx="128" cy="98" r="42" fill="currentColor" />
            <circle cx="128" cy="98" r="14" className="ca" />
            <circle cx="128" cy="98" r="5.5" fill="var(--broadsheet-paper)" />
            <circle cx="372" cy="98" r="42" fill="currentColor" />
            <circle cx="372" cy="98" r="14" className="ca" />
            <circle cx="372" cy="98" r="5.5" fill="var(--broadsheet-paper)" />
          </g>
        </svg>
      </div>
    </div>
  );
}
