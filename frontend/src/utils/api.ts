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
  status: "ok" | "healthy" | "booting" | "degraded" | "warning" | "error" | string;
  message?: string;
  timestamp?: string;
  llm_status?: {
    initialized?: boolean;
    is_initializing?: boolean;
    model_path?: string;
    model_exists?: boolean;
    error?: string;
    message?: string;
  };
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

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 20000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Helper for health checks with extended timeout for model loading
 * Returns structured status
 */
export async function checkHealth(): Promise<SimpleHealthResponse> {
  try {
    // Use extended timeout (20s) to handle slow model initialization
    const res = await fetchWithTimeout(`${API_BASE}/api/health/simple`, {}, 20000);
    
    if (!res.ok) {
      return { status: "error", message: `HTTP ${res.status}` };
    }
    
    const data = (await res.json()) as SimpleHealthResponse;
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    
    // Don't log errors during expected boot/connection phases
    if (!message.includes("timeout") && !message.includes("fetch")) {
      console.debug("Backend health check failed:", message);
    }
    
    return { status: "error", message };
  }
}

/**
 * Check detailed backend health (includes LLM status)
 */
export async function checkDetailedHealth(): Promise<any> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/health`, {}, 20000);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.debug("Detailed health check failed:", error);
    throw error;
  }
}
