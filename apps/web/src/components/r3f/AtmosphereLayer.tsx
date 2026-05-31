'use client';

import dynamic from 'next/dynamic';
import { useWebGLSupported } from '@/hooks/useWebGLSupported';

/**
 * Dynamically loads the R3F scene on the client only (ssr: false).
 * If WebGL is unavailable the component renders nothing — the rest of
 * the UI functions normally without the 3D layer.
 *
 * Place this anywhere in the React tree that has access to LenisProvider
 * (the scroll camera hook reads lenis from context). The root layout is
 * the canonical home.
 */

const Scene = dynamic(() => import('./AtmosphereScene'), { ssr: false });

export function AtmosphereLayer() {
  const webGLSupported = useWebGLSupported();
  if (!webGLSupported) return null;
  return <Scene />;
}
