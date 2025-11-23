/**
 * ChatScaffold.tsx
 * Purpose: Shared scaffold component for all chat types with header, toolbar, save/export buttons
 * Usage: Wraps chat-specific content with common UI elements and keyboard shortcuts
 * Privacy: All operations are local, no external calls
 */

import { useState, useEffect } from 'react';
import { Save, Download, FolderOpen, Tag } from 'lucide-react';
import SaveDialog from './SaveDialog';
import ExportDialog from './ExportDialog';
import TagInput from './TagInput';
import SavePreferenceModal from '../../components/SavePreferenceModal';
import { useChatStore } from '../../store/chatStore';
import { getConfigOrDefault } from '../../lib/config';
import PrivacyBadge from '../../components/chat/PrivacyBadge';
import ContextMeter from '../../components/chat/ContextMeter';
import CommandPalette, { type CommandAction } from '../../components/chat/CommandPalette';
import { useBackend } from '../../hooks/useBackend';
import type { ChatMessage } from '../../store/chatStore';
import { isBrowser } from '../../lib/env';

interface ChatScaffoldProps {
  chatId: string;
  chatType: 'everyday' | 'journal' | 'prostudio' | 'dispatch';
  title: string;
  onTitleChange: (title: string) => void;
  onSave?: () => Promise<void>;
  onExport?: (format: 'pdf' | 'rtf') => Promise<void>;
  onOpenFolder?: () => Promise<void>;
  children: React.ReactNode;
  showSave?: boolean;
  showExport?: boolean;
  showFolder?: boolean;
  messages?: ChatMessage[];
  onClearChat?: () => void;
  onSaveDraft?: () => void;
}

