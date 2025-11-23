/**
 * SearchPanel.tsx
 * Purpose: Search panel for library search with tag filters
 * Usage: Accessed via F2 or search button
 * Privacy: All searches local only
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon } from 'lucide-react';
import { searchChats, getAllTags } from '../../lib/library';
import type { ChatDescriptor } from '../../chats/registry';
import { useAppSessionStore } from '../../store/appSessionStore';

interface SearchPanelProps {
  onClose: () => void;
}

export default function SearchPanel({ onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [results, setResults] = useState<ChatDescriptor[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { setActiveChat, setShowLibrary } = useAppSessionStore();

  useEffect(() => {
    const tags = getAllTags();
    setAllTags(tags);
  }, []);

  useEffect(() => {
    // Perform search
    if (query.trim() || selectedTags.length > 0) {
      const searchResults = searchChats({
        q: query.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag]
    );
  };

  const handleResultClick = (chat: ChatDescriptor) => {
    setActiveChat(chat.id);
    setShowLibrary(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-slate-800 rounded-xl border border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Search Library</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats, messages..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
              autoFocus
            />
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 20).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleResultClick(chat)}
                    className="w-full p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-left"
                  >
                    <div className="font-semibold mb-1">{chat.title}</div>
                    <div className="text-xs text-gray-400">
                      {chat.kind} • {new Date(chat.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim() || selectedTags.length > 0 ? (
              <div className="text-center py-8 text-gray-400">
                No results found
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Start typing or select tags to search
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
