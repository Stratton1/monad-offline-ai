/**
 * TrayMenu.tsx
 * Purpose: System tray menu component providing controls for backend management and application lifecycle.
 * Usage: Placeholder component for future system tray integration with Tauri v2 APIs.
 * Privacy: Manages local backend processes only, no external data transmission.
 */

import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { isTauri } from '../lib/env';

interface TrayMenuProps {
  onStartBackend?: () => void;
  onStopBackend?: () => void;
  onQuit?: () => void;
}

export default function TrayMenu({ onStartBackend, onStopBackend, onQuit }: TrayMenuProps) {
  useEffect(() => {
    // Set up tray menu if in Tauri environment
    if (isTauri()) {
      // This would typically be handled in the Rust backend
      // For now, we'll just log that we're in Tauri mode
      console.log('Tauri environment detected - tray menu would be available');
    }
  }, []);

  const handleStartBackend = async () => {
    try {
      const result = await invoke('start_backend');
      console.log('Backend start result:', result);
      onStartBackend?.();
    } catch (error) {
      console.error('Failed to start backend:', error);
    }
  };

  const handleStopBackend = async () => {
    try {
      const result = await invoke('stop_backend');
      console.log('Backend stop result:', result);
      onStopBackend?.();
    } catch (error) {
      console.error('Failed to stop backend:', error);
    }
  };

  const handleQuit = async () => {
    try {
      await invoke('quit');
      onQuit?.();
    } catch (error) {
      console.error('Failed to quit:', error);
    }
  };

  // This component doesn't render anything visible
  // The tray menu is handled by the Rust backend
  // Functions are defined for future use
  console.log('TrayMenu functions available:', { handleStartBackend, handleStopBackend, handleQuit });
  return null;
}
