/**
 * TagInput.tsx
 * Purpose: Component for managing hashtags for chats
 * Usage: Used by ChatScaffold for tag management
 * Privacy: Tags stored locally only
 */

import { useState } from 'react';
import { X, Tag } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onClose?: () => void;
  suggestions?: string[];
}

export default function TagInput({
  tags,
  onTagsChange,
  onClose,
  suggestions = [],
}: TagInputProps) {
  const [input, setInput] = useState('');

  const handleAddTag = (tag?: string) => {
    const tagToAdd = (tag || input.trim()).toLowerCase();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      onTagsChange([...tags, tagToAdd]);
      setInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const availableSuggestions = suggestions.filter((s) => !tags.includes(s));

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium">Tags</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded hover:bg-slate-700 transition-colors"
            aria-label="Close tag input"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag();
            }
          }}
          placeholder="Add tag (Enter to add)"
          className="flex-1 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
        />
        <button
          onClick={() => handleAddTag()}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
        >
          Add
        </button>
      </div>

      {/* Suggestions */}
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {availableSuggestions.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleAddTag(suggestion)}
              className="px-2 py-1 bg-slate-700/50 hover:bg-slate-700 rounded text-xs transition-colors"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Current Tags */}
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
  );
}
