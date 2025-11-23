/**
 * EverydayChat.tsx
 * Purpose: General-purpose chat with save, export, and hashtag management
 * Usage: Main chat interface for everyday conversations
 * Privacy: All data stored locally, encrypted at rest
 */

import { useEffect } from 'react';
import ChatScaffold from '../shared/ChatScaffold';
import MessageList from '../../components/MessageList';
import ChatInput from '../../components/chat/ChatInput';
import { sendMessage } from '../../utils/api';
import { useChatStore, type ChatMessage } from '../../store/chatStore';
import {
  saveConversation,
  exportPDF,
  exportRTF,
  openChatFolder,
  getTagsForChat,
} from '../../lib/library';
import { isBrowser } from '../../lib/env';
// Simple UUID generator
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface EverydayChatProps {
  chatId: string;
  title: string;
  onTitleChange: (title: string) => void;
}

export default function EverydayChat({
  chatId,
  title,
  onTitleChange,
}: EverydayChatProps) {
  const { messages, addMessage, setLoading, isLoading, clearMessages } = useChatStore();

  const handleSend = async (content: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setLoading(true);

    try {
      // Call backend API
      const response = await sendMessage(content);
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response || 'No response generated',
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('[EverydayChat] Generation error:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveConversation({
        chatId,
        title: title || 'Untitled Conversation',
        tags: getTagsForChat(chatId),
        messages,
        startedAt: messages[0]?.timestamp.getTime() || Date.now(),
        endedAt: Date.now(),
      });
    } catch (error) {
      console.error('[EverydayChat] Save failed:', error);
      throw error;
    }
  };

  const handleExport = async (format: 'pdf' | 'rtf') => {
    try {
      const conversation = {
        id: chatId,
        chatId,
        title: title || 'Untitled Conversation',
        tags: getTagsForChat(chatId),
        messages,
        startedAt: messages[0]?.timestamp.getTime() || Date.now(),
        endedAt: Date.now(),
        createdAt: Date.now(),
      };

      if (format === 'pdf') {
        await exportPDF(conversation);
      } else {
        await exportRTF(conversation);
      }
    } catch (error) {
      console.error('[EverydayChat] Export failed:', error);
      throw error;
    }
  };

  const handleOpenFolder = async () => {
    try {
      await openChatFolder(chatId);
    } catch (error) {
      console.error('[EverydayChat] Failed to open folder:', error);
    }
  };

  // Prompt to save on exit
  useEffect(() => {
    if (!isBrowser()) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (messages.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages.length]);

  return (
    <ChatScaffold
      chatId={chatId}
      chatType="everyday"
      title={title}
      onTitleChange={onTitleChange}
      onSave={handleSave}
      onExport={handleExport}
      onOpenFolder={handleOpenFolder}
      showSave={true}
      showExport={true}
      showFolder={true}
      messages={messages}
      onClearChat={() => clearMessages()}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList messages={messages} />
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          isLoading={isLoading}
          placeholder="Type your message..."
        />
      </div>
    </ChatScaffold>
  );
}
