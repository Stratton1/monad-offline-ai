/**
 * mocks.ts
 * Purpose: Shared mocks for test files
 * Usage: Import mocks in test files to avoid duplicate code
 */

import { vi } from 'vitest';

// Mock Tauri invoke
export const mockInvoke = vi.fn();

// Mock Tauri window
export const mockTauriWindow = {
  __TAURI__: {
    invoke: mockInvoke,
    tauri: {
      invoke: mockInvoke,
    },
  },
};

// Mock localStorage
export const createLocalStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
};
