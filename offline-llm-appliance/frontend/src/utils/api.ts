// src/utils/api.ts

// ✅ Detect Tauri environment and set appropriate API base URL
const isTauri = !!(window as any).__TAURI__;
export const API_BASE = isTauri
  ? "http://127.0.0.1:8000"
  : (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

// ✅ Core helper for text generation
export async function generateText(prompt: string): Promise<string> {
  return sendMessage(prompt);
}

// ✅ Send message (alias for generateText)
export async function sendMessage(prompt: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    // Backend returns { "response": "..." }
    return data.response || data.output || data.text || "⚠️ No response from model.";
  } catch (err) {
    console.error("❌ API error:", err);
    throw err;
  }
}

// ✅ Optional helper for health checks
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health/simple`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ok" || data.status === "healthy";
  } catch {
    return false;
  }
}