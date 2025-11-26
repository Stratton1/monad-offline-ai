import { invoke } from "@tauri-apps/api/core";
import { isBrowser } from "./env";

const MONAD_STORAGE_KEYS = [
  "monad_config",
  "monad_chat_registry",
  "monad_wizard_tmp",
  "monad_wizard_encrypted",
  "monad_auth_data",
  "monad_auth_salt",
] as const;

export async function devResetApp(): Promise<void> {
  if (!isBrowser()) return;

  for (const key of MONAD_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }

  try {
    await invoke("dev_reset_app");
  } catch (error) {
    console.warn("dev_reset_app invoke failed", error);
  }

  window.location.reload();
}