export default function ChatScaffold({
  chatId,
  chatType,
  title,
  onTitleChange,
  onSave,
  onExport,
  onOpenFolder,
  children,
  showSave = true,
  showExport = true,
  showFolder = true,
  messages = [],
  onClearChat,
  onSaveDraft,
}: ChatScaffoldProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [config] = useState(() => getConfigOrDefault());
  const [showPalette, setShowPalette] = useState(false);

  const {
    needsPersistenceDecision,
    setPersistenceChoice,
    clearPersistencePrompt,
    persistenceChoice,
    saveMessages,
  } = useChatStore((state) => ({
    needsPersistenceDecision: state.needsPersistenceDecision,
    setPersistenceChoice: state.setPersistenceChoice,
    clearPersistencePrompt: state.clearPersistencePrompt,
    persistenceChoice: state.persistenceChoice,
    saveMessages: state.saveMessages,
  }));
  const { isConnected } = useBackend();

  const persistenceStatus = (() => {
    if (!config) return "session";
    if (config.savePreference === "never" || persistenceChoice === "never") return "disabled";
    if (config.savePreference === "always" || persistenceChoice === "always") return "enabled";
    return "session"; // ask but not confirmed
  })();

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey) {
        if (e.key === 's' && onSave && showSave) {
          e.preventDefault();
          setShowSaveDialog(true);
        } else if (e.key === 'e' && onExport && showExport) {
          e.preventDefault();
          setShowExportDialog(true);
        } else if (e.key === 'k' && showTagInput) {
          e.preventDefault();
          setShowTagInput(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSave, onExport, showSave, showExport, showTagInput]);

  const handleTitleSave = () => {
    onTitleChange(localTitle);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setLocalTitle(title);
    setIsEditingTitle(false);
  };

  const handlePersistenceDecision = (choice: "once" | "never" | "always" | "cancel") => {
    if (choice === "cancel") {
      clearPersistencePrompt();
      return;
    }
    if (choice === "always") {
      setPersistenceChoice("always");
    } else if (choice === "never") {
      setPersistenceChoice("never");
    } else {
      setPersistenceChoice("once");
    }
    if (choice === "always" || choice === "once") {
      saveMessages();
    }
  };

  const contextUsagePercent = (() => {
    if (!messages || messages.length === 0) return 0;
    const totalWords = messages.reduce((acc, msg) => acc + msg.content.split(/\s+/).length, 0);
    return Math.min((totalWords / 1000) * 100, 100);
  })();

  useEffect(() => {
    if (!isBrowser()) return;
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      if (modKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowPalette(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const paletteActions: CommandAction[] = [
    onSave
      ? {
          title: "Save chat",
          description: "Encrypt and save this conversation locally",
          onSelect: () => setShowSaveDialog(true),
        }
      : null,
    onExport
      ? {
          title: "Export PDF",
          onSelect: () => onExport("pdf"),
        }
      : null,
    onExport
      ? {
          title: "Export RTF",
          onSelect: () => onExport("rtf"),
        }
      : null,
    onOpenFolder
      ? {
          title: "Open chat folder",
          onSelect: () => onOpenFolder(),
        }
      : null,
    onClearChat
      ? {
          title: "Clear history",
          description: "Wipe in-memory messages",
          onSelect: () => onClearChat(),
        }
      : null,
    onSaveDraft
      ? {
          title: "Save draft",
          onSelect: () => onSaveDraft(),
        }
      : null,
  ].filter(Boolean) as CommandAction[];

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTitleSave();
                    } else if (e.key === 'Escape') {
                      handleTitleCancel();
                    }
                  }}
                  className="bg-slate-800 border border-blue-500 rounded px-3 py-1 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                />
                <button
                  onClick={handleTitleSave}
                  className="text-green-400 hover:text-green-300 transition-colors"
                  aria-label="Save title"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-lg font-semibold hover:text-blue-400 transition-colors text-left truncate max-w-md"
                title="Click to edit title"
              >
                {title || 'Untitled Chat'}
              </button>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <PrivacyBadge
              isOnline={isConnected}
              securityLevel={config?.securityLevel || "standard"}
            />
            <ContextMeter usagePercent={contextUsagePercent} />
            {persistenceStatus !== "enabled" && (
              <span className="px-3 py-1 rounded-full text-[11px] bg-amber-500/15 border border-amber-400/30 text-amber-200">
                Not saving (session only)
              </span>
            )}
            {/* Tags */}
            <button
              onClick={() => setShowTagInput(!showTagInput)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              title="Tags"
              aria-label="Manage tags"
            >
              <Tag className="w-4 h-4" />
            </button>
            {paletteActions.length > 0 && (
              <button
                onClick={() => setShowPalette(true)}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                title="Command palette (Cmd/Ctrl+K)"
                aria-label="Command palette"
              >
                ⌘K
              </button>
            )}

            {/* Save */}
            {showSave && onSave && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                title="Save chat (Cmd/Ctrl+S)"
                aria-label="Save chat"
              >
                <Save className="w-4 h-4" />
              </button>
            )}

            {/* Export */}
            {showExport && onExport && (
              <button
                onClick={() => setShowExportDialog(true)}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                title="Export chat (Cmd/Ctrl+E)"
                aria-label="Export chat"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Open Folder */}
            {showFolder && onOpenFolder && (
              <button
                onClick={onOpenFolder}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                title="Open chat folder"
                aria-label="Open chat folder"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Tag Input */}
        {showTagInput && (
          <div className="mt-3">
            <TagInput
              tags={tags}
              onTagsChange={setTags}
              onClose={() => setShowTagInput(false)}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>

      {/* Dialogs */}
      {showSaveDialog && onSave && (
        <SaveDialog
          chatId={chatId}
          chatType={chatType}
          title={title}
          tags={tags}
          onSave={async () => {
            // Implementation will be in library.ts
            if (onSave) {
              await onSave();
            }
            setShowSaveDialog(false);
          }}
          onClose={() => setShowSaveDialog(false)}
        />
      )}

      {showExportDialog && onExport && (
        <ExportDialog
          onExport={async (format) => {
            await onExport(format);
            setShowExportDialog(false);
          }}
          onClose={() => setShowExportDialog(false)}
        />
      )}

      <SavePreferenceModal
        isOpen={needsPersistenceDecision}
        onSelect={handlePersistenceDecision}
      />
      {paletteActions.length > 0 && (
        <CommandPalette
          isOpen={showPalette}
          onClose={() => setShowPalette(false)}
          actions={paletteActions}
        />
      )}
    </div>
  );
}
