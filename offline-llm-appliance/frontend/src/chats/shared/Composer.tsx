/**
 * Composer.tsx
 * Purpose: Enhanced message composer for chat inputs with formatting and actions
 * Usage: Used by chat components for message input
 * Privacy: All input handled locally, sent to local backend only
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export default function Composer({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = 'Type your message...',
  maxLength = 4000,
}: ComposerProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled || isLoading) return;

    onSend(input.trim());
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onSubmit={handleSubmit}
      className="flex-shrink-0 bg-slate-900/50 backdrop-blur-sm border-t border-slate-700/50 p-4"
    >
      <div className="flex items-end gap-2 rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              setInput(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 resize-none bg-transparent text-white placeholder-gray-400 text-sm outline-none max-h-32 overflow-y-auto"
          autoComplete="off"
          aria-label="Message input"
        />
        <motion.button
          type="submit"
          disabled={disabled || isLoading || !input.trim()}
          whileHover={{ scale: disabled || isLoading || !input.trim() ? 1 : 1.05 }}
          whileTap={{ scale: disabled || isLoading || !input.trim() ? 1 : 0.95 }}
          className="flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-blue-950/40 disabled:text-white/30 text-white text-sm font-medium px-3 py-2 transition-colors"
          aria-label="Send message"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Generating...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="text-xs">Send</span>
            </>
          )}
        </motion.button>
      </div>
      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-gray-400">
          {input.length}/{maxLength} • Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </motion.form>
  );
}
