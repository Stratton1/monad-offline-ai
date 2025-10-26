import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "../store/chatStore";
import { generateText } from "../utils/api";
import MessageList from "./MessageList";
import ChatBox from "./ChatBox";

const Chat: React.FC = () => {
  const { messages, addMessage, updateMessage, setLoading, isLoading } = useChatStore();

  const makeId = () => crypto.randomUUID();

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
            "🚨 Unable to reach the MONAD backend. Ensure it's running on http://localhost:8000.",
          loading: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [addMessage, updateMessage, setLoading, isLoading]
  );

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
              M
            </span>
            MONAD
          </div>
          <div className="text-[11px] text-white/50 -mt-0.5">
            Offline AI Assistant
          </div>
        </div>
        <div className="flex items-center text-xs text-green-400 gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Online
        </div>
      </motion.div>

      {/* Message List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <MessageList messages={messages} />
      </div>

      {/* Input */}
      <ChatBox
        onSend={handleSendMessage}
        disabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Chat;