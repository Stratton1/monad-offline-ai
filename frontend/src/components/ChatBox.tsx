import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { useBackend } from '../hooks/useBackend'

interface ChatBoxProps {
  onSend: (content: string) => void
  disabled?: boolean
  isLoading?: boolean
}

function ChatBox({ onSend, disabled = false, isLoading = false }: ChatBoxProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isConnected } = useBackend()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || disabled || isLoading) return

    const userMessage = input.trim()
    setInput('')
    
    // Call the parent's send handler
    onSend(userMessage)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  // Show backend disconnected message if not connected
  if (!isConnected) {
    return (
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center text-red-400 mt-2 text-sm"
      >
        ⚠️ Backend disconnected. Please restart the MONAD backend.
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
      {/* textarea row */}
      <div className="flex items-end gap-2 rounded-lg bg-[rgba(30,34,46,0.6)] border border-white/10 px-3 py-2">
        <textarea
          id="monad-chat-input"
          name="monad-chat-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
          className="w-full resize-none bg-transparent text-white placeholder-white/30 text-sm outline-none"
          rows={1}
          autoComplete="off"
          disabled={disabled || isLoading}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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

      {/* loading indicator */}
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-blue-400 flex items-center gap-2 px-1 animate-pulse"
        >
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
          <span className="glow">Generating…</span>
        </motion.div>
      )}

      {/* helper text */}
      <div className="text-[10px] text-white/30 px-1">
        Press Enter to send, Shift+Enter for new line
      </div>
    </motion.form>
  )
}

export default ChatBox