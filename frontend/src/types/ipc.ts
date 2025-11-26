/**
 * ipc.ts
 * Shared IPC payload types for Tauri invokes.
 * Privacy: Defines local-only file payloads; no external endpoints.
 */

import type { ChatMessage } from "../store/chatStore";

// Tauri InvokeArgs is Record<string, unknown> | number[] | ArrayBuffer | Uint8Array
// Our payloads are objects, so they must be compatible with Record<string, unknown>
export interface SecureFilePayload extends Record<string, unknown> {
  path: string;
  data: string;
}

export interface ExportPayload extends Record<string, unknown> {
  payload: {
    title: string;
    messages: ChatMessage[];
    createdAt: number;
  };
  filename: string;
}

export interface EnsureFolderPayload extends Record<string, unknown> {
  path: string;
}
