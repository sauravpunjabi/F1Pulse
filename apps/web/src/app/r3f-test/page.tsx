'use client';

import { useState } from 'react';
import { AtmosphereLayer } from '@/components/r3f/AtmosphereLayer';

/**
 * /r3f-test — development-only validation route.
 *
 * What to verify:
 *   1. The dark particle field renders behind the text.
 *   2. Scrolling moves the camera (particles shift perspective).
 *   3. Click "Unmount scene" → scene disappears.
 *   4. Click "Mount scene" → scene reappears.
 *   5. Open DevTools console → no WebGL disposal errors on unmount.
 *   6. GPU memory stays stable across mount/unmount cycles (Memory tab).
 */
export default function R3FTestPage() {
  const [mounted, setMounted] = useState(true);

  return (
    <>
      {/* 3D atmosphere layer — fixed, z-index -1 */}
      {mounted && <AtmosphereLayer />}

      {/* ── Scrollable page content ───────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 0,
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Sticky controls */}
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 10,
            display: 'flex',
            gap: 12,
          }}
        >
          <button
            onClick={() => setMounted((v) => !v)}
            style={{
              padding: '8px 16px',
              background: mounted ? 'rgba(220,38,38,0.8)' : 'rgba(22,163,74,0.8)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
            }}
          >
            {mounted ? 'Unmount scene' : 'Mount scene'}
          </button>
          <span
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 6,
              fontSize: 13,
              backdropFilter: 'blur(8px)',
            }}
          >
            Scene: {mounted ? '● live' : '○ unmounted'}
          </span>
        </div>

        {/* Hero */}
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 48px',
            maxWidth: 720,
          }}
        >
          <p style={{ fontSize: 11, letterSpacing: '0.2em', opacity: 0.4, marginBottom: 16 }}>
            R3F ATMOSPHERE — INTEGRATION TEST
          </p>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            Scroll to move<br />the camera.
          </h1>
          <p style={{ marginTop: 24, opacity: 0.5, lineHeight: 1.7 }}>
            The particle field drifts in the background. As you scroll,
            GSAP eases the camera forward and upward. Film grain and very
            subtle bloom run in the postprocessing stack.
          </p>
          <p style={{ marginTop: 8, opacity: 0.3, fontSize: 14 }}>↓ scroll down</p>
        </section>

        {/* Mid section — camera should have moved */}
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 48px',
            maxWidth: 720,
          }}
        >
          <p style={{ fontSize: 11, letterSpacing: '0.2em', opacity: 0.4, marginBottom: 16 }}>
            MID SECTION
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 600, margin: 0 }}>
            Camera dived forward.
          </h2>
          <p style={{ marginTop: 20, opacity: 0.5, lineHeight: 1.7 }}>
            You should be noticeably closer to the particle layer now.
            Open DevTools → Performance → Memory and toggle mount/unmount
            to verify geometry and material disposal.
          </p>
        </section>

        {/* Bottom section — full scroll progress */}
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 48px',
            maxWidth: 720,
          }}
        >
          <p style={{ fontSize: 11, letterSpacing: '0.2em', opacity: 0.4, marginBottom: 16 }}>
            BOTTOM — 100% PROGRESS
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 600, margin: 0 }}>
            Full camera travel complete.
          </h2>
          <p style={{ marginTop: 20, opacity: 0.5, lineHeight: 1.7 }}>
            Camera is now at z ≈ 2, y ≈ 1.5.
            Unmount/remount above — console should stay clean.
          </p>
        </section>
      </div>
    </>
  );
}
