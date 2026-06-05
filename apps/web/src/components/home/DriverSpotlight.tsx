'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface StatProps {
  value: number;
  label: string;
  suffix?: string;
}

function RollingStat({ value, label, suffix = '' }: StatProps) {
  const [currentVal, setCurrentVal] = useState<number>(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef<boolean>(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            let startTimestamp: number | null = null;
            const duration = 1500;

            const step = (timestamp: number) => {
              if (!startTimestamp) startTimestamp = timestamp;
              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
              const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
              setCurrentVal(parseFloat((value * easeProgress).toFixed(0)));
              
              if (progress < 1) {
                requestAnimationFrame(step);
              }
            };
            requestAnimationFrame(step);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="spot__stat" ref={elementRef}>
      <div className="v broadsheet-tnum">
        {currentVal}
        {suffix}
      </div>
      <div className="l broadsheet-label">{label}</div>
    </div>
  );
}

export function DriverSpotlight() {
  const plateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = plateRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('in');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="sec" id="driver" style={{ borderTop: '1px solid var(--broadsheet-rule)' }}>
      <div className="sec__head">
        <span className="sec__num">03</span>
        <span className="broadsheet-label">/ From the Pantheon</span>
      </div>

      <div className="spot">
        {/* Spotlight Plate / Image */}
        <div className="spot__plate" ref={plateRef} data-reveal data-clip>
          <Image
            src="/senna_portrait.png"
            alt="Ayrton Senna Dossier Portrait"
            fill
            className="grayscale contrast-125 hover:scale-105 transition-transform duration-700 object-cover"
          />
          <span className="spot__tag">Ayrton Senna · 1960–1994</span>
        </div>

        {/* Spotlight Dossier Text */}
        <div data-reveal className="in">
          <h2 className="spot__name">Senna</h2>
          
          <p className="spot__quote">
            “If you no longer go for a gap that exists, you are no longer a racing driver.”
          </p>

          <div className="spot__stats">
            <RollingStat value={3} label="World Titles" suffix="×" />
            <RollingStat value={65} label="Pole Positions" />
            <RollingStat value={41} label="Grand Prix Wins" />
          </div>

          <Link href="/driver/senna" className="broadsheet-link">
            Read the dossier →
          </Link>
        </div>
      </div>
    </section>
  );
}
