/**
 * appSessionStore.ts
 * Purpose: Global app session state (unlocked status, active chat, theme)
 * Usage: Used by Dashboard and routing components
 * Privacy: No sensitive data stored
 */

import { create } from 'zustand';

interface AppSessionState {
  isUnlocked: boolean;
  isJournalUnlocked: boolean;
  activeChatId: string | null;
  theme: 'dark' | 'light' | 'midnight' | 'dim';
  showSearch: boolean;
  showSettings: boolean;
  showLibrary: boolean;
  /** Set main app lock state (true when user has unlocked with password) */
  setUnlocked: (unlocked: boolean) => void;
  /** Set journal-specific unlock state (requires journal passcode) */
  setJournalUnlocked: (unlocked: boolean) => void;
  /** Mark which chat is active for routing */
  setActiveChat: (chatId: string | null) => void;
  /** Switch UI theme variant */
  setTheme: (theme: AppSessionState['theme']) => void;
  /** Toggle search panel visibility */
  setShowSearch: (show: boolean) => void;
  /** Toggle settings modal visibility */
  setShowSettings: (show: boolean) => void;
  /** Toggle library panel visibility */
  setShowLibrary: (show: boolean) => void;
}

export const useAppSessionStore = create<AppSessionState>((set) => ({
  isUnlocked: false,
  isJournalUnlocked: false,
  activeChatId: null,
  theme: 'midnight',
  showSearch: false,
  showSettings: false,
  showLibrary: false,
  setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
  setJournalUnlocked: (unlocked) => set({ isJournalUnlocked: unlocked }),
  setActiveChat: (chatId) => set({ activeChatId: chatId }),
  setTheme: (theme) => set({ theme }),
  setShowSearch: (show) => set({ showSearch: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowLibrary: (show) => set({ showLibrary: show }),
}));
