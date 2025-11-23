/**
 * library.ts
 * Purpose: Chat library management with encrypted save, export, hashtags, and search
 * Usage: Used by chat components and registry to manage chat storage
 * Privacy: All operations are local, encrypted at rest using AES-GCM
 * Security: Atomic file writes, encrypted storage, secure file operations via Tauri
 */

import type { ChatDescriptor } from '../chats/registry';
import { encryptForLocal } from './auth';
import type { ChatMessage } from '../store/chatStore';
import type { ExportPayload, SecureFilePayload, EnsureFolderPayload } from '../types/ipc';

/**
 * Saved message structure
 */
export interface SavedMessage {
  id: string;
  chatId: string;
  title: string;
  tags: string[];
  body: string;
  createdAt: number;
  messageId?: string; // Reference to original message if saving single message
}

/**
 * Saved conversation structure
 */
export interface SavedConversation {
  id: string;
  chatId: string;
  title: string;
  tags: string[];
  messages: ChatMessage[];
  startedAt: number;
  endedAt: number;
  createdAt: number;
}

/**
 * Hashtag index entry
 */
interface HashtagIndex {
  tag: string;
  chatIds: string[];
  messageIds: string[];
  lastUpdated: number;
}

/**
 * Chat folder path helper
 */
export async function getChatFolder(chatId: string): Promise<string> {
  const chat = getChatById(chatId);
  if (!chat) {
    throw new Error(`Chat ${chatId} not found in registry`);
  }
  return chat.storagePath;
}

/**
 * Open chat folder in file manager
 */
export async function openChatFolder(chatId: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && ((window as unknown) as Record<string, unknown>).__TAURI__) {
      const { open } = await import('@tauri-apps/plugin-shell');
      const folderPath = await getChatFolder(chatId);
      
      // Ensure folder exists
      await ensureChatFolder({ id: chatId, storagePath: folderPath } as ChatDescriptor);
      
      // Open folder
      await open(folderPath);
    } else {
      // Fallback: show alert with path
      const folderPath = await getChatFolder(chatId);
      alert(`Chat folder: ${folderPath}`);
    }
  } catch (error) {
    console.error('[Library] Failed to open chat folder:', error);
    throw error;
  }
}

/**
 * Save a single message (encrypted)
 */
