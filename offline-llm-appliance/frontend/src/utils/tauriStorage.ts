// src/utils/tauriStorage.ts
// Tauri-specific storage utilities for desktop app

// Note: These imports will only work in Tauri environment
// import { invoke } from '@tauri-apps/api/core';
// import { appDataDir, join } from '@tauri-apps/api/path';
// import { writeTextFile, readTextFile, exists } from '@tauri-apps/api/fs';

const isTauri = !!(window as any).__TAURI__;

export async function getLocalPath(file: string): Promise<string> {
  if (!isTauri) {
    // Fallback for web environment
    return file;
  }
  
  try {
    // In Tauri environment, these would be available
    // const dir = await appDataDir();
    // return await join(dir, file);
    return file; // Placeholder for now
  } catch (error) {
    console.error('Error getting local path:', error);
    return file;
  }
}

export async function saveToLocalFile(filename: string, content: string): Promise<void> {
  if (!isTauri) {
    // Fallback for web environment - use localStorage
    localStorage.setItem(filename, content);
    return;
  }

  try {
    const filePath = await getLocalPath(filename);
    console.log('Would save to:', filePath); // Use the variable
    // await writeTextFile(filePath, content);
    localStorage.setItem(filename, content); // Fallback for now
  } catch (error) {
    console.error('Error saving to local file:', error);
    throw error;
  }
}

export async function loadFromLocalFile(filename: string): Promise<string | null> {
  if (!isTauri) {
    // Fallback for web environment - use localStorage
    return localStorage.getItem(filename);
  }

  try {
    const filePath = await getLocalPath(filename);
    const exists = await fileExists(filePath);
    if (!exists) return null;
    
    // return await readTextFile(filePath);
    return localStorage.getItem(filename); // Fallback for now
  } catch (error) {
    console.error('Error loading from local file:', error);
    return null;
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  if (!isTauri) {
    // Fallback for web environment
    return localStorage.getItem(filePath) !== null;
  }

  try {
    // return await exists(filePath);
    return localStorage.getItem(filePath) !== null; // Fallback for now
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

export async function exportConversation(messages: any[], filename?: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const defaultFilename = `MONAD_CHAT_${timestamp}.txt`;
  const finalFilename = filename || defaultFilename;
  
  const chatText = messages.map(msg => 
    `${msg.role}: ${msg.content}`
  ).join('\n\n');
  
  await saveToLocalFile(finalFilename, chatText);
}

export async function importConversation(filename: string): Promise<any[] | null> {
  try {
    const content = await loadFromLocalFile(filename);
    if (!content) return null;
    
    // Parse the conversation format
    const lines = content.split('\n\n');
    const messages = lines.map(line => {
      const [role, ...contentParts] = line.split(': ');
      return {
        role: role.trim(),
        content: contentParts.join(': ').trim(),
        timestamp: new Date(),
        id: crypto.randomUUID()
      };
    });
    
    return messages;
  } catch (error) {
    console.error('Error importing conversation:', error);
    return null;
  }
}
