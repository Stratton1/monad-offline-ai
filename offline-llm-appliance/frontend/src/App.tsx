import React, { useState, useEffect } from "react";
import BootScreen from "./components/BootScreen";
import SetupWizard from "./components/SetupWizard";
import Dashboard from "./components/Dashboard";
import { loadConfig } from "./lib/config";

export default function App() {
  const [bootDone, setBootDone] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  useEffect(() => {
    const cfg = loadConfig();
    if (cfg && cfg.name && cfg.role) setSetupDone(true);
  }, []);

  if (!bootDone) return <BootScreen onComplete={() => setBootDone(true)} />;
  if (!setupDone) return <SetupWizard onComplete={() => setSetupDone(true)} />;
  return <Dashboard />;
}