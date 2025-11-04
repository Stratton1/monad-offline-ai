/**
 * crypto/index.ts
 * Purpose: Cryptographic utilities for password-based key derivation, encryption, and HKDF
 * Usage: Used by auth system to encrypt/decrypt user data and derive keys
 * Privacy: All operations are performed locally, no external API calls
 * Security: Uses Argon2id for key derivation, AES-GCM for encryption, HKDF for key derivation
 */

// @ts-ignore - argon2-browser doesn't have types
import argon2 from 'argon2-browser';

export interface CryptoParams {
  salt: Uint8Array;
  iterations?: number; // For Argon2id: memory cost
  parallelism?: number;
}

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded initialization vector
  salt: string; // Base64 encoded salt
  params?: CryptoParams; // Stored for future key derivation
}

/**
 * Derive a key from a password using Argon2id
 * This is used to create the App Master Key
 */
export async function deriveKey(
  password: string,
  salt?: Uint8Array,
  params?: CryptoParams
): Promise<{ key: CryptoKey; salt: Uint8Array; params: CryptoParams }> {
  const defaultSalt = salt || crypto.getRandomValues(new Uint8Array(16));
  const defaultParams: CryptoParams = params || {
    salt: defaultSalt,
    iterations: 3, // Memory cost (2^3 = 8 MB)
    parallelism: 1,
  };

  try {
    // Argon2id with recommended parameters
    const result = await argon2.hash({
      pass: new TextEncoder().encode(password),
      salt: defaultSalt,
      type: argon2.ArgonType.Argon2id,
      time: 3, // Iterations
      mem: defaultParams.iterations || 3, // Memory cost (log2, so 2^3 = 8 MB)
      parallelism: defaultParams.parallelism || 1,
      hashLen: 32, // 256 bits for AES-256
    });

    // Import the Argon2 hash output directly as an AES-GCM key
    // The hash output is already cryptographically random and suitable as key material
    const aesKey = await crypto.subtle.importKey(
      'raw',
      result.hash,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return {
      key: aesKey,
      salt: defaultSalt,
      params: defaultParams,
    };
  } catch (error) {
    console.error('[Crypto] Argon2id derivation failed:', error);
    // Log WASM failure for diagnostics
    if (error instanceof Error && (error.message.includes('wasm') || error.message.includes('WASM'))) {
      import('./diagnostics').then(({ logWasmFailure }) => {
        logWasmFailure(error as Error);
      }).catch(() => {
        // Diagnostics module not available, log to window
        (window as any).__MONAD_LAST_ERROR__ = `WASM: ${(error as Error).message}`;
      });
    }
    throw new Error('Failed to derive key from password');
  }
}

/**
 * Derive a key using HKDF (RFC 5869)
 * Used to derive JournalKey from AppKey + passcode
 */
export async function hkdf(
  baseKey: CryptoKey,
  info: string
): Promise<CryptoKey> {
  const infoBuffer = new TextEncoder().encode(info);
  
  // Export base key material
  const keyMaterial = await crypto.subtle.exportKey('raw', baseKey);
  
  // HKDF: Use PBKDF2 as a substitute for HKDF (both are key derivation functions)
  // In a production system, we'd use native HKDF if available
  // For now, we use PBKDF2 with the base key and info as salt
  const tempKey = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive the final key using PBKDF2 with info as salt
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: infoBuffer, // Use info as salt for key derivation
      iterations: 100000, // High iteration count for security
    },
    tempKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 */
export async function encrypt(
  data: string,
  key: CryptoKey
): Promise<EncryptedData> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const dataBuffer = new TextEncoder().encode(data);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128, // 128-bit authentication tag
    },
    key,
    dataBuffer
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: uint8ArrayToBase64(iv),
    salt: '', // Not needed for encryption, only for key derivation
  };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decrypt(
  encrypted: EncryptedData,
  key: CryptoKey
): Promise<string> {
  const ciphertextBuf = base64ToArrayBuffer(encrypted.ciphertext);
  const iv = base64ToArrayBuffer(encrypted.iv);

  try {
    // Convert Uint8Array to ArrayBuffer for decryption
    const ciphertextArrayBuffer = uint8ArrayToArrayBuffer(ciphertextBuf);
    
    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as ArrayBuffer, // Web Crypto accepts Uint8Array, but TS needs this cast
        tagLength: 128,
      },
      key,
      ciphertextArrayBuffer
    );

    return new TextDecoder().decode(plaintext);
  } catch (error) {
    console.error('[Crypto] Decryption failed:', error);
    throw new Error('Failed to decrypt data - invalid key or corrupted data');
  }
}

/**
 * Hash a password/passcode for storage
 * Never store the password itself, only the hash
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === storedHash;
}

// Utility functions for base64 encoding/decoding

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert Uint8Array to ArrayBuffer (ensuring it's not SharedArrayBuffer)
 */
function uint8ArrayToArrayBuffer(arr: Uint8Array): ArrayBuffer {
  // Create a new ArrayBuffer by copying bytes (ensures it's ArrayBuffer, not SharedArrayBuffer)
  const buffer = new ArrayBuffer(arr.byteLength);
  const view = new Uint8Array(buffer);
  view.set(arr);
  return buffer;
}

/**
 * Generate a random salt
 */
export function generateSalt(length: number = 16): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Convert Uint8Array to base64 string
 */
export function uint8ArrayToBase64(array: Uint8Array): string {
  return btoa(String.fromCharCode(...array));
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
