'use client';

/**
 * React Query provider — must be a Client Component because QueryClientProvider
 * uses React context. Kept minimal: one QueryClient per browser session.
 *
 * Default config:
 *   staleTime 0     — individual hooks set their own stale times (see api.ts)
 *   retry    2      — retry failed requests twice before surfacing error
 *   gcTime   5 min  — keep unused cache for 5 min (tanstack v5 default)
 */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        retry: 2,
        refetchOnWindowFocus: false, // tabs flipping shouldn't trigger refetches
      },
    },
  });
}

// Singleton on the server (for RSC prefetch), fresh instance on the client.
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new client so requests don't bleed between users.
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState so the client is stable across re-renders (not recreated on HMR).
  const [client] = useState(() => getQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
