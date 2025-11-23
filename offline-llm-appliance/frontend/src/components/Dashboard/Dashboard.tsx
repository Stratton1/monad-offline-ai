/**
 * Dashboard.tsx
 * Purpose: Main dashboard with chat tiles, routing, and navigation
 * Usage: Primary interface after setup, displays all chats
 * Privacy: All operations local
 */

import { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import ChatTile from './ChatTile';
import HeaderBar from './HeaderBar';
import ActivityIndicator from './ActivityIndicator';
import SettingsModal from './SettingsModal';
import SearchPanel from './SearchPanel';
import ErrorBoundary from '../ErrorBoundary';
import { getRegistry } from '../../lib/library';
import { useAppSessionStore } from '../../store/appSessionStore';
import { getAuthState } from '../../lib/auth';
import type { ChatDescriptor } from '../../chats/registry';
import { loadConfig } from '../../lib/config';

// Lazy load chat components
const EverydayChat = lazy(() => import('../../chats/everyday/EverydayChat'));
const JournalChat = lazy(() => import('../../chats/journal/JournalChat'));
const ProStudioChat = lazy(() => import('../../chats/pro/ProStudioChat'));
const DispatchChat = lazy(() => import('../../chats/dispatch/DispatchChat'));

type View = 'grid' | 'chat';

export default function Dashboard() {
  const config = loadConfig();
  const [view, setView] = useState<View>('grid');
  const [chats, setChats] = useState<ChatDescriptor[]>([]);
  const [activeChat, setActiveChat] = useState<ChatDescriptor | null>(null);
  const [loading, setLoading] = useState(true);
  
  const {
    showSearch,
    showSettings,
    setActiveChat: setActiveChatId,
    setShowSearch,
    setShowSettings,
    setShowLibrary,
  } = useAppSessionStore();

  const authState = getAuthState();

  // Load chat registry
  useEffect(() => {
    const loadChats = () => {
      try {
        const registry = getRegistry();
        if (registry.length > 0) {
          setChats(registry);
        } else {
          // Fallback: create default chats if registry is empty
          console.warn('[Dashboard] Registry empty, creating fallback chats');
        }
        setLoading(false);
      } catch (error) {
        console.error('[Dashboard] Failed to load chats:', error);
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  // Handle chat selection
  const handleChatClick = (descriptor: ChatDescriptor) => {
    // Check if journal is locked
    if (descriptor.kind === 'Journal' && !authState.isJournalUnlocked) {
      // Journal lock handled in JournalChat component
      setActiveChat(descriptor);
      setActiveChatId(descriptor.id);
      setView('chat');
      return;
    }

    setActiveChat(descriptor);
    setActiveChatId(descriptor.id);
    setView('chat');
  };

  // Back to grid handled by clicking outside or header back button

  // Update chat title
  const handleChatTitleChange = (title: string) => {
    if (activeChat) {
      const updated = { ...activeChat, title };
      setActiveChat(updated);
      // Update in registry
      const updatedChats = chats.map((c) =>
        c.id === activeChat.id ? updated : c
      );
      setChats(updatedChats);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black">
        <div className="text-gray-400">Loading chats...</div>
      </div>
    );
  }

  // Chat View
  if (view === 'chat' && activeChat) {
    return (
      <div className="h-screen w-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white overflow-hidden">
        <HeaderBar
          currentChatTitle={activeChat.title}
          onSearch={() => setShowSearch(true)}
          onSettings={() => setShowSettings(true)}
          onLibrary={() => setShowLibrary(true)}
        />
        
        <div className="flex-1 overflow-hidden">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center">
                  <div className="text-gray-400">Loading chat...</div>
                </div>
              }
            >
              {activeChat.kind === 'Everyday' && (
                <ErrorBoundary>
                  <EverydayChat
                    chatId={activeChat.id}
                    title={activeChat.title}
                    onTitleChange={handleChatTitleChange}
                  />
                </ErrorBoundary>
              )}
              {activeChat.kind === 'Journal' && (
                <ErrorBoundary>
                  <JournalChat
                    chatId={activeChat.id}
                    title={activeChat.title}
                    onTitleChange={handleChatTitleChange}
                  />
                </ErrorBoundary>
              )}
              {(activeChat.kind === 'ProStudioA' || activeChat.kind === 'ProStudioB') && (
                <ErrorBoundary>
                  <ProStudioChat
                    chatId={activeChat.id}
                    title={activeChat.title}
                    onTitleChange={handleChatTitleChange}
                    descriptor={activeChat}
                  />
                </ErrorBoundary>
              )}
              {activeChat.kind === 'Dispatch' && (
                <ErrorBoundary>
                  <DispatchChat
                    chatId={activeChat.id}
                    title={activeChat.title}
                    onTitleChange={handleChatTitleChange}
                  />
                </ErrorBoundary>
              )}
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Modals */}
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
        {showSearch && (
          <SearchPanel onClose={() => setShowSearch(false)} />
        )}
      </div>
    );
  }

  // Grid View
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white overflow-hidden relative">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <HeaderBar
        onSearch={() => setShowSearch(true)}
        onSettings={() => setShowSettings(true)}
        onLibrary={() => setShowLibrary(true)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {config?.userName || config?.name || 'User'}
            </h1>
            <p className="text-gray-400">
              Select a chat to continue, or start a new conversation
            </p>
          </div>

          {/* Chat Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chats.map((chat) => (
              <ChatTile
                key={chat.id}
                descriptor={chat}
                onClick={() => handleChatClick(chat)}
                isLocked={
                  chat.kind === 'Journal' && !authState.isJournalUnlocked
                }
              />
            ))}

            {/* Empty State */}
            {chats.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400">
                  No chats available. Please complete the setup wizard.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm border-t border-slate-700/50">
        <ActivityIndicator />
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
      {showSearch && (
        <SearchPanel onClose={() => setShowSearch(false)} />
      )}
    </div>
  );
}
