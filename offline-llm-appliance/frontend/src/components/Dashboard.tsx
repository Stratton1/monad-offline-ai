import React from "react";
import Chat from "./Chat";
import Sidebar from "./Sidebar";
import { loadConfig } from "../lib/config";

export default function Dashboard() {
  const config = loadConfig();

  return (
    <div className="h-screen w-full flex bg-slate-950 text-white">
      <Sidebar config={config} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">{config?.name || "MONAD"}</h1>
            <span className="text-sm text-slate-400">{config?.role || "Offline AI Assistant"}</span>
          </div>
          {config?.userName && (
            <div className="text-sm text-slate-300">
              Welcome back, {config.userName}
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto">
          <Chat config={config} />
        </div>
      </main>
    </div>
  );
}
