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
  setUnlocked: (unlocked: boolean) => void;
  setJournalUnlocked: (unlocked: boolean) => void;
  setActiveChat: (chatId: string | null) => void;
  setTheme: (theme: AppSessionState['theme']) => void;
  setShowSearch: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
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
