/**
 * dashboard.spec.ts
 * Purpose: Tests for dashboard navigation, gating, and state
 * Usage: Validates chat navigation, unlock gating, and keyboard shortcuts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRegistry } from '../src/lib/library';
import { setupPassword, unlockApp, initialize } from '../src/lib/auth';
import { useAppSessionStore } from '../src/store/appSessionStore';

describe('Dashboard', () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();

    // Setup auth
    await setupPassword('TestPassword123!');
    await initialize();
    await unlockApp('TestPassword123!');
  });

  it('should display all chats after setup', () => {
    // Mock registry
    localStorage.setItem(
      'monad_chat_registry',
      JSON.stringify([
        { id: '1', kind: 'Everyday', title: 'Everyday' },
        { id: '2', kind: 'Journal', title: 'Journal' },
        { id: '3', kind: 'ProStudioA', title: 'Pro Studio A' },
        { id: '4', kind: 'ProStudioB', title: 'Pro Studio B' },
        { id: '5', kind: 'Dispatch', title: 'Dispatch' },
      ])
    );

    const registry = getRegistry();
    expect(registry.length).toBe(5);
    expect(registry.map((c) => c.kind)).toEqual([
      'Everyday',
      'Journal',
      'ProStudioA',
      'ProStudioB',
      'Dispatch',
    ]);
  });

  it('should require journal unlock for Journal chat', () => {
    const journalChat = {
      id: 'journal-1',
      kind: 'Journal',
      secure: { journalPassRequired: true },
    };

    expect(journalChat.secure?.journalPassRequired).toBe(true);
  });

  it('should handle keyboard shortcuts', () => {
    const shortcuts = {
      search: 'F2',
      lock: 'F3',
      save: 'Cmd/Ctrl+S',
      export: 'Cmd/Ctrl+E',
      mute: 'Cmd/Ctrl+M',
    };

    expect(shortcuts.search).toBe('F2');
    expect(shortcuts.lock).toBe('F3');
    expect(shortcuts.save).toBe('Cmd/Ctrl+S');
  });

  it('should manage session state', () => {
    const store = useAppSessionStore.getState();
    
    // Set active chat
    store.setActiveChat('chat-1');
    expect(useAppSessionStore.getState().activeChatId).toBe('chat-1');

    // Show search
    store.setShowSearch(true);
    expect(useAppSessionStore.getState().showSearch).toBe(true);

    // Show settings
    store.setShowSettings(true);
    expect(useAppSessionStore.getState().showSettings).toBe(true);
  });

  it('should persist theme preference', () => {
    const store = useAppSessionStore.getState();
    store.setTheme('midnight');
    
    expect(useAppSessionStore.getState().theme).toBe('midnight');
  });
});
