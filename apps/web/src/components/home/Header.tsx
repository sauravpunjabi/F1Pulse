'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function Header() {
  const [activeSection, setActiveSection] = useState<string>('top');

  useEffect(() => {
    // 1. Scroll progress tracker driving the CSS variable `--prog`
    const handleScroll = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const maxScroll = Math.max(1, docHeight - vh);
      const prog = Math.min(1, Math.max(0, sy / maxScroll));
      document.documentElement.style.setProperty('--prog', prog.toFixed(4));

      // 2. Active section highlights
      const sections = ['race', 'eras'];
      let currentSection = 'top';
      for (const secId of sections) {
        const el = document.getElementById(secId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= vh * 0.4 && rect.bottom >= vh * 0.4) {
            currentSection = secId;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once initially
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Scroll indicator bar at the very top of the viewport */}
      <div className="scrollbar" aria-hidden="true" />

      {/* Top navigation chrome */}
      <header className="chrome">
        <a className="chrome__brand" href="#top">
          <span className="dot" />
          F1PULSE
        </a>
        <nav className="chrome__nav">
          <a href="#race" className={activeSection === 'race' ? 'text-accent opacity-100 font-medium' : ''}>
            Season
          </a>
          <Link href="/drivers">
            Drivers
          </Link>
          <Link href="/history">
            History
          </Link>
          <a className="cta" href="#race">
            2026 ↗
          </a>
        </nav>
      </header>
    </>
  );
}
