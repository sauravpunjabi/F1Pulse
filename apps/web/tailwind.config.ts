import type { Config } from 'tailwindcss';

/**
 * Scaffold-level Tailwind config.
 * The full cinematic design-token system (scale, motion, color tiers) lands on the
 * design-system day. Kept intentionally minimal here.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Placeholder atmosphere tokens — refined later.
        ink: '#0a0a0b',
        bone: '#f4f1ea',
      },
      fontFamily: {
        // Wired to real cinematic faces on the typography day.
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
