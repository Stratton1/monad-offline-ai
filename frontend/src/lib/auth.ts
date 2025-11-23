/**
 * auth.ts
 * Purpose: Authentication and encryption system for MONAD
 * Usage: Manages app unlock, password verification, idle locking, and journal passcode
 * Privacy: All operations local, keys never leave memory
 * Security: Argon2id for key derivation, AES-GCM for encryption, idle auto-lock
 */

import { deriveKey, encrypt, decrypt, hashPassword, verifyPassword, type EncryptedData } from './crypto/index';

export interface AuthState {
  isUnlocked: boolean;
  appKey: CryptoKey | null;
  journalKey: CryptoKey | null;
  isJournalUnlocked: boolean;
  hasPassword: boolean; // Whether a password has been set
  idleTimeout: number; // milliseconds
  lastActivity: number;
  idleTimer: number | null;
}

interface StoredAuthData {
  passwordHash: string;
  passwordHint?: string;
  salt: string; // Base64 encoded
  params?: {
    iterations?: number;
    parallelism?: number;
  };
  journalPasscodeHash?: string;
}

const DEFAULT_IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

class AuthManager {
  private state: AuthState = {
    isUnlocked: false,
    appKey: null,
    journalKey: null,
    isJournalUnlocked: false,
    hasPassword: false,
    idleTimeout: DEFAULT_IDLE_TIMEOUT,
    lastActivity: Date.now(),
    idleTimer: null,
  };

  private listeners: Set<() => void> = new Set();

  /**
   * Subscribe to auth state changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state changes
   */
  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  /**
   * Initialize auth state from storage
   * Resets unlock state since keys are only in memory
   */
  async initialize(): Promise<boolean> {
    const stored = this.loadAuthData();
    this.state.hasPassword = !!stored;
    // Reset unlock state - keys are in memory only, app starts locked
    this.state.isUnlocked = false;
    this.state.appKey = null;
    this.state.journalKey = null;
    this.state.isJournalUnlocked = false;
    if (!stored) {
      return false; // No password set, needs setup
    }
    return true; // Password exists, needs unlock
  }

