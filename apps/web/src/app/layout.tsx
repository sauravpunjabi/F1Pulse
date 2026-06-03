import type { Metadata, Viewport } from 'next';
import { Saira_Condensed, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Atmosphere } from '@/components/Atmosphere';
import { QueryProvider } from '@/providers/QueryProvider';
import { LenisProvider } from '@/providers/LenisProvider';

// ── Fonts (loaded by Next.js, no layout shift, zero FOUT) ─────────────────────

const sairaCond = Saira_Condensed({
  weight: ['700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'F1Pulse',
    template: '%s — F1Pulse',
  },
  description:
    'A cinematic Formula 1 experience — the living 2026 season and the full history, 1950 to today.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
};

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`bg-black ${sairaCond.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <QueryProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </QueryProvider>
        <Atmosphere />
      </body>
    </html>
  );
}
