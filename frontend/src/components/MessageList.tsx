/**
 * MessageList.tsx
 * Purpose: Renders the conversation history displaying user messages and AI responses with proper formatting and animations.
 * Usage: Used within Chat component to display the message thread with scroll-to-bottom functionality.
 * Privacy: Displays locally stored chat messages only, no external data transmission.
 */

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChatMessage } from '../store/chatStore'
import { Bot, User } from 'lucide-react'

interface MessageListProps {
  messages: ChatMessage[];
}

function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = document.getElementById("messages-end")
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-2xl font-semibold gradient-text mb-2">Welcome to MONAD</h2>
          <p className="text-gray-400 mb-6">
            Your offline AI assistant is ready to help. Start a conversation by typing a message below.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "Explain quantum computing",
              "Write a Python function",
              "Tell me a story",
              "Help with math"
            ].map((suggestion) => (
              <button
                key={suggestion}
                className="glass text-sm px-3 py-1 rounded-full hover:glass-strong transition-all duration-200"
                onClick={() => {
                  // This would trigger a message send - for now just show the suggestion
                  console.log('Suggestion clicked:', suggestion)
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex items-start space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' 
                ? 'bg-gradient-to-r from-primary-500 to-primary-600' 
                : 'bg-gradient-to-r from-gray-600 to-gray-700'
            }`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message Content */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`message-bubble ${
                message.role === 'user' ? 'message-user' : 'message-ai'
              }`}
            >
              <div className="prose prose-invert max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              
              {/* Timestamp */}
              <div className="text-xs text-gray-500 mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
              
              {/* Generating indicator */}
              {message.loading && (
                <div className="flex items-center space-x-1 mt-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-400">Generating...</span>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      ))}
      
      {/* Scroll anchor */}
      <div id="messages-end" ref={messagesEndRef} />
    </div>
  )
}

export default MessageList
