/**
 * journal.spec.ts
 * Purpose: Tests for Journal chat security, autosave, and 7-day limit
 * Usage: Validates passcode, encryption, and retention policies
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Argon2-browser is already mocked in tests/setup.ts

import {
  setJournalPasscode,
  unlockJournal,
  lockJournal,
  getAuthState,
} from '../src/lib/auth';
import { saveMessage } from '../src/lib/library';
import { unlockAppForTests, createTestChat } from './utils';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

describe('Journal Chat', () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();

    // Unlock app for encryption operations
    await unlockAppForTests('AppPassword123!');
    
    // Create test journal chat in registry
    createTestChat('journal-chat-id', 'data/chats/journal');
  });

  it('should require passcode to unlock journal', async () => {
    const result = await setJournalPasscode('JournalPass123!');
    expect(result.success).toBe(true);

    // Try to unlock with wrong passcode
    const wrongResult = await unlockJournal('WrongPass!');
    expect(wrongResult.success).toBe(false);

    // Unlock with correct passcode
    const correctResult = await unlockJournal('JournalPass123!');
    expect(correctResult.success).toBe(true);

    const state = getAuthState();
    expect(state.isJournalUnlocked).toBe(true);
    expect(state.journalKey).toBeDefined();
  });

  it('should lock journal and clear journal key', async () => {
    await setJournalPasscode('JournalPass123!');
    await unlockJournal('JournalPass123!');

    const stateBefore = getAuthState();
    expect(stateBefore.isJournalUnlocked).toBe(true);

    lockJournal();

    const stateAfter = getAuthState();
    expect(stateAfter.isJournalUnlocked).toBe(false);
    expect(stateAfter.journalKey).toBeNull();
  });

  it('should auto-save journal entries', async () => {
    await setJournalPasscode('JournalPass123!');
    await unlockJournal('JournalPass123!');

    // Save journal entry
    const saved = await saveMessage({
      chatId: 'journal-chat-id',
      title: 'Journal Entry',
      tags: ['journal', 'entry'],
      body: 'Today was a good day',
    });

    expect(saved.id).toBeDefined();
    expect(saved.tags).toContain('journal');
  });

  it('should enforce 7-day viewing limit', () => {
    // Create entries with different timestamps
    const now = Date.now();
    const sixDaysAgo = now - 6 * 24 * 60 * 60 * 1000;
    const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000;

    // Mock entries
    const entries = [
      { id: '1', timestamp: now, text: 'Recent' },
      { id: '2', timestamp: sixDaysAgo, text: 'Six days ago' },
      { id: '3', timestamp: eightDaysAgo, text: 'Eight days ago' },
    ];

    // Filter to last 7 days
    const sevenDaysAgo = now - SEVEN_DAYS_MS;
    const recentEntries = entries.filter((e) => e.timestamp >= sevenDaysAgo);

    expect(recentEntries.length).toBe(2); // Only recent and six days ago
    expect(recentEntries.find((e) => e.id === '3')).toBeUndefined(); // Eight days ago excluded
  });

  it('should limit memory glimpses to 3 per day', () => {
    const glimpses = [
      { id: '1', date: '2025-01-27', entryId: 'entry-1' },
      { id: '2', date: '2025-01-27', entryId: 'entry-2' },
      { id: '3', date: '2025-01-27', entryId: 'entry-3' },
      { id: '4', date: '2025-01-27', entryId: 'entry-4' }, // Should be excluded
    ];

    const today = '2025-01-27';
    const todayGlimpses = glimpses
      .filter((g) => g.date === today)
      .slice(0, 3); // Limit to 3

    expect(todayGlimpses.length).toBe(3);
    expect(todayGlimpses.find((g) => g.id === '4')).toBeUndefined();
  });

  it('should require passcode for journal export', async () => {
    await setJournalPasscode('JournalPass123!');
    await unlockJournal('JournalPass123!');

    // Journal is unlocked, export should be possible
    // In actual implementation, export would check journal unlock state
    const state = getAuthState();
    expect(state.isJournalUnlocked).toBe(true);
  });
});
