/**
 * api.ts
 * Lightweight REST helpers for the local FastAPI backend.
 * Used by chat components and health indicators to talk to the on-device API only.
 * Privacy: All requests are local HTTP calls; no external endpoints are contacted.
 */

// ✅ Detect Tauri environment and set appropriate API base URL
import { isTauri } from "../lib/env";

const tauriDetected = isTauri();
const viteApi = typeof import.meta !== "undefined" && (import.meta as Record<string, any>).env?.VITE_API_URL;
export const API_BASE = tauriDetected
  ? "http://127.0.0.1:5005"
  : viteApi || "http://localhost:5005";

export interface GenerationResponse {
  response: string;
  metadata?: Record<string, unknown>;
}

export interface SimpleHealthResponse {
  status: "ok" | "healthy" | "warning" | "error" | string;
  message?: string;
  timestamp?: string;
}

// ✅ Core helper for text generation (returns plain response text)
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

    const data = (await res.json()) as GenerationResponse;
    return data.response || "⚠️ No response from model.";
  } catch (err) {
    console.error("❌ API error:", err);
    throw err;
  }
}

// ✅ Helper for health checks (returns structured status)
export async function checkHealth(): Promise<SimpleHealthResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/health/simple`);
    if (!res.ok) {
      return { status: "error", message: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as SimpleHealthResponse;
    return data;
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "unknown error" };
  }
}
