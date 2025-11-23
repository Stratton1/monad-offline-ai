/**
 * ProStudioChat.tsx
 * Purpose: Professional chat with Guided Composer for structured persona setup
 * Usage: Used for Pro Studio A and B with sector/role-driven presets
 * Privacy: All data stored locally, encrypted at rest
 */

import { useState } from 'react';
import ChatScaffold from '../shared/ChatScaffold';
import MessageList from '../../components/MessageList';
import Composer from '../shared/Composer';
import GuidedComposer from './GuidedComposer';
import { useChatStore, type ChatMessage } from '../../store/chatStore';
import {
  saveConversation,
  exportPDF,
  exportRTF,
  openChatFolder,
  getTagsForChat,
} from '../../lib/library';
import { sendMessage } from '../../utils/api';
import type { ChatDescriptor } from '../registry';

// Simple UUID generator
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface ProStudioChatProps {
  chatId: string;
  title: string;
  onTitleChange: (title: string) => void;
  descriptor?: ChatDescriptor;
}

export default function ProStudioChat({
  chatId,
  title,
  onTitleChange,
  descriptor,
}: ProStudioChatProps) {
  const { messages, addMessage, setLoading, isLoading } = useChatStore();
  const [showComposer, setShowComposer] = useState(!descriptor?.config);
  const [preset, setPreset] = useState<Record<string, unknown> | null>(null);

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
      const response = await sendMessage(content);
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response || 'No response generated',
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('[ProStudioChat] Generation error:', error);
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
        title: title || 'Pro Studio Conversation',
        tags: getTagsForChat(chatId),
        messages,
        startedAt: messages[0]?.timestamp.getTime() || Date.now(),
        endedAt: Date.now(),
      });
    } catch (error) {
      console.error('[ProStudioChat] Save failed:', error);
      throw error;
    }
  };

  const handleExport = async (format: 'pdf' | 'rtf') => {
    try {
      const conversation = {
        id: chatId,
        chatId,
        title: title || 'Pro Studio Conversation',
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
      console.error('[ProStudioChat] Export failed:', error);
      throw error;
    }
  };

  const handleOpenFolder = async () => {
    try {
      await openChatFolder(chatId);
    } catch (error) {
      console.error('[ProStudioChat] Failed to open folder:', error);
    }
  };

  const handleComposerComplete = (presetConfig: unknown) => {
    setPreset(presetConfig as Record<string, unknown>);
    setShowComposer(false);
    // Persist preset to descriptor
    // This would be saved via library.saveDescriptor
  };

  return (
    <ChatScaffold
      chatId={chatId}
      chatType="prostudio"
      title={title}
      onTitleChange={onTitleChange}
      onSave={handleSave}
      onExport={handleExport}
      onOpenFolder={handleOpenFolder}
      showSave={true}
      showExport={true}
      showFolder={true}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Guided Composer */}
        {showComposer && (
          <div className="p-6 bg-slate-800/30 border-b border-slate-700/50">
            <GuidedComposer
              initialConfig={descriptor?.config}
              onComplete={handleComposerComplete}
              onCancel={() => setShowComposer(false)}
            />
          </div>
        )}

        {/* Preset Preview */}
        {preset && !showComposer && (
          <div className="px-6 py-3 bg-blue-900/20 border-b border-blue-700/30">
            <p className="text-xs text-blue-300">
              Pro Studio configured. Ready to assist with professional tasks.
            </p>
          </div>
        )}

        {/* Chat Content */}
        <MessageList messages={messages} />
        <Composer
          onSend={handleSend}
          disabled={isLoading || showComposer}
          isLoading={isLoading}
          placeholder="Type your professional query..."
        />
      </div>
    </ChatScaffold>
  );
}
