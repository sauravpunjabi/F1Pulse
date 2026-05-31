import type { Config } from 'tailwindcss';

/**
 * F1Pulse — Tailwind token system.
 *
 * Every value here is wired to a CSS variable defined in globals.css.
 * Add visual values in globals.css ONLY — never hardcode hex/rem here.
 *
 * TODO: When the typography day arrives, add a `fontSize` scale here that
 *       matches the chosen type system (display / headline / body / label).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      /* ── Palette ─────────────────────────────────────────────────────────── */
      colors: {
        black:    'var(--color-black)',
        void:     'var(--color-void)',
        graphite: 'var(--color-graphite)',
        iron:     'var(--color-iron)',
        steel:    'var(--color-steel)',
        silver:   'var(--color-silver)',
        'off-white': 'var(--color-off-white)',
        red:      'var(--color-red)',
        'red-dim':'var(--color-red-dim)',

        /* Semantic aliases — prefer these in component code */
        bg:           'var(--bg)',
        surface:      'var(--bg-surface)',
        elevated:     'var(--bg-elevated)',
        border:       'var(--border)',
        primary:      'var(--text-primary)',
        secondary:    'var(--text-secondary)',
        accent:       'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
      },

      /* ── Typography ─────────────────────────────────────────────────────── */
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],    // TODO: cinematic display face
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],// TODO: body / UI face
        mono:    ['var(--font-mono)', 'Courier New', 'monospace'],// TODO: telemetry / data face
      },

      /* ── Motion ─────────────────────────────────────────────────────────── */
      transitionDuration: {
        fast:     'var(--duration-fast)',     // 150ms — micro-interactions
        measured: 'var(--duration-measured)', // 280ms — standard transitions
        slow:     'var(--duration-slow)',     // 600ms — page reveals
      },
      transitionTimingFunction: {
        'ease-out-expo': 'var(--ease-out)',
        'ease-in-expo':  'var(--ease-in)',
        'ease-inout':    'var(--ease-inout)',
      },
      animationDuration: {
        fast:     'var(--duration-fast)',
        measured: 'var(--duration-measured)',
        slow:     'var(--duration-slow)',
      },

      /* ── Z-index scale ───────────────────────────────────────────────────── */
      zIndex: {
        base:       'var(--z-base)',
        raised:     'var(--z-raised)',
        overlay:    'var(--z-overlay)',
        modal:      'var(--z-modal)',
        nav:        'var(--z-nav)',
        atmosphere: 'var(--z-atmosphere)',
      },
    },
  },
  plugins: [],
};

export default config;
