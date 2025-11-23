/**
 * env.ts
 * Environment helpers for safe platform detection.
 * Privacy: Purely local checks; no network or storage use.
 */

export interface MonadWindow extends Window {
  __TAURI__?: unknown;
}

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function isTauri(): boolean {
  return isBrowser() && "__TAURI__" in (window as MonadWindow);
}
