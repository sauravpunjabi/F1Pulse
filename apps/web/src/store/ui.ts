import { create } from 'zustand';
import type { LiveStatusDto, WeekendStatus } from '@/lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// F1Pulse UI Store
//
// Holds only ephemeral UI state that needs to be shared across the component
// tree. Server data lives in React Query — don't duplicate it here.
//
// Slices:
//   season   — current year and live race status
//   era      — active era in History Mode (null = live season)
//   nav      — sidebar / mobile nav open state
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

interface SeasonSlice {
  /** The year currently being viewed (defaults to current live season). */
  currentYear: number;
  setCurrentYear: (year: number) => void;

  /** Cached live status from /api/live/status — set by the LenisProvider or
   *  a top-level query so all consumers read the same snapshot. */
  liveStatus: LiveStatusDto | null;
  setLiveStatus: (status: LiveStatusDto) => void;

  /** Convenience getter — true when a session is actively running. */
  isLive: boolean;
}

interface EraSlice {
  /**
   * The era year the user has navigated to in History Mode.
   * null = the user is on the live season view (default).
   *
   * TODO: When History Mode lands (the 1967 black-and-white → colour
   * transition), set this from the scroll position controller.
   */
  activeEra: number | null;
  setActiveEra: (year: number | null) => void;
}

interface NavSlice {
  /** Whether the sidebar / mobile nav drawer is open. */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

type UIStore = SeasonSlice & EraSlice & NavSlice;

// ── Store ─────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStore>((set) => ({
  // ── Season ──────────────────────────────────────────────────────────────────
  currentYear: new Date().getFullYear(),
  setCurrentYear: (year) => set({ currentYear: year }),

  liveStatus: null,
  setLiveStatus: (status) =>
    set({
      liveStatus: status,
      isLive: isLiveSession(status.status),
    }),

  isLive: false,

  // ── Era ─────────────────────────────────────────────────────────────────────
  activeEra: null,
  setActiveEra: (year) => set({ activeEra: year }),

  // ── Nav ─────────────────────────────────────────────────────────────────────
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

// ── Selectors (stable references — avoids re-renders from inline selectors) ───

export const selectCurrentYear   = (s: UIStore) => s.currentYear;
export const selectLiveStatus    = (s: UIStore) => s.liveStatus;
export const selectIsLive        = (s: UIStore) => s.isLive;
export const selectActiveEra     = (s: UIStore) => s.activeEra;
export const selectSidebarOpen   = (s: UIStore) => s.sidebarOpen;
export const selectToggleSidebar = (s: UIStore) => s.toggleSidebar;

// ── Helpers ───────────────────────────────────────────────────────────────────

function isLiveSession(status: WeekendStatus): boolean {
  return (
    status === 'practice' ||
    status === 'qualifying' ||
    status === 'sprint' ||
    status === 'race-live'
  );
}
