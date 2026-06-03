'use client';

/**
 * EraContext — tracks which historical era is in the viewport as scroll advances.
 *
 * Consumed by:
 *   - EraChapter     → reports when it enters/leaves focus
 *   - ColorTransitionScene → writes colorProgress as the 1967 scrub advances
 *   - EraChapter CSS → reads activeChapter to decide which theme vars to expose
 *
 * Kept flat and minimal so ScrollTrigger callbacks (which fire 60× per second
 * during scrubs) only touch two primitive state values.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface EraContextValue {
  /** 0-indexed chapter currently centred in the viewport (0 = Birth of F1). */
  activeChapter: number;
  /**
   * 0 → full B&W (pre-1967), 1 → full colour (post-1967).
   * Driven by GSAP scrub inside ColorTransitionScene.
   */
  colorProgress: number;
  setActiveChapter: (index: number) => void;
  setColorProgress: (progress: number) => void;
}

const EraContext = createContext<EraContextValue | null>(null);

export function useEraContext(): EraContextValue {
  const ctx = useContext(EraContext);
  if (!ctx) throw new Error('useEraContext must be used within EraContextProvider');
  return ctx;
}

export function EraContextProvider({ children }: { children: ReactNode }) {
  const [activeChapter, setActiveChapterRaw] = useState(0);
  const [colorProgress, setColorProgressRaw] = useState(0);

  const setActiveChapter = useCallback((i: number) => setActiveChapterRaw(i), []);
  const setColorProgress = useCallback((p: number) => setColorProgressRaw(p), []);

  const value = useMemo(
    () => ({ activeChapter, colorProgress, setActiveChapter, setColorProgress }),
    [activeChapter, colorProgress, setActiveChapter, setColorProgress],
  );

  return <EraContext.Provider value={value}>{children}</EraContext.Provider>;
}
