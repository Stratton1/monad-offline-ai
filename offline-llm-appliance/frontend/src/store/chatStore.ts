import { create } from "zustand";
import { loadConfig } from "../lib/config";

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
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, partial: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setLoading: (val: boolean) => void;
  loadMessages: () => void;
  saveMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,

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

  loadMessages: () => {
    try {
      const saved = localStorage.getItem("monad-chat-history");
      if (saved) {
        const messages = JSON.parse(saved).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        set({ messages });
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  },

  saveMessages: () => {
    try {
      const config = loadConfig();
      if (config?.autosave) {
        const state = useChatStore.getState();
        localStorage.setItem("monad-chat-history", JSON.stringify(state.messages));
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  },
}));