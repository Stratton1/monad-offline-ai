/**
 * ActivityIndicator.tsx
 * Purpose: Displays connection status, encryption status, and idle state
 * Usage: Bottom-right indicator in dashboard
 * Privacy: Shows encryption status without exposing keys
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Shield, Clock } from 'lucide-react';
import { useBackend } from '../../hooks/useBackend';
import { getAuthState } from '../../lib/auth';

export default function ActivityIndicator() {
  const { isConnected } = useBackend();
  const authState = getAuthState();
  const [idleTime, setIdleTime] = useState(0);

  // Track idle time (simplified - would use auth manager's tracking)
  useEffect(() => {
    let lastActivity = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const idle = Math.floor((now - lastActivity) / 1000);
      setIdleTime(idle);
    }, 1000);

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      lastActivity = Date.now();
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearInterval(interval);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  const isIdle = idleTime > 300; // 5 minutes
  const hasEncryption = authState.appKey !== null;

  return (
    <div className="flex items-center gap-4 text-xs text-gray-400">
      {/* Backend Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span>Backend Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span>Backend Offline</span>
          </>
        )}
      </div>

      {/* Encryption Status */}
      {hasEncryption && (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400" />
          <span>Encrypted</span>
        </div>
      )}

      {/* Idle Status */}
      {isIdle && (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span>Idle: {Math.floor(idleTime / 60)}m</span>
        </div>
      )}
    </div>
  );
}
