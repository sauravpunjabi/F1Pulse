import type { Metadata } from 'next';
import { EraContextProvider } from '@/contexts/EraContext';
import { HistoryModeActivator } from '@/components/history/HistoryModeActivator';
import { HistoryAtmosphere } from '@/components/history/HistoryAtmosphere';

export const metadata: Metadata = {
  title: 'History Mode',
  description:
    'The full story of Formula One — 1950 to today. Seventy-six seasons, one cinematic journey.',
};

/**
 * History layout — wraps /history/* routes.
 *
 * Renders two client components that transform the global viewport:
 *   HistoryModeActivator  → applies B&W filter + heavy grain to <body>
 *   HistoryAtmosphere     → mounts scanlines + projector-flicker fixed overlays
 *
 * Both revert completely when the user navigates away.
 *
 * EraContextProvider tracks scroll-driven era state for all descendants.
 */
export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <EraContextProvider>
      <HistoryModeActivator />
      <HistoryAtmosphere />
      {children}
    </EraContextProvider>
  );
}
