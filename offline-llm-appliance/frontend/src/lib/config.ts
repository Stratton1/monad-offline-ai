export interface MonadConfig {
  userName: string;
  name: string;
  role: string;
  tone: string;
  language: string;
  goal: string;
  theme: string;
  interests: string[];
  emotion: string;
  energy: number;
  saveMode: "always" | "ask" | "never";
  securityLevel: "standard" | "secure";
  password?: string;
  selectedModel: string;
  reasoningLevel: "standard" | "deep";
  typingIndicator: boolean;
  autosave: boolean;
  privacyBadge: boolean;
}

export const DEFAULT_CONFIG: MonadConfig = {
  userName: "",
  name: "MONAD",
  role: "General AI",
  tone: "Professional",
  language: "English (UK)",
  goal: "Assist the user with intelligence and empathy.",
  theme: "Midnight",
  interests: [],
  emotion: "Calm",
  energy: 80,
  saveMode: "always",
  securityLevel: "standard",
  password: "",
  selectedModel: "TinyLlama",
  reasoningLevel: "standard",
  typingIndicator: true,
  autosave: true,
  privacyBadge: true,
};

const CONFIG_KEY = "monad-config";

export function saveConfig(config: Partial<MonadConfig>): void {
  try {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(fullConfig));
  } catch (error) {
    console.error("Failed to save config:", error);
  }
}

export function loadConfig(): MonadConfig | null {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return null;
    
    const config = JSON.parse(stored);
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    console.error("Failed to load config:", error);
    return null;
  }
}

export function clearConfig(): void {
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch (error) {
    console.error("Failed to clear config:", error);
  }
}
