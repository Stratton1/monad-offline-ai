/**
 * ChatInput.tsx
 * Unified chat input with auto-resize, connectivity warning, and send button.
 * Used by active chat flows in place of the legacy ChatBox.
 * Privacy: Handles local input only and sends to local backend.
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";

export interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export default function ChatInput({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = "Type your message...",
  maxLength = 4000,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isConnected } = useBackend();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled || isLoading) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  if (!isConnected) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center text-amber-300 mt-2 text-sm bg-amber-500/10 border border-amber-400/30 rounded-lg p-2"
      >
        Backend disconnected. Please restart the MONAD backend.
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 p-4 bg-[rgba(20,24,32,0.6)] backdrop-blur-md border-t border-white/10"
    >
      <div className="flex items-end gap-2 rounded-lg bg-[rgba(30,34,46,0.6)] border border-white/10 px-3 py-2">
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
          className="w-full resize-none bg-transparent text-white placeholder-white/30 text-sm outline-none"
          rows={1}
          autoComplete="off"
          disabled={disabled || isLoading}
        />
        <motion.button
          whileHover={{ scale: disabled || isLoading || !input.trim() ? 1 : 1.05 }}
          whileTap={{ scale: disabled || isLoading || !input.trim() ? 1 : 0.95 }}
          type="submit"
          disabled={disabled || isLoading || !input.trim()}
          className="flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-blue-950/40 disabled:text-white/30 text-white text-sm font-medium px-3 py-2 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs leading-none">Generating...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="text-xs leading-none">Send</span>
            </>
          )}
        </motion.button>
      </div>
      <div className="text-[10px] text-white/30 px-1">
        Press Enter to send, Shift+Enter for new line — {input.length}/{maxLength}
      </div>
    </motion.form>
  );
}