export async function saveMessage(options: {
  chatId: string;
  title: string;
  tags: string[];
  body: string;
  messageId?: string;
}): Promise<SavedMessage> {
  const { chatId, title, tags, body, messageId } = options;
  
  const savedMessage: SavedMessage = {
    id: `${chatId}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    chatId,
    title,
    tags,
    body,
    createdAt: Date.now(),
    messageId,
  };

  try {
    // Encrypt message
    const encrypted = await encryptForLocal(savedMessage);
    
    // Get chat folder
    const folderPath = await getChatFolder(chatId);
    
    // Save via Tauri (atomic write)
    if (typeof window !== 'undefined' && ((window as unknown) as Record<string, unknown>).__TAURI__) {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke<void>('write_secure_file', {
        path: `${folderPath}/${savedMessage.id}.enc`,
        data: encrypted,
      } as SecureFilePayload);
    } else {
      // Fallback: localStorage
      localStorage.setItem(`monad_message_${savedMessage.id}`, encrypted);
    }

    // Update hashtag index
    await indexHashtags(chatId, tags, savedMessage.id);

    return savedMessage;
  } catch (error) {
    console.error('[Library] Failed to save message:', error);
    throw error;
  }
}

/**
 * Save entire conversation (encrypted)
 */
export async function saveConversation(options: {
  chatId: string;
  title: string;
  tags: string[];
  messages: ChatMessage[];
  startedAt: number;
  endedAt: number;
}): Promise<SavedConversation> {
  const { chatId, title, tags, messages, startedAt, endedAt } = options;
  
  const savedConversation: SavedConversation = {
    id: `${chatId}-conv-${Date.now()}`,
    chatId,
    title,
    tags,
    messages,
    startedAt,
    endedAt,
    createdAt: Date.now(),
  };

  try {
    // Encrypt conversation
    const encrypted = await encryptForLocal(savedConversation);
    
    // Get chat folder
    const folderPath = await getChatFolder(chatId);
    
    // Save via Tauri (atomic write)
    if (typeof window !== 'undefined' && ((window as unknown) as Record<string, unknown>).__TAURI__) {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke<void>('write_secure_file', {
        path: `${folderPath}/${savedConversation.id}.enc`,
        data: encrypted,
      } as SecureFilePayload);
    } else {
      // Fallback: localStorage
      localStorage.setItem(`monad_conv_${savedConversation.id}`, encrypted);
    }

    // Update hashtag index
    await indexHashtags(chatId, tags, savedConversation.id);

    return savedConversation;
  } catch (error) {
    console.error('[Library] Failed to save conversation:', error);
    throw error;
  }
}

/**
 * Export conversation to PDF (via Tauri)
 */
export async function exportPDF(conversation: SavedConversation): Promise<string> {
  try {
    if (typeof window !== 'undefined' && ((window as unknown) as Record<string, unknown>).__TAURI__) {
      const { invoke } = await import('@tauri-apps/api/core');
      const folderPath = await getChatFolder(conversation.chatId);
      const filename = `${folderPath}/${conversation.title || 'conversation'}_${Date.now()}.pdf`;
      
      await invoke<void>('export_pdf', {
        payload: {
          title: conversation.title,
          messages: conversation.messages,
          createdAt: conversation.createdAt,
        },
        filename,
      } as ExportPayload);
      
      return filename;
    } else {
      throw new Error('PDF export requires Tauri environment');
    }
  } catch (error) {
    console.error('[Library] Failed to export PDF:', error);
    throw error;
  }
}

/**
 * Export conversation to RTF (via Tauri)
 */
export async function exportRTF(conversation: SavedConversation): Promise<string> {
  try {
    if (typeof window !== 'undefined' && ((window as unknown) as Record<string, unknown>).__TAURI__) {
      const { invoke } = await import('@tauri-apps/api/core');
      const folderPath = await getChatFolder(conversation.chatId);
      const filename = `${folderPath}/${conversation.title || 'conversation'}_${Date.now()}.rtf`;
      
      await invoke<void>('export_rtf', {
        payload: {
          title: conversation.title,
          messages: conversation.messages,
          createdAt: conversation.createdAt,
        },
        filename,
      } as ExportPayload);
      
      return filename;
    } else {
      throw new Error('RTF export requires Tauri environment');
    }
  } catch (error) {
    console.error('[Library] Failed to export RTF:', error);
    throw error;
  }
}

/**
 * Index hashtags for search
 */
async function indexHashtags(chatId: string, tags: string[], messageId: string): Promise<void> {
  try {
    const index = getHashtagIndex();
    
    for (const tag of tags) {
      const normalizedTag = tag.toLowerCase();
      if (!index[normalizedTag]) {
        index[normalizedTag] = {
          tag: normalizedTag,
          chatIds: [],
          messageIds: [],
          lastUpdated: Date.now(),
        };
      }
      
      if (!index[normalizedTag].chatIds.includes(chatId)) {
        index[normalizedTag].chatIds.push(chatId);
      }
      
      if (!index[normalizedTag].messageIds.includes(messageId)) {
        index[normalizedTag].messageIds.push(messageId);
      }
      
      index[normalizedTag].lastUpdated = Date.now();
    }
    
    localStorage.setItem('monad_hashtag_index', JSON.stringify(index));
  } catch (error) {
    console.error('[Library] Failed to index hashtags:', error);
    // Don't throw - indexing failure shouldn't block save
  }
}

/**
 * Get hashtag index
 */
function getHashtagIndex(): Record<string, HashtagIndex> {
  try {
    const stored = localStorage.getItem('monad_hashtag_index');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Search by query and tags
 */
export function searchChats(options: {
  q?: string;
  tags?: string[];
}): ChatDescriptor[] {
  const registry = getRegistry();
  const { q, tags } = options;
  
  if (!q && (!tags || tags.length === 0)) {
    return registry;
  }
  
  const index = getHashtagIndex();
  const matchingChatIds = new Set<string>();
  
  // Search by tags
  if (tags && tags.length > 0) {
    for (const tag of tags) {
      const normalizedTag = tag.toLowerCase();
      if (index[normalizedTag]) {
        index[normalizedTag].chatIds.forEach((id) => matchingChatIds.add(id));
      }
    }
  }
  
  // Filter registry
  let results = registry;
  
  if (tags && tags.length > 0 && matchingChatIds.size > 0) {
    results = results.filter((chat) => matchingChatIds.has(chat.id));
  }
  
  // Search by query (title matching)
  if (q) {
    const query = q.toLowerCase();
    results = results.filter((chat) => 
      chat.title.toLowerCase().includes(query)
    );
  }
  
  return results;
}

/**
 * Get all tags
 */
export function getAllTags(): string[] {
  const index = getHashtagIndex();
  return Object.keys(index).sort();
}

/**
 * Get tags for a chat
 */
export function getTagsForChat(chatId: string): string[] {
  const index = getHashtagIndex();
  const tags: string[] = [];
  
  for (const [tag, entry] of Object.entries(index)) {
    if (entry.chatIds.includes(chatId)) {
      tags.push(tag);
    }
  }
  
  return tags.sort();
}

/**
 * Ensure chat folder exists for a descriptor
 */
export async function ensureChatFolder(descriptor: ChatDescriptor): Promise<void> {
  // In Tauri, use fs API to create directory
  if (typeof window !== 'undefined' && ((window as unknown) as Record<string, unknown>).__TAURI__) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke<void>('ensure_chat_folder', { path: descriptor.storagePath } as EnsureFolderPayload);
    } catch (error) {
      console.error('[Library] Failed to ensure chat folder:', error);
      // Continue to fallback
    }
  }
  
  // Fallback: ensure folder is tracked in localStorage
  const folders = getStoredFolders();
  if (!folders[descriptor.id]) {
    folders[descriptor.id] = descriptor.storagePath;
    setStoredFolders(folders);
  }
}

/**
 * Save chat descriptor to registry
 */
export async function saveDescriptor(descriptor: ChatDescriptor): Promise<void> {
  const registry = getRegistry();
  const updated = registry.filter((d) => d.id !== descriptor.id);
  updated.push(descriptor);
  await setRegistry(updated);
}

/**
 * Get chat registry
 */
export function getRegistry(): ChatDescriptor[] {
  try {
    const stored = localStorage.getItem('monad_chat_registry');
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Set chat registry
 */
export async function setRegistry(registry: ChatDescriptor[]): Promise<void> {
  try {
    localStorage.setItem('monad_chat_registry', JSON.stringify(registry));
  } catch (error) {
    console.error('[Library] Failed to save registry:', error);
    throw error;
  }
}

/**
 * Get stored folders (localStorage fallback)
 */
function getStoredFolders(): Record<string, string> {
  try {
    const stored = localStorage.getItem('monad_chat_folders');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Set stored folders (localStorage fallback)
 */
function setStoredFolders(folders: Record<string, string>): void {
  try {
    localStorage.setItem('monad_chat_folders', JSON.stringify(folders));
  } catch (error) {
    console.error('[Library] Failed to save folders:', error);
  }
}

/**
 * Search chats by hashtags (deprecated - use searchChats instead)
 */
export function searchChatsByHashtags(hashtags: string[]): ChatDescriptor[] {
  return searchChats({ tags: hashtags });
}

/**
 * Get chat by ID
 */
export function getChatById(id: string): ChatDescriptor | undefined {
  const registry = getRegistry();
  return registry.find((chat) => chat.id === id);
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 255);
}

/**
 * Generate content hash for deduplication
 */
export async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
