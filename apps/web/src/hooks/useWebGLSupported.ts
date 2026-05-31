'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true once the browser confirms WebGL is available.
 * Starts as false (safe for SSR / first render), flips to true after mount if
 * a WebGL context can actually be created. If WebGL is blocked or absent the
 * value stays false and the 3D layer never mounts.
 */
export function useWebGLSupported(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const ctx =
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl');
      setSupported(ctx !== null);
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
