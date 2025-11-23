/**
 * tests/setup.ts
 * Purpose: Test setup file for Vitest
 * Usage: Runs before all tests to configure test environment
 */

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock Tauri APIs
const mockInvoke = vi.fn().mockResolvedValue(undefined);
global.window = {
  ...global.window,
  __TAURI__: {
    invoke: mockInvoke,
    tauri: {
      invoke: mockInvoke,
    },
  },
  __TAURI_INTERNALS__: {
    invoke: mockInvoke,
  },
} as unknown as Window & typeof globalThis;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock argon2-browser to avoid native module issues
// Create a simple hash function that returns different hashes for different inputs
const mockHash = (input: Uint8Array): string => {
  // Simple hash: use first byte and length to create unique hash
  const seed = input[0] || 0;
  const length = input.length || 0;
  return `mock-hash-${seed}-${length}`;
};

vi.mock('argon2-browser', () => ({
  default: {
    ArgonType: {
      Argon2d: 0,
      Argon2i: 1,
      Argon2id: 2,
    },
    hash: vi.fn().mockImplementation(async (params: { pass: Uint8Array }) => {
      const hashStr = mockHash(params.pass);
      // Create a deterministic hash array based on input
      const hashArray = new Uint8Array(32);
      for (let i = 0; i < hashArray.length && i < params.pass.length; i++) {
        hashArray[i] = params.pass[i] || i;
      }
      return {
        hash: hashArray,
        encoded: hashStr,
      };
    }),
    verify: vi.fn().mockImplementation(async (params: { pass: Uint8Array; encoded: string }) => {
      // Verify by recreating hash and comparing
      const expectedHash = mockHash(params.pass);
      return expectedHash === params.encoded;
    }),
  },
}));

// Mock crypto.subtle for encryption tests (simplified to avoid native module issues)
// Create a mock key that can be extracted
const createMockKey = (extractable = true): CryptoKey => {
  return {
    type: 'secret',
    extractable,
    algorithm: { name: 'AES-GCM', length: 256 },
    usages: ['encrypt', 'decrypt', 'deriveKey', 'deriveBits'],
  } as unknown as CryptoKey;
};

// Track exported keys for verification
const keyStore = new Map<CryptoKey, ArrayBuffer>();

// Create mock crypto object
const mockCrypto = {
  subtle: {
    encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(0)) as unknown as SubtleCrypto['encrypt'],
    decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(0)) as unknown as SubtleCrypto['decrypt'],
    deriveKey: vi.fn().mockImplementation(async () => {
      const key = createMockKey(true); // Always extractable for HKDF
      keyStore.set(key, new ArrayBuffer(32));
      return key;
    }) as unknown as SubtleCrypto['deriveKey'],
    digest: vi.fn().mockImplementation(async (algorithm: string, data: ArrayBuffer) => {
      // Return a deterministic hash based on input for password verification
      const input = new Uint8Array(data);
      const hash = new Uint8Array(32);
      for (let i = 0; i < hash.length && i < input.length; i++) {
        hash[i] = input[i] ^ i;
      }
      return hash.buffer;
    }) as unknown as SubtleCrypto['digest'],
    generateKey: vi.fn().mockResolvedValue(createMockKey()) as unknown as SubtleCrypto['generateKey'],
    sign: vi.fn() as unknown as SubtleCrypto['sign'],
    verify: vi.fn() as unknown as SubtleCrypto['verify'],
    deriveBits: vi.fn().mockResolvedValue(new ArrayBuffer(32)) as unknown as SubtleCrypto['deriveBits'],
    importKey: vi.fn().mockImplementation(async (format: string, keyData: ArrayBuffer) => {
      const key = createMockKey(true); // Always extractable
      keyStore.set(key, keyData);
      return key;
    }) as unknown as SubtleCrypto['importKey'],
    exportKey: vi.fn().mockImplementation(async (format: string, key: CryptoKey) => {
      // Return stored key data or default
      return keyStore.get(key) || new ArrayBuffer(32);
    }) as unknown as SubtleCrypto['exportKey'],
    wrapKey: vi.fn() as unknown as SubtleCrypto['wrapKey'],
    unwrapKey: vi.fn() as unknown as SubtleCrypto['unwrapKey'],
  } as unknown as SubtleCrypto,
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
} as unknown as Crypto;

// Use vi.stubGlobal to override crypto (works in Node.js where crypto is read-only)
vi.stubGlobal('crypto', mockCrypto);

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorageMock.clear();
});
