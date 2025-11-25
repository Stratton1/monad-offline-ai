/**
 * config.ts
 * Centralized application configuration (user preferences, privacy settings, themes).
 * Used across App shell, chat flows, and persistence guards to keep behaviour consistent.
 * Privacy: Configuration is stored locally in localStorage under `monad_config`; no remote sync.
 */

export type SavePreference = "always" | "ask" | "never";
export type SecurityLevel = "standard" | "secure";

export interface AppConfig {
  name: string;
  role: string;
  tone: string;
  language: string;
  goal: string;
  theme: string;
  interests: string[];
  securityLevel: SecurityLevel;
  savePreference: SavePreference;
  userName?: string;
  reasoningLevel?: "standard" | "deep";
  typingIndicator?: boolean;
  selectedModel?: string;
  autosave?: boolean;
  idleLockMinutes?: number;
}

export type MonadConfig = AppConfig;

export const DEFAULT_CONFIG: AppConfig = {
  name: "MONAD",
  role: "General AI",
  tone: "Professional",
  language: "English (UK)",
  goal: "Assist the user intelligently and privately.",
  theme: "Midnight",
  interests: [],
  securityLevel: "secure",
  savePreference: "ask",
  userName: "",
  reasoningLevel: "standard",
  typingIndicator: true,
  selectedModel: "Phi-3 Medium",
  autosave: false,
  idleLockMinutes: 15,
};

export function loadConfig(): AppConfig | null {
  try {
    const data = localStorage.getItem("monad_config");
    return data ? (JSON.parse(data) as AppConfig) : null;
  } catch {
    return null;
  }
}

export function saveConfig(cfg: AppConfig) {
  localStorage.setItem("monad_config", JSON.stringify(cfg));
}

export function clearConfig() {
  localStorage.removeItem("monad_config");
}

export function isConfigComplete(cfg: Partial<AppConfig> | null): cfg is AppConfig {
  if (!cfg) return false;
  const requiredStrings = [cfg.name, cfg.role, cfg.tone, cfg.language, cfg.goal, cfg.theme];
  if (requiredStrings.some((val) => !val || val.trim().length === 0)) {
    return false;
  }
  if (cfg.role === "General AI") {
    return false;
  }
  return Boolean(cfg.savePreference && cfg.securityLevel);
}

export function getConfigOrDefault(): AppConfig {
  const cfg = loadConfig();
  if (cfg) return cfg;
  return { ...DEFAULT_CONFIG };
}

export function shouldPersistLocally(cfg: AppConfig | null, preferenceOverride?: SavePreference): boolean {
  const effectivePreference = preferenceOverride ?? cfg?.savePreference;
  return effectivePreference === "always";
}