  /**
   * Set the app password during setup
   */
  async setPassword(
    password: string,
    hint?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate password
      if (password.length < 12) {
        return { success: false, error: 'Password must be at least 12 characters' };
      }

      // Derive key
      const { key, salt, params } = await deriveKey(password);
      
      // Hash password for storage (never store plain password)
      const passwordHash = await hashPassword(password);

      // Encode salt to base64 for storage
      const saltBase64 = btoa(String.fromCharCode(...salt));

      // Store auth data
      const authData: StoredAuthData = {
        passwordHash,
        passwordHint: hint,
        salt: saltBase64,
        params: {
          iterations: params.iterations,
          parallelism: params.parallelism,
        },
      };

      // Store in localStorage (will be encrypted in production)
      localStorage.setItem('monad_auth_data', JSON.stringify(authData));

      // Set app key and unlock
      this.state.appKey = key;
      this.state.isUnlocked = true;
      this.state.hasPassword = true;
      this.updateActivity();

      this.notify();
      return { success: true };
    } catch (error) {
      console.error('[Auth] Failed to set password:', error);
      return { success: false, error: 'Failed to set password' };
    }
  }

  /**
   * Unlock the app with password
   */
  async unlock(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const stored = this.loadAuthData();
      if (!stored) {
        return { success: false, error: 'No password set' };
      }

      // Verify password
      const isValid = await verifyPassword(password, stored.passwordHash);
      if (!isValid) {
        return { success: false, error: 'Incorrect password' };
      }

      // Derive key from stored salt
      const saltArray = this.loadSalt();
      if (!saltArray) {
        return { success: false, error: 'Corrupted auth data' };
      }

      // Reconstruct params with salt
      const params = stored.params
        ? { salt: saltArray, ...stored.params }
        : { salt: saltArray };
      const { key } = await deriveKey(password, saltArray, params);
      
      this.state.appKey = key;
      this.state.isUnlocked = true;
      this.updateActivity();

      this.notify();
      return { success: true };
    } catch (error) {
      console.error('[Auth] Unlock failed:', error);
      return { success: false, error: 'Failed to unlock' };
    }
  }

  /**
   * Lock the app (clear keys from memory)
   */
  lock(): void {
    this.state.appKey = null;
    this.state.journalKey = null;
    this.state.isUnlocked = false;
    this.state.isJournalUnlocked = false;
    this.clearIdleTimer();
    this.notify();
  }

  /**
   * Set journal passcode
   */
  async setJournalPasscode(
    passcode: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.state.appKey) {
        return { success: false, error: 'App must be unlocked first' };
      }

      // Hash passcode for storage
      const passcodeHash = await hashPassword(passcode);

      // Store passcode hash
      const stored = this.loadAuthData();
      if (stored) {
        stored.journalPasscodeHash = passcodeHash;
        localStorage.setItem('monad_auth_data', JSON.stringify(stored));
      }

      // Derive journal key
      const { hkdf } = await import('./crypto/index');
      this.state.journalKey = await hkdf(
        this.state.appKey,
        `journal:${passcode}`
      );
      this.state.isJournalUnlocked = true;

      this.notify();
      return { success: true };
    } catch (error) {
      console.error('[Auth] Failed to set journal passcode:', error);
      return { success: false, error: 'Failed to set journal passcode' };
    }
  }

  /**
   * Unlock journal with passcode
   */
  async unlockJournal(
    passcode: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.state.appKey) {
        return { success: false, error: 'App must be unlocked first' };
      }

      const stored = this.loadAuthData();
      if (!stored?.journalPasscodeHash) {
        return { success: false, error: 'Journal passcode not set' };
      }

      // Verify passcode
      const isValid = await verifyPassword(passcode, stored.journalPasscodeHash);
      if (!isValid) {
        return { success: false, error: 'Incorrect passcode' };
      }

      // Derive journal key
      const { hkdf } = await import('./crypto/index');
      this.state.journalKey = await hkdf(
        this.state.appKey,
        `journal:${passcode}`
      );
      this.state.isJournalUnlocked = true;

      this.notify();
      return { success: true };
    } catch (error) {
      console.error('[Auth] Journal unlock failed:', error);
      return { success: false, error: 'Failed to unlock journal' };
    }
  }

  /**
   * Lock journal (clear journal key)
   */
  lockJournal(): void {
    this.state.journalKey = null;
    this.state.isJournalUnlocked = false;
    this.notify();
  }

  /**
   * Update last activity timestamp and reset idle timer
   */
  updateActivity(): void {
    this.state.lastActivity = Date.now();
    this.resetIdleTimer();
  }

  /**
   * Setup activity tracking listeners
   */
  setupActivityTracking(): void {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handler = () => this.updateActivity();
    
    events.forEach((event) => {
      window.addEventListener(event, handler, { passive: true });
    });
  }

  /**
   * Remove activity tracking listeners
   */
  removeActivityTracking(): void {
    // This would need to store handlers, simplified for now
    // In production, store handlers and remove them properly
  }

  /**
   * Reset idle timer
   */
  private resetIdleTimer(): void {
    this.clearIdleTimer();
    this.state.idleTimer = window.setTimeout(() => {
      this.lock();
    }, this.state.idleTimeout);
  }

  /**
   * Clear idle timer
   */
  private clearIdleTimer(): void {
    if (this.state.idleTimer !== null) {
      clearTimeout(this.state.idleTimer);
      this.state.idleTimer = null;
    }
  }

  /**
   * Set idle timeout
   */
  setIdleTimeout(timeout: number): void {
    this.state.idleTimeout = timeout;
    this.resetIdleTimer();
  }

  /**
   * Load auth data from storage
   */
  private loadAuthData(): StoredAuthData | null {
    try {
      const data = localStorage.getItem('monad_auth_data');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Load salt from storage
   */
  private loadSalt(): Uint8Array | null {
    try {
      const stored = this.loadAuthData();
      if (!stored?.salt) return null;
      const binary = atob(stored.salt);
      return new Uint8Array(binary.split('').map((c) => c.charCodeAt(0)));
    } catch {
      return null;
    }
  }

  /**
   * Get current auth state
   */
  getState(): Readonly<AuthState> {
    return { ...this.state };
  }

  /**
   * Encrypt data using app key
   */
  async encryptData(data: string): Promise<EncryptedData> {
    if (!this.state.appKey) {
      throw new Error('App must be unlocked to encrypt data');
    }
    return encrypt(data, this.state.appKey);
  }

  /**
   * Decrypt data using app key
   */
  async decryptData(encrypted: EncryptedData): Promise<string> {
    if (!this.state.appKey) {
      throw new Error('App must be unlocked to decrypt data');
    }
    return decrypt(encrypted, this.state.appKey);
  }

  /**
   * Encrypt data using journal key
   */
  async encryptJournalData(data: string): Promise<EncryptedData> {
    if (!this.state.journalKey) {
      throw new Error('Journal must be unlocked to encrypt data');
    }
    return encrypt(data, this.state.journalKey);
  }

  /**
   * Decrypt data using journal key
   */
  async decryptJournalData(encrypted: EncryptedData): Promise<string> {
    if (!this.state.journalKey) {
      throw new Error('Journal must be unlocked to decrypt data');
    }
    return decrypt(encrypted, this.state.journalKey);
  }
}

// Singleton instance
export const authManager = new AuthManager();

// Export convenience functions
export async function setupPassword(
  password: string,
  hint?: string
): Promise<{ success: boolean; error?: string }> {
  return authManager.setPassword(password, hint);
}

export async function unlockApp(
  password: string
): Promise<{ success: boolean; error?: string }> {
  return authManager.unlock(password);
}

export function lockApp(): void {
  authManager.lock();
}

export function getAuthState(): Readonly<AuthState> {
  return authManager.getState();
}

export function subscribeToAuth(callback: () => void): () => void {
  return authManager.subscribe(callback);
}

/**
 * Unlock journal with passcode
 */
export async function unlockJournal(
  passcode: string
): Promise<{ success: boolean; error?: string }> {
  return authManager.unlockJournal(passcode);
}

/**
 * Set journal passcode
 */
export async function setJournalPasscode(
  passcode: string
): Promise<{ success: boolean; error?: string }> {
  return authManager.setJournalPasscode(passcode);
}

/**
 * Lock journal
 */
export function lockJournal(): void {
  authManager.lockJournal();
}

/**
 * Initialize auth system and check if password is set
 */
export async function initialize(): Promise<boolean> {
  return authManager.initialize();
}

/**
 * Helper to encrypt data for local storage (after password is set)
 */
export async function encryptForLocal(data: unknown): Promise<string> {
  const state = authManager.getState();
  if (!state.appKey) {
    throw new Error('App must be unlocked to encrypt data');
  }
  const encrypted = await encrypt(JSON.stringify(data), state.appKey);
  return JSON.stringify(encrypted);
}

/**
 * Helper to decrypt data from local storage
 */
export async function decryptFromLocal(encryptedData: string): Promise<unknown> {
  const state = authManager.getState();
  if (!state.appKey) {
    throw new Error('App must be unlocked to decrypt data');
  }
  const encrypted: EncryptedData = JSON.parse(encryptedData);
  const decrypted = await decrypt(encrypted, state.appKey);
  return JSON.parse(decrypted);
}
