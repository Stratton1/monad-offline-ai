/**
 * DebugOverlay.tsx
 * Purpose: Runtime debug overlay showing app state for troubleshooting boot sequence issues.
 * Usage: Accessible via Cmd+Shift+D in packaged builds, always visible in dev mode
 * Privacy: Shows only local app state, no external data transmission.
 */

import { useState, useEffect } from 'react';
import { getBootDiagnostics } from '../lib/diagnostics';

interface DebugOverlayProps {
  bootDone: boolean;
  setupDone: boolean;
  configChecked: boolean;
  currentStage: string;
  configSummary: string;
  backendStatus?: 'connected' | 'retrying' | 'down' | 'unknown';
}

export default function DebugOverlay({ 
  bootDone, 
  setupDone, 
  configChecked, 
  currentStage, 
  configSummary: _configSummary, // Unused but kept for API compatibility
  backendStatus = 'unknown'
}: DebugOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [diagnostics, setDiagnostics] = useState(getBootDiagnostics());

  // Check if debug mode is enabled
  const isDebugMode = (import.meta as any).env?.DEV || 
                      (window as any).__MONAD_DEBUG__ === true ||
                      (typeof process !== 'undefined' && (process.env as any)?.MONAD_DEBUG === '1');

  // Update diagnostics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDiagnostics(getBootDiagnostics());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cmd+Shift+D toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-show in debug mode
  useEffect(() => {
    if (isDebugMode) {
      setIsVisible(true);
    }
  }, [isDebugMode]);

  if (!isVisible && !isDebugMode) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#00ff00',
        padding: '0.75rem',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '11px',
        zIndex: 9999,
        border: '1px solid #333',
        minWidth: '250px',
        maxWidth: '400px',
        opacity: isVisible ? 1 : 0.3,
        transition: 'opacity 0.2s',
        cursor: 'pointer',
      }}
      onClick={() => setIsVisible(!isVisible)}
      title="Click to toggle / Cmd+Shift+D"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <strong>MONAD DEBUG</strong>
        <span style={{ fontSize: '9px', color: '#888' }}>Cmd+Shift+D</span>
      </div>
      <div>bootDone: {bootDone ? '✅' : '❌'}</div>
      <div>setupDone: {setupDone ? '✅' : '❌'}</div>
      <div>configChecked: {configChecked ? '✅' : '❌'}</div>
      <div>stage: {currentStage}</div>
      <div>backend: {backendStatus === 'connected' ? '🟢' : backendStatus === 'retrying' ? '🟡' : '🔴'} {backendStatus}</div>
      <div>csp: {diagnostics.cspMode}</div>
      <div>assetBase: {diagnostics.assetBase}</div>
      {diagnostics.lastError && (
        <div style={{ color: '#ff4444', marginTop: '0.5rem' }}>
          error: {diagnostics.lastError.substring(0, 40)}...
        </div>
      )}
      <div style={{ fontSize: '9px', color: '#888', marginTop: '0.5rem' }}>
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
