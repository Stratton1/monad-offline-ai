/**
 * diagnostics.ts
 * Purpose: Runtime diagnostics and health monitoring utilities
 * Usage: Used by App.tsx and DebugOverlay for boot diagnostics and health checks
 * Privacy: No external data transmission, local diagnostics only
 */

export interface BootDiagnostics {
  bootStage: string;
  cspMode: string;
  assetBase: string;
  backendStatus: 'connected' | 'retrying' | 'down' | 'unknown';
  lastError: string | null;
  timestamp: string;
}

export interface HealthCheckResult {
  healthy: boolean;
  status: string;
  responseTime?: number;
  error?: string;
}

/**
 * Check backend health with timeout
 */
export async function checkBackendHealth(timeoutMs = 5000): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch('http://localhost:8000/api/health/simple', {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        healthy: true,
        status: 'connected',
        responseTime,
      };
    } else {
      return {
        healthy: false,
        status: `http_${response.status}`,
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        healthy: false,
        status: 'timeout',
        responseTime,
        error: 'Request timeout',
      };
    }
    
    return {
      healthy: false,
      status: 'error',
      responseTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Health check loop with exponential backoff
 */
export async function healthCheckLoop(
  onStatusChange: (status: 'connected' | 'retrying' | 'down') => void,
  maxAttempts = 10
): Promise<void> {
  let attempt = 0;
  let consecutiveFailures = 0;
  
  while (attempt < maxAttempts) {
    const result = await checkBackendHealth(3000);
    
    if (result.healthy) {
      consecutiveFailures = 0;
      onStatusChange('connected');
      
      // If connected, continue checking every 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      consecutiveFailures++;
      
      if (consecutiveFailures >= 3) {
        onStatusChange('down');
      } else {
        onStatusChange('retrying');
      }
      
      // Exponential backoff: 500ms, 1s, 2s, 4s, 8s...
      const backoffMs = Math.min(500 * Math.pow(2, consecutiveFailures - 1), 8000);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
    
    attempt++;
  }
}

/**
 * Get current boot diagnostics
 */
export function getBootDiagnostics(): BootDiagnostics {
  const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') || 'unknown';
  
  return {
    bootStage: (window as any).__MONAD_BOOT_STAGE__ || 'unknown',
    cspMode: csp.includes('wasm-unsafe-eval') ? 'wasm-enabled' : 'strict',
    assetBase: import.meta.env.BASE_URL || './',
    backendStatus: (window as any).__MONAD_BACKEND_STATUS__ || 'unknown',
    lastError: (window as any).__MONAD_LAST_ERROR__ || null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log WASM load failure
 */
export function logWasmFailure(error: Error): void {
  console.warn('[Diagnostics] WASM load failed:', error);
  (window as any).__MONAD_LAST_ERROR__ = `WASM: ${error.message}`;
}

