/**
 * SaveDialog.tsx
 * Purpose: Dialog for saving chats with title and tags
 * Usage: Used by ChatScaffold when user clicks save
 * Privacy: All data saved locally, never transmitted
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

interface SaveDialogProps {
  chatId: string;
  chatType: 'everyday' | 'journal' | 'prostudio' | 'dispatch';
  title: string;
  tags: string[];
  onSave: (options: {
    title: string;
    tags: string[];
    folder?: string;
    saveType: 'message' | 'conversation';
  }) => Promise<void>;
  onClose: () => void;
}

export default function SaveDialog({
  chatId: _chatId,
  chatType: _chatType,
  title: initialTitle,
  tags: initialTags,
  onSave,
  onClose,
}: SaveDialogProps) {
  const [title, setTitle] = useState(initialTitle || '');
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [newTag, setNewTag] = useState('');
  const [saveType, setSaveType] = useState<'message' | 'conversation'>('conversation');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return; // Title required
    }
    setIsSaving(true);
    try {
      await onSave({ title, tags, saveType });
      onClose();
    } catch (error) {
      console.error('[SaveDialog] Save failed:', error);
      // Error will be handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Save Chat</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter chat title"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
              autoFocus
            />
          </div>

          {/* Save Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Save Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSaveType('message')}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  saveType === 'message'
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-900 border-slate-600 hover:bg-slate-700'
                }`}
              >
                Current Message
              </button>
              <button
                onClick={() => setSaveType('conversation')}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  saveType === 'conversation'
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-900 border-slate-600 hover:bg-slate-700'
                }`}
              >
                Full Conversation
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag (Enter to add)"
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400 transition-colors"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || isSaving}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
