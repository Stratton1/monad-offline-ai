/**
 * DispatchChat.tsx
 * Purpose: Current affairs chat with interests, digest, and good-news lane
 * Usage: News curation and daily digest generation
 * Privacy: All data stored locally, no external news sources
 * Note: This is a placeholder for future offline news aggregation
 */

import { useState, useEffect } from 'react';
import ChatScaffold from '../shared/ChatScaffold';
import MessageList from '../../components/MessageList';
import Composer from '../shared/Composer';
import InterestOnboarding from './InterestOnboarding';
import DailyDigest from './DailyDigest';
import { useChatStore, type ChatMessage } from '../../store/chatStore';
import {
  saveConversation,
  exportPDF,
  exportRTF,
  openChatFolder,
  getTagsForChat,
} from '../../lib/library';
import { sendMessage } from '../../utils/api';

// Simple UUID generator
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface DispatchChatProps {
  chatId: string;
  title: string;
  onTitleChange: (title: string) => void;
}

const MIN_INTERESTS = 10;

export default function DispatchChat({
  chatId,
  title,
  onTitleChange,
}: DispatchChatProps) {
  const { messages, addMessage, setLoading, isLoading } = useChatStore();
  const [interests, setInterests] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'deepdives' | 'goodnews' | 'brief'>('daily');
  const [sourcesBias, setSourcesBias] = useState<'mainstream' | 'balanced' | 'independent'>('balanced');

  // Check if interests are set
  useEffect(() => {
    const saved = localStorage.getItem(`monad_dispatch_interests_${chatId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= MIN_INTERESTS) {
        setInterests(parsed);
        setShowOnboarding(false);
      }
    }
  }, [chatId]);

  const handleInterestsComplete = (selectedInterests: string[]) => {
    if (selectedInterests.length >= MIN_INTERESTS) {
      setInterests(selectedInterests);
      setShowOnboarding(false);
      localStorage.setItem(
        `monad_dispatch_interests_${chatId}`,
        JSON.stringify(selectedInterests)
      );
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
      const response = await sendMessage(content);
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response || 'No response generated',
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('[DispatchChat] Generation error:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
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
        title: title || 'Dispatch Conversation',
        tags: getTagsForChat(chatId),
        messages,
        startedAt: messages[0]?.timestamp.getTime() || Date.now(),
        endedAt: Date.now(),
      });
    } catch (error) {
      console.error('[DispatchChat] Save failed:', error);
      throw error;
    }
  };

  const handleExport = async (format: 'pdf' | 'rtf') => {
    try {
      const conversation = {
        id: chatId,
        chatId,
        title: title || 'Dispatch Conversation',
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
      console.error('[DispatchChat] Export failed:', error);
      throw error;
    }
  };

  const handleOpenFolder = async () => {
    try {
      await openChatFolder(chatId);
    } catch (error) {
      console.error('[DispatchChat] Failed to open folder:', error);
    }
  };

  // Show onboarding if interests not set
  if (showOnboarding) {
    return (
      <InterestOnboarding
        minInterests={MIN_INTERESTS}
        onComplete={handleInterestsComplete}
      />
    );
  }

  return (
    <ChatScaffold
      chatId={chatId}
      chatType="dispatch"
      title={title}
      onTitleChange={onTitleChange}
      onSave={handleSave}
      onExport={handleExport}
      onOpenFolder={handleOpenFolder}
      showSave={true}
      showExport={true}
      showFolder={true}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-2 px-6 py-3 bg-slate-800/30 border-b border-slate-700/50">
          {[
            { id: 'daily', label: 'Daily' },
            { id: 'deepdives', label: 'Deep Dives' },
            { id: 'goodnews', label: 'Good News' },
            { id: 'brief', label: 'My Brief' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sources Bias Slider */}
        <div className="px-6 py-3 bg-slate-800/20 border-b border-slate-700/30">
          <label className="text-xs font-medium mb-2 block">Source Bias</label>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">Mainstream</span>
            <input
              type="range"
              min={0}
              max={2}
              value={sourcesBias === 'mainstream' ? 0 : sourcesBias === 'balanced' ? 1 : 2}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSourcesBias(
                  val === 0 ? 'mainstream' : val === 1 ? 'balanced' : 'independent'
                );
              }}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-400">Independent</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'goodnews' && (
          <div className="flex-1 overflow-y-auto p-6">
            <DailyDigest
              type="goodnews"
              interests={interests}
              sourcesBias={sourcesBias}
            />
          </div>
        )}

        {activeTab === 'daily' && (
          <>
            <MessageList messages={messages} />
            <Composer
              onSend={handleSend}
              disabled={isLoading}
              isLoading={isLoading}
              placeholder="Ask about current affairs..."
            />
          </>
        )}

        {activeTab === 'deepdives' && (
          <>
            <MessageList messages={messages} />
            <Composer
              onSend={handleSend}
              disabled={isLoading}
              isLoading={isLoading}
              placeholder="Request a deep dive analysis..."
            />
          </>
        )}

        {activeTab === 'brief' && (
          <>
            <MessageList messages={messages} />
            <Composer
              onSend={handleSend}
              disabled={isLoading}
              isLoading={isLoading}
              placeholder="Generate your personalized brief..."
            />
          </>
        )}
      </div>
    </ChatScaffold>
  );
}
