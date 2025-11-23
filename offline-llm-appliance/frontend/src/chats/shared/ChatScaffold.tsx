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
}: ChatScaffoldProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

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
          <div className="flex items-center gap-2">
            {/* Tags */}
            <button
              onClick={() => setShowTagInput(!showTagInput)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              title="Tags (Cmd/Ctrl+K)"
              aria-label="Manage tags"
            >
              <Tag className="w-4 h-4" />
            </button>

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
    </div>
  );
}
