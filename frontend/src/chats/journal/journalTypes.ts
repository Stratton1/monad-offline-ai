/**
 * journalTypes.ts
 * Purpose: Type definitions for journal entries and timeline
 * Usage: Used by JournalChat for entry management
 * Privacy: All data stored locally, encrypted
 */

export interface JournalEntry {
  id: string;
  timestamp: number;
  mood: number; // 1-5 slider
  promptId?: string;
  text: string;
  tags: string[];
  encrypted: boolean;
}

export interface JournalTimelineDay {
  date: string; // YYYY-MM-DD
  entries: JournalEntry[];
  moodAverage: number;
  entryCount: number;
}

export interface MemoryGlimpse {
  id: string;
  entryId: string;
  timestamp: number;
  excerpt: string;
  tags: string[];
  relevance: number; // 0-1
}
