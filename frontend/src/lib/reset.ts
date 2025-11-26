/**
 * reset.ts
 * Dev-only reset functionality that clears user config and onboarding state
 * PRESERVES: Model files in ~/Library/Application Support/ai.monad.offline/models/
 * CLEARS: User config, auth data, chat history, onboarding state
 */

import { invoke } from "@tauri-apps/api/core";
import { isBrowser } from "./env";

/**
 * localStorage keys to clear during reset
 * NOTE: Model-related keys are intentionally NOT included
 */
const MONAD_STORAGE_KEYS = [
  "monad_config",           // User configuration
  "monad_chat_registry",    // Chat history
  "monad_wizard_tmp",       // Onboarding temp data
  "monad_wizard_encrypted", // Encrypted onboarding data
  "monad_auth_data",        // Authentication data
  "monad_auth_salt",        // Auth salt
] as const;

/**
 * Reset app to first-run state (dev mode only)
 * - Clears localStorage config and onboarding state
 * - Clears app data directory (EXCEPT models/)
 * - Reloads the window to trigger setup wizard
 * - Model files are preserved (no re-download needed)
 */
export async function devResetApp(): Promise<void> {
  if (!isBrowser()) return;

  console.log("[DevReset] Starting dev reset...");
  console.log("[DevReset] Clearing localStorage keys:", MONAD_STORAGE_KEYS);

  // Clear localStorage
  for (const key of MONAD_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }

  console.log("[DevReset] Invoking Tauri dev_reset_app (preserves models/)...");
  
  // Clear app data directory (preserves models/)
  try {
    await invoke("dev_reset_app");
    console.log("[DevReset] ✓ App data cleared (models preserved)");
  } catch (error) {
    console.warn("[DevReset] dev_reset_app invoke failed:", error);
  }

  console.log("[DevReset] Reloading window...");
  window.location.reload();
}
