/**
 * chatStore.ts
 * Stateful chat history store for message stream and loading flags.
 * Used by Chat components across dashboards and chat variants.
 * Privacy: Stores messages in memory; optional encrypted persistence (Tauri secure file or encrypted localStorage)
 * based on user save preferences.
 */
import { create } from "zustand";
import { loadConfig } from "../lib/config";
import { encryptForLocal, decryptFromLocal } from "../lib/auth";
import { isTauri } from "../lib/env";
import { isBrowser } from "../lib/env";

const CHAT_HISTORY_KEY = "monad-chat-history";

const PERSIST_PATH = "data/session/chat_history.enc";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  loading?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  persistenceChoice: "always" | "never" | "once" | null;
  needsPersistenceDecision: boolean;
  /** Append a new chat message to the current session */
  addMessage: (msg: ChatMessage) => void;
  /** Update a message by id with partial fields (e.g., replace placeholder content) */
  updateMessage: (id: string, partial: Partial<ChatMessage>) => void;
  /** Clear in-memory message history */
  clearMessages: () => void;
  /** Toggle loading state for the chat UI */
  setLoading: (val: boolean) => void;
  /** Set persistence choice for this session (ask mode) */
  setPersistenceChoice: (choice: "always" | "never" | "once" | null) => void;
  /** Clear/acknowledge persistence prompt without changing choice */
  clearPersistencePrompt: () => void;
  /** Load persisted messages (if allowed by user config) */
  loadMessages: () => void;
  /** Persist messages (if allowed by user config) */
  saveMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => {
  const resolveShouldPersist = async (): Promise<boolean> => {
    if (!isBrowser()) return false;
    const config = loadConfig();
    if (!config) return false;
    if (config.savePreference === "always") return true;
    if (config.savePreference === "never") return false;

    const choice = get().persistenceChoice;
    if (choice === "always") return true;
    if (choice === "never") return false;
    if (choice === "once") {
      set({ persistenceChoice: null });
      return true;
    }

    set({ needsPersistenceDecision: true });
    return false;
  };

  return {
  messages: [],
  isLoading: false,
  persistenceChoice: null,
  needsPersistenceDecision: false,

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  updateMessage: (id, partial) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...partial } : m
      ),
    })),

  clearMessages: () => set({ messages: [] }),

  setLoading: (val) => set({ isLoading: val }),

  setPersistenceChoice: (choice) =>
    set({
      persistenceChoice: choice,
      needsPersistenceDecision: false,
    }),

  clearPersistencePrompt: () => set({ needsPersistenceDecision: false }),

  loadMessages: () => {
    (async () => {
      try {
        if (!(await resolveShouldPersist())) return;

        if (!isBrowser()) return;
        let encrypted: string | null = null;
        const isTauriEnv = isTauri();

        if (isTauriEnv) {
          const { invoke } = await import("@tauri-apps/api/core");
          try {
            encrypted = await invoke<string>("read_secure_file", { path: PERSIST_PATH });
          } catch {
            encrypted = null;
          }
        } else {
          encrypted = localStorage.getItem(CHAT_HISTORY_KEY);
        }

        if (!encrypted) return;

        const decrypted = await decryptFromLocal(encrypted);
        const parsed = (decrypted as ChatMessage[]).map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        set({ messages: parsed });
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    })();
  },

  saveMessages: () => {
    (async () => {
      try {
        if (!(await resolveShouldPersist())) return;
        if (!isBrowser()) return;

        const state = useChatStore.getState();
        const encrypted = await encryptForLocal(state.messages);
        const isTauriEnv = isTauri();

        if (isTauriEnv) {
          const { invoke } = await import("@tauri-apps/api/core");
          await invoke("write_secure_file", { path: PERSIST_PATH, data: encrypted });
        } else {
          localStorage.setItem(CHAT_HISTORY_KEY, encrypted);
        }
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
    })();
  },
  };
}); 
