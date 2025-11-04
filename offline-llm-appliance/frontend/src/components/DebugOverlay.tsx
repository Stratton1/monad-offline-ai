/**
 * DebugOverlay.tsx
 * Purpose: Runtime debug overlay showing app state for troubleshooting boot sequence issues.
 * Usage: Temporary debugging component to visualize state transitions in desktop runtime.
 * Privacy: Shows only local app state, no external data transmission.
 */

interface DebugOverlayProps {
  bootDone: boolean;
  setupDone: boolean;
  configChecked: boolean;
  currentStage: string;
  configSummary: string;
}

export default function DebugOverlay({ 
  bootDone, 
  setupDone, 
  configChecked, 
  currentStage, 
  configSummary 
}: DebugOverlayProps) {
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#00ff00',
        padding: '0.5rem',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '11px',
        zIndex: 9999,
        border: '1px solid #333',
        minWidth: '200px'
      }}
    >
      <div><strong>MONAD DEBUG</strong></div>
      <div>bootDone: {bootDone ? '✅' : '❌'}</div>
      <div>setupDone: {setupDone ? '✅' : '❌'}</div>
      <div>configChecked: {configChecked ? '✅' : '❌'}</div>
      <div>stage: {currentStage}</div>
      <div>config: {configSummary}</div>
      <div>time: {new Date().toLocaleTimeString()}</div>
    </div>
  );
}
