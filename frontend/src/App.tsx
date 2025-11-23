/**
 * App.tsx
 * Root shell that orchestrates boot → setup wizard → unlock → dashboard flows.
 * Used as the single React entry rendered by main.tsx in the Tauri/desktop bundle.
 * Privacy: Reads/writes local config and auth state from localStorage only; no data leaves the device.
 */
import { useState, useEffect, Suspense, lazy, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BootScreen from "./components/BootScreen";
import SetupWizard from "./components/SetupWizard";
import Dashboard from "./components/Dashboard";
import UnlockScreen from "./components/UnlockScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import TrayMenu from "./components/TrayMenu";
import DebugOverlay from "./components/DebugOverlay";
import { loadConfig, clearConfig, isConfigComplete } from "./lib/config";
import {
  authManager,
  getAuthState,
  subscribeToAuth,
  initialize,
} from "./lib/auth";
import { hasRegistry } from "./chats/registry";
import { isBrowser } from "./lib/env";

const DevUIKitPreview: ComponentType | null = import.meta.env.DEV
  ? lazy(() => import("./ui-kit/UIKitPreview"))
  : null;

export default function App() {
  const [bootDone, setBootDone] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const [configChecked, setConfigChecked] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentStage, setCurrentStage] = useState("boot");
  const [showDevUIKit, setShowDevUIKit] = useState(
    import.meta.env.DEV && isBrowser() && window.location.pathname.endsWith("/ui-kit")
  );
  const [, setIsTauri] = useState(false);

  // 🔐 Initialize auth and check unlock state
  useEffect(() => {
    if (!isBrowser()) return;
    const initAuth = async () => {
      try {
        const hasPassword = await initialize();
        const state = getAuthState();
        
        // If password is set, app must be unlocked
        if (hasPassword) {
          setIsUnlocked(state.isUnlocked);
          if (state.isUnlocked) {
            // Setup activity tracking when unlocked
            authManager.setupActivityTracking();
          }
        } else {
          // No password set, skip auth check (will be set during setup)
          setIsUnlocked(true);
        }
        
        setAuthInitialized(true);
      } catch (err) {
        console.error("[App] Auth initialization error:", err);
        setAuthInitialized(true);
        setIsUnlocked(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuth(() => {
      const state = getAuthState();
      setIsUnlocked(state.isUnlocked);
      if (state.isUnlocked) {
        authManager.setupActivityTracking();
      } else {
        authManager.removeActivityTracking();
      }
    });

    return () => {
      unsubscribe();
      authManager.removeActivityTracking();
    };
  }, []);

  // 🧠 Load config and check registry to determine whether setup is complete
  useEffect(() => {
    if (!authInitialized || !isBrowser()) return;

    console.log("[App] Starting config load...");
    try {
      // Check if chat registry exists (indicates setup complete)
      const registryExists = hasRegistry();
      
      const cfg = loadConfig();
      console.log("[App] Raw config loaded:", cfg);
      console.log("[App] Registry exists:", registryExists);
      
      // Setup is done if registry exists OR config is valid
      const isValid = registryExists || isConfigComplete(cfg);

      if (cfg?.securityLevel) {
        const idleMinutes = cfg.idleLockMinutes ?? (cfg.securityLevel === "secure" ? 15 : 60);
        authManager.setIdleTimeout(idleMinutes * 60 * 1000);
      }

      console.log("[App] Config validation result:", isValid);
      setSetupDone(!!isValid);
    } catch (err) {
      console.error("[App] Error loading config:", err);
      clearConfig();
      setSetupDone(false);
    } finally {
      console.log("[App] Setting configChecked to true");
      setConfigChecked(true);
    }

    // Detect Tauri
    setIsTauri(!!((window as unknown) as Record<string, unknown>).__TAURI__);
  }, [authInitialized]);

  // ⏱️ Fallback safety timer
  useEffect(() => {
    console.log("[App] Setting up 15s fallback timer");
    const timeout = setTimeout(() => {
      if (!bootDone) {
        console.warn("[App] ⚠️ Boot sequence timeout — forcing continue");
        setBootDone(true);
      }
    }, 15000);
    return () => clearTimeout(timeout);
  }, [bootDone]);

  // 🧩 Add global key listener for "Reset Setup" shortcut (Cmd/Ctrl+Shift+R)
  useEffect(() => {
    if (!isBrowser()) return;
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + R
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        const confirmed = window.confirm(
          "Reset MONAD setup? This will clear all configuration, chat registry, and local data. Continue?"
        );
        if (confirmed) {
          console.log("[App] 🔄 Reset shortcut triggered — clearing everything");
          clearConfig();
          localStorage.removeItem('monad_chat_registry');
          localStorage.removeItem('monad_wizard_tmp');
          localStorage.removeItem('monad_wizard_encrypted');
          localStorage.removeItem('monad_auth_data');
          localStorage.removeItem('monad_auth_salt');
          setSetupDone(false);
          setBootDone(true); // Skip boot again
          window.location.reload();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleBootComplete = () => {
    console.log("[App] ✅ Boot complete — moving to setup/dashboard");
    setBootDone(true);
  };

  const handleSetupComplete = () => {
    console.log("[App] ✅ Setup complete — moving to dashboard");
    setSetupDone(true);
    // After setup, ensure app is unlocked
    const state = getAuthState();
    if (!state.isUnlocked) {
      setIsUnlocked(true); // If no password was set, unlock automatically
    }
  };

  const handleUnlock = () => {
    console.log("[App] ✅ App unlocked");
    setIsUnlocked(true);
    authManager.setupActivityTracking();
  };

  // Add global unhandled rejection listener
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[App] Unhandled promise rejection:', event.reason);
      // Non-blocking: just log for now
      // In production, could show a toast notification
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  // Track current stage for debug overlay
  useEffect(() => {
    if (!configChecked) {
      setCurrentStage("loading");
    } else if (!bootDone) {
      setCurrentStage("boot");
    } else if (!setupDone) {
      setCurrentStage("setup");
    } else {
      setCurrentStage("dashboard");
    }
  }, [configChecked, bootDone, setupDone]);

  // Generate config summary for debug overlay
  const configSummary = (() => {
    if (!configChecked) return "loading...";
    try {
      const cfg = loadConfig();
      if (!cfg) return "none";
      return `${cfg.name || 'unnamed'}/${cfg.role || 'unset'}`;
    } catch {
      return "error";
    }
  })();

  // Log render state
  console.log("[App render] bootDone=", bootDone, "setupDone=", setupDone, "configChecked=", configChecked, "authInitialized=", authInitialized, "isUnlocked=", isUnlocked, "stage=", currentStage);

  if (import.meta.env.DEV && showDevUIKit && DevUIKitPreview) {
    return (
      <Suspense fallback={<div className="p-6 text-gray-400">Loading UI Kit…</div>}>
        <DevUIKitPreview />
      </Suspense>
    );
  }

  if (!authInitialized || !configChecked) {
    console.log("[App] Returning loading state - config not checked yet");
    return (
      <>
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px'
        }}>
          Loading config...
        </div>
        <DebugOverlay 
          bootDone={bootDone}
          setupDone={setupDone}
          configChecked={configChecked}
          currentStage={currentStage}
          configSummary={configSummary}
        />
      </>
    );
  }

  // Check if we need to show unlock screen
  const needsUnlock = authInitialized && configChecked && setupDone && !isUnlocked;

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black">
            <div className="p-6 text-gray-400">Loading…</div>
          </div>
        }
      >
        <TrayMenu />
        <DebugOverlay 
          bootDone={bootDone}
          setupDone={setupDone}
          configChecked={configChecked}
          currentStage={currentStage}
          configSummary={configSummary}
        />
        {import.meta.env.DEV && (
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setShowDevUIKit(true)}
              className="px-3 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-xs font-semibold shadow-lg"
            >
              Open UI Kit
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          {needsUnlock ? (
            <motion.div key="unlock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
              <UnlockScreen onUnlock={handleUnlock} />
            </motion.div>
          ) : !bootDone ? (
            <motion.div key="boot" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
              <BootScreen onComplete={handleBootComplete} />
            </motion.div>
          ) : !setupDone ? (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
              <SetupWizard onComplete={handleSetupComplete} />
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}
