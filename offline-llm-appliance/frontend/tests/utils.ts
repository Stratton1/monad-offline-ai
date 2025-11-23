/**
 * tests/utils.ts
 * Purpose: Test helper utilities for common test setup
 * Usage: Import and use helper functions in test files
 */

import { setupPassword, unlockApp, initialize } from '../src/lib/auth';
import { setRegistry } from '../src/lib/library';
import type { ChatDescriptor } from '../src/chats/registry';

/**
 * Helper function to unlock app for encryption operations in tests
 * This simulates a fully authenticated and unlocked app state
 */
export const unlockAppForTests = async (password = 'TestPassword123!') => {
  // Initialize auth system
  await initialize();
  
  // Setup password if not already set
  const setupResult = await setupPassword(password);
  if (!setupResult.success) {
    throw new Error('Failed to setup password in test: ' + setupResult.error);
  }
  
  // Unlock the app
  const unlockResult = await unlockApp(password);
  if (!unlockResult.success) {
    throw new Error('Failed to unlock app in test: ' + unlockResult.error);
  }
  
  return true;
};

/**
 * Helper function to create a test chat in the registry
 * This ensures library operations have a valid chat to work with
 */
export const createTestChat = (chatId: string, storagePath?: string): ChatDescriptor => {
  const chat: ChatDescriptor = {
    id: chatId,
    name: `Test Chat ${chatId}`,
    kind: 'everyday',
    personaKey: 'general',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    storagePath: storagePath || `data/chats/${chatId}`,
    tags: [],
    secure: false,
  };
  
  // Add to registry
  const registry = JSON.parse(localStorage.getItem('monad_chat_registry') || '[]');
  registry.push(chat);
  localStorage.setItem('monad_chat_registry', JSON.stringify(registry));
  
  return chat;
};

/**
 * Helper function to reset test state
 * Clears localStorage and resets mocks
 */
export const resetTestState = () => {
  localStorage.clear();
};
