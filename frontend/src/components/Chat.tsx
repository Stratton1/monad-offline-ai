/**
 * Chat.tsx
 * Purpose: Main chat interface component that handles AI conversations, message management, and user interactions.
 * Usage: Central component in Dashboard, provides the primary AI interaction experience.
 * Privacy: Manages chat messages in local state and localStorage, sends prompts to local backend only.
 */

import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "../store/chatStore";
import { generateText } from "../utils/api";
import MessageList from "./MessageList";
import ChatBox from "./ChatBox";
import { MonadConfig } from "../lib/config";
import CommandPalette from "./CommandPalette";
import PrivacyBadge from "./PrivacyBadge";
import SavePreferenceModal from "./SavePreferenceModal";
import { loadConfig } from "../lib/config";
import { isBrowser } from "../lib/env";

interface ChatProps {
  config?: MonadConfig | null;
}

const Chat: React.FC<ChatProps> = ({ config }) => {
  const {
    messages,
    addMessage,
    updateMessage,
    setLoading,
    isLoading,
    clearMessages,
    loadMessages,
    saveMessages,
    needsPersistenceDecision,
    setPersistenceChoice,
    clearPersistencePrompt,
    persistenceChoice,
  } = useChatStore((state) => ({
    messages: state.messages,
    addMessage: state.addMessage,
    updateMessage: state.updateMessage,
    setLoading: state.setLoading,
    isLoading: state.isLoading,
    clearMessages: state.clearMessages,
    loadMessages: state.loadMessages,
    saveMessages: state.saveMessages,
    needsPersistenceDecision: state.needsPersistenceDecision,
    setPersistenceChoice: state.setPersistenceChoice,
    clearPersistencePrompt: state.clearPersistencePrompt,
    persistenceChoice: state.persistenceChoice,
  }));
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [reasoning, setReasoning] = useState(config?.reasoningLevel || "standard");
  const [answerStyle, setAnswerStyle] = useState("Detailed");
  const [contextUsage, setContextUsage] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [localConfig] = useState(() => loadConfig());

  const makeId = () => crypto.randomUUID();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check online status
  useEffect(() => {
    if (!isBrowser()) return;
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Autosave messages
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        saveMessages();
      }, 2000); // Save 2 seconds after last change
      
      return () => clearTimeout(timer);
    }
  }, [messages, saveMessages]);

  // Update context usage
  useEffect(() => {
    const totalWords = messages.reduce((acc, msg) => acc + msg.content.split(' ').length, 0);
    setContextUsage(Math.min((totalWords / 1000) * 100, 100)); // Assuming 1000 words = 100%
  }, [messages]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // 1️⃣ Add user message
      const userMsgId = makeId();
      addMessage({
        id: userMsgId,
        role: "user",
        content,
        timestamp: new Date(),
        loading: false,
      });

      // 2️⃣ Add assistant placeholder
      const assistantMsgId = makeId();
      addMessage({
        id: assistantMsgId,
        role: "assistant",
        content: "…Generating…",
        timestamp: new Date(),
        loading: true,
      });

      // 3️⃣ Mark loading state
      setLoading(true);

      try {
        // 4️⃣ Generate response
        const reply = await generateText(content);

        // 5️⃣ Replace placeholder
        updateMessage(assistantMsgId, {
          content: reply || "⚠️ Model returned no response.",
          loading: false,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error("Error generating response:", err);
        updateMessage(assistantMsgId, {
          content:
            "🚨 Unable to reach the MONAD backend. Ensure it's running on http://localhost:5005.",
          loading: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [addMessage, updateMessage, setLoading, isLoading]
  );

  const persistenceStatus = (() => {
    if (!localConfig) return "session";
    if (localConfig.savePreference === "never" || persistenceChoice === "never") return "disabled";
    if (localConfig.savePreference === "always" || persistenceChoice === "always") return "enabled";
    return "session";
  })();

  return (
    <div className="flex flex-col h-full bg-transparent text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[rgba(15,17,21,0.6)] backdrop-blur-md"
      >
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[11px] font-bold">
              {config?.name?.charAt(0) || 'M'}
            </span>
            {config?.name || 'MONAD'}
          </div>
          <div className="text-[11px] text-white/50 -mt-0.5">
            {config?.role || 'Offline AI Assistant'}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {persistenceStatus !== "enabled" && (
            <span className="px-3 py-1 rounded-full text-[11px] bg-amber-500/15 border border-amber-400/30 text-amber-200">
              Not saving (session only)
            </span>
          )}
          {/* Context Meter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Context</span>
            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${contextUsage}%` }}
              />
            </div>
            <span className="text-slate-400">{Math.round(contextUsage)}%</span>
          </div>

          {/* Privacy Badge */}
          <PrivacyBadge 
            isOnline={isOnline} 
            securityLevel={config?.securityLevel || "standard"}
          />
        </div>
      </motion.div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[rgba(15,17,21,0.4)] backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Reasoning Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Reasoning:</span>
            <button
              onClick={() => setReasoning(reasoning === "standard" ? "deep" : "standard")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                reasoning === "deep" 
                  ? "bg-purple-600 text-white" 
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {reasoning === "standard" ? "Standard" : "Deep"}
            </button>
          </div>

          {/* Answer Style */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Style:</span>
            <select
              value={answerStyle}
              onChange={(e) => setAnswerStyle(e.target.value)}
              className="bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Concise">Concise</option>
              <option value="Detailed">Detailed</option>
              <option value="Creative">Creative</option>
              <option value="Technical">Technical</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCommandPalette(true)}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Ctrl+K
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <MessageList messages={messages} />
        
        {/* Typing Indicator */}
        {isLoading && config?.typingIndicator && (
          <motion.div
            className="flex items-center gap-1 text-slate-400 mt-2 px-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <span>{config?.name || 'MONAD'} is typing</span>
            <span className="animate-pulse">...</span>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <ChatBox
        onSend={handleSendMessage}
        disabled={isLoading}
        isLoading={isLoading}
      />

      <SavePreferenceModal
        isOpen={needsPersistenceDecision}
        onSelect={(choice) => {
          if (choice === "cancel") {
            clearPersistencePrompt();
            return;
          }
          if (choice === "always") {
            setPersistenceChoice("always");
            loadMessages();
            saveMessages();
          } else if (choice === "once") {
            setPersistenceChoice("once");
            loadMessages();
            saveMessages();
          } else {
            setPersistenceChoice("never");
          }
        }}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onExportChat={() => {
          const chatText = messages.map(msg => 
            `${msg.role}: ${msg.content}`
          ).join('\n\n');
          const blob = new Blob([chatText], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `MONAD_CHAT_${Date.now()}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        onClearHistory={() => {
          clearMessages();
        }}
        onSwitchModel={(model) => {
          console.log('Switching to model:', model);
        }}
        onToggleReasoning={() => {
          setReasoning(reasoning === "standard" ? "deep" : "standard");
        }}
      />
    </div>
  );
};

export default Chat;
