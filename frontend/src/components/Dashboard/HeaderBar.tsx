/**
 * HeaderBar.tsx
 * Purpose: Global header with navigation, status indicators, and utilities
 * Usage: Displays across all dashboard views
 * Privacy: Shows connection and encryption status
 */

import { useEffect } from 'react';
import { Search, Settings, Lock, BookOpen } from 'lucide-react';
import { useAppSessionStore } from '../../store/appSessionStore';
import { getAuthState, lockApp } from '../../lib/auth';
import { useBackend } from '../../hooks/useBackend';

interface HeaderBarProps {
  currentChatTitle?: string;
  onSearch: () => void;
  onSettings: () => void;
  onLibrary: () => void;
}

export default function HeaderBar({
  currentChatTitle,
  onSearch,
  onSettings,
  onLibrary,
}: HeaderBarProps) {
  const { isConnected } = useBackend();
  const { isUnlocked } = useAppSessionStore();
  const authState = getAuthState();

  // Global hotkeys
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === 'F1') {
        e.preventDefault();
        // Help / Docs (placeholder)
        console.log('[HeaderBar] F1 - Help');
      } else if (e.key === 'F2') {
        e.preventDefault();
        onSearch();
      } else if (e.key === 'F3') {
        e.preventDefault();
        lockApp();
      } else if (modKey && e.key === 'f') {
        e.preventDefault();
        onSearch();
      } else if (modKey && e.key === 'm') {
        e.preventDefault();
        // Mute sounds (placeholder)
        console.log('[HeaderBar] Cmd/Ctrl+M - Mute');
      } else if (modKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        lockApp();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSearch]);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
      {/* Left: Logo + Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">M</span>
          </div>
          <span className="text-sm font-semibold">MONAD</span>
          <span className="text-xs text-gray-500">v3.7.0</span>
        </div>
        {currentChatTitle && (
          <>
            <span className="text-gray-500">/</span>
            <span className="text-sm text-gray-400">{currentChatTitle}</span>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Status Indicators */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/50">
          {/* Backend Status */}
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
              title={isConnected ? 'Backend connected' : 'Backend disconnected'}
            />
            <span className="text-xs text-gray-400">Backend</span>
          </div>

          {/* Encryption Status */}
          {isUnlocked && authState.appKey && (
            <div className="flex items-center gap-1 ml-3">
              <div className="w-2 h-2 rounded-full bg-violet-400" title="Encryption active" />
              <span className="text-xs text-gray-400">Encrypted</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <button
          onClick={onLibrary}
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          title="Library (F1)"
          aria-label="Open library"
        >
          <BookOpen className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={onSearch}
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          title="Search (F2)"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={onSettings}
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          title="Settings"
          aria-label="Open settings"
        >
          <Settings className="w-4 h-4 text-gray-400" />
        </button>

        {isUnlocked && (
          <button
            onClick={() => lockApp()}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            title="Lock (F3)"
            aria-label="Lock app"
          >
            <Lock className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </header>
  );
}
