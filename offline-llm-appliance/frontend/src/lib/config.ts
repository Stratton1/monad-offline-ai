export interface MonadConfig {
  name: string;
  role: string;
  tone: string;
  language: string;
  goal: string;
  theme: string;
  interests: string[];
  securityLevel: "standard" | "secure";
  savePreference: "always" | "ask" | "never";
  userName?: string;
  reasoningLevel?: "standard" | "deep";
  typingIndicator?: boolean;
  selectedModel?: string;
  autosave?: boolean;
}

export const DEFAULT_CONFIG: MonadConfig = {
  name: "MONAD",
  role: "General AI",
  tone: "Professional",
  language: "English (UK)",
  goal: "Assist the user intelligently and privately.",
  theme: "Midnight",
  interests: [],
  securityLevel: "standard",
  savePreference: "always",
  userName: "",
  reasoningLevel: "standard",
  typingIndicator: true,
  selectedModel: "TinyLlama",
  autosave: true
};

export function loadConfig(): MonadConfig | null {
  try {
    const data = localStorage.getItem("monad_config");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveConfig(cfg: MonadConfig) {
  localStorage.setItem("monad_config", JSON.stringify(cfg));
}

export function clearConfig() {
  localStorage.removeItem("monad_config");
}
