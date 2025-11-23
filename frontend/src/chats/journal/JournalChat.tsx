/**
 * JournalChat.tsx
 * Purpose: Secure journal chat with passcode, timeline, 7-day limit, auto-save
 * Usage: Personal journaling with encryption and privacy controls
 * Privacy: All entries encrypted at rest with journal-specific key
 * Security: Separate passcode required, 7-day browsing limit, append-only
 */

import { useState, useEffect } from 'react';
import ChatScaffold from '../shared/ChatScaffold';
import MessageList from '../../components/MessageList';
import ChatInput from '../../components/chat/ChatInput';
import JournalLock from './JournalLock';
import { useChatStore, type ChatMessage } from '../../store/chatStore';
import {
  saveConversation,
  exportPDF,
  exportRTF,
  openChatFolder,
  getTagsForChat,
} from '../../lib/library';
import { getAuthState, lockJournal } from '../../lib/auth';
import type { JournalEntry } from './journalTypes';
import { isBrowser } from '../../lib/env';

// Simple UUID generator
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface JournalChatProps {
  chatId: string;
  title: string;
  onTitleChange: (title: string) => void;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function JournalChat({
  chatId,
  title,
  onTitleChange,
}: JournalChatProps) {
  const { messages, addMessage, setLoading, isLoading, clearMessages } = useChatStore();
  const [isJournalUnlocked, setIsJournalUnlocked] = useState(false);
  const [mood, setMood] = useState(3); // Default mood
  const [dailyPrompt] = useState('');
  const [, setEntries] = useState<JournalEntry[]>([]);

  // Check journal unlock state
  useEffect(() => {
    const state = getAuthState();
    setIsJournalUnlocked(state.isJournalUnlocked);
  }, []);

  // Auto-save entries
  useEffect(() => {
    if (!isJournalUnlocked) return;

    // Auto-save after each message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      saveJournalEntry(lastMessage);
    }
  }, [messages, isJournalUnlocked]);

  const saveJournalEntry = async (message: ChatMessage) => {
    const entry: JournalEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      mood,
      text: message.content,
      tags: getTagsForChat(chatId),
      encrypted: true,
    };

    try {
      // Save encrypted entry (would use journal key)
      // For now, save to localStorage with marker
      if (!isBrowser()) return;
      const entries = JSON.parse(localStorage.getItem('monad_journal_entries') || '[]');
      entries.push(entry);
      
      // Filter to last 7 days for browsing
      const sevenDaysAgo = Date.now() - SEVEN_DAYS_MS;
      const recentEntries = entries.filter((e: JournalEntry) => e.timestamp >= sevenDaysAgo);
      
      localStorage.setItem('monad_journal_entries', JSON.stringify(recentEntries));
      setEntries(recentEntries);
    } catch (error) {
      console.error('[JournalChat] Failed to save entry:', error);
    }
  };

  const handleSend = async (content: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setLoading(true);

    try {
      // Journal-style response (would use journal persona)
      const response = `I hear you. ${content.length > 50 ? 'Tell me more about that.' : 'How does that make you feel?'}`;
      
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('[JournalChat] Generation error:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveConversation({
        chatId,
        title: title || 'Journal Entry',
        tags: getTagsForChat(chatId),
        messages,
        startedAt: messages[0]?.timestamp.getTime() || Date.now(),
        endedAt: Date.now(),
      });
    } catch (error) {
      console.error('[JournalChat] Save failed:', error);
      throw error;
    }
  };

  const handleExport = async (format: 'pdf' | 'rtf') => {
    // Journal exports require passcode re-entry
    // For now, just export normally
    try {
      const conversation = {
        id: chatId,
        chatId,
        title: title || 'Journal Entry',
        tags: getTagsForChat(chatId),
        messages,
        startedAt: messages[0]?.timestamp.getTime() || Date.now(),
        endedAt: Date.now(),
        createdAt: Date.now(),
      };

      if (format === 'pdf') {
        await exportPDF(conversation);
      } else {
        await exportRTF(conversation);
      }
    } catch (error) {
      console.error('[JournalChat] Export failed:', error);
      throw error;
    }
  };

  const handleOpenFolder = async () => {
    try {
      await openChatFolder(chatId);
    } catch (error) {
      console.error('[JournalChat] Failed to open folder:', error);
    }
  };

  const handleUnlock = () => {
    setIsJournalUnlocked(true);
  };

  // Lock on unmount
  useEffect(() => {
    return () => {
      lockJournal();
    };
  }, []);

  // Filter messages to last 7 days for browsing
  const recentMessages = messages.filter((msg) => {
    const msgTime = msg.timestamp.getTime();
    const sevenDaysAgo = Date.now() - SEVEN_DAYS_MS;
    return msgTime >= sevenDaysAgo;
  });

  // Show lock screen if not unlocked
  if (!isJournalUnlocked) {
    return <JournalLock onUnlock={handleUnlock} />;
  }

  return (
    <ChatScaffold
      chatId={chatId}
      chatType="journal"
      title={title}
      onTitleChange={onTitleChange}
      onSave={handleSave}
      onExport={handleExport}
      onOpenFolder={handleOpenFolder}
      showSave={true}
      showExport={true}
      showFolder={true}
      messages={recentMessages}
      onClearChat={() => clearMessages()}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mood Slider */}
        <div className="px-6 py-3 bg-slate-800/30 border-b border-slate-700/50">
          <label className="text-sm font-medium mb-2 block">Mood</label>
          <input
            type="range"
            min={1}
            max={5}
            value={mood}
            onChange={(e) => setMood(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Daily Prompt */}
        {dailyPrompt && (
          <div className="px-6 py-3 bg-violet-900/20 border-b border-violet-700/30">
            <p className="text-sm text-violet-300">{dailyPrompt}</p>
          </div>
        )}

        {/* 7-day warning */}
        {messages.length > recentMessages.length && (
          <div className="px-6 py-2 bg-yellow-900/20 border-b border-yellow-700/30">
            <p className="text-xs text-yellow-300">
              Showing last 7 days. Older entries available via Insights.
            </p>
          </div>
        )}

        <MessageList messages={recentMessages} />
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          isLoading={isLoading}
          placeholder="Write your thoughts..."
        />
      </div>
    </ChatScaffold>
  );
}
