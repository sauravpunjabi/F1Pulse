import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Atmosphere } from '@/components/Atmosphere';
import { QueryProvider } from '@/providers/QueryProvider';
import { LenisProvider } from '@/providers/LenisProvider';

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'F1Pulse',
    template: '%s — F1Pulse',
  },
  description:
    'A cinematic Formula 1 experience — the living 2026 season and the full history, 1950 to today.',
  // TODO: Add OG/Twitter card images when the design identity is locked.
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Deliberately not setting maximumScale=1 — never disable user zoom (a11y).
  themeColor: '#050505',
};

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body>
        {/*
         * Provider order matters:
         *   QueryProvider  — must be outermost client boundary so all hooks
         *                    can reach it, including those inside LenisProvider.
         *   LenisProvider  — initialises the RAF loop; should wrap the full
         *                    page content so scroll events are captured.
         *   Atmosphere     — fixed overlay, no layout impact; placed after
         *                    providers so it composes last in the stacking ctx.
         */}
        <QueryProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </QueryProvider>

        {/*
         * Atmosphere sits outside the scroll container intentionally.
         * Fixed positioning + z-atmosphere ensures it layers above everything
         * without participating in Lenis's scroll tree.
         */}
        <Atmosphere />
      </body>
    </html>
  );
}
