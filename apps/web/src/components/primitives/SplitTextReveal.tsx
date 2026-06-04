'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface SplitTextRevealProps {
  text: string;
  /** Extra delay in seconds before the animation begins. Defaults to 0. */
  delay?: number;
  /** Delay between each character in seconds. Defaults to 0.02. */
  stagger?: number;
  /** Easing function/preset. Defaults to a premium custom bezier. */
  ease?: number[] | string;
  /** Total animation duration in seconds. Defaults to 0.85. */
  duration?: number;
  className?: string;
}

const DEFAULT_EASE = [0.65, 0.05, 0, 1]; // OFF+BRAND style easing

export function SplitTextReveal({
  text,
  delay = 0,
  stagger = 0.02,
  ease = DEFAULT_EASE,
  duration = 0.85,
  className = '',
}: SplitTextRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  // Split text by space to isolate words
  const words = text.split(' ');
  let charCount = 0;

  return (
    <span className={`inline-block ${className}`} aria-label={text}>
      {words.map((word, wordIndex) => {
        const characters = Array.from(word);
        
        return (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {characters.map((char, charIndex) => {
              const globalIndex = charCount++;
              
              return (
                <span
                  key={charIndex}
                  className="inline-block overflow-hidden align-bottom pb-[0.15em] -mb-[0.15em]"
                >
                  <motion.span
                    className="inline-block origin-left whitespace-pre"
                    initial={{ y: '110%', rotate: 4, skewY: 6, opacity: 0 }}
                    animate={{ y: 0, rotate: 0, skewY: 0, opacity: 1 }}
                    transition={{
                      duration,
                      ease,
                      delay: delay + globalIndex * stagger,
                    }}
                  >
                    {char}
                  </motion.span>
                </span>
              );
            })}
            {/* Word separator space */}
            {wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        );
      })}
    </span>
  );
}
