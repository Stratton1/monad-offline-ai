import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadConfig, saveConfig, clearConfig } from "../lib/config";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExportChat?: () => void;
  onClearHistory?: () => void;
  onSwitchModel?: (model: string) => void;
  onToggleReasoning?: () => void;
}

const commands = [
  {
    id: "reset-setup",
    title: "Reset Setup",
    description: "Clear configuration and restart wizard",
    action: "reset"
  },
  {
    id: "export-chat",
    title: "Export Chat",
    description: "Save current conversation to file",
    action: "export"
  },
  {
    id: "import-context",
    title: "Import Context",
    description: "Upload PDF/DOCX/TXT files",
    action: "import"
  },
  {
    id: "switch-model",
    title: "Switch Model",
    description: "Toggle between TinyLlama / Phi-3",
    action: "model"
  },
  {
    id: "toggle-reasoning",
    title: "Toggle Reasoning",
    description: "Change reasoning depth",
    action: "reasoning"
  },
  {
    id: "clear-history",
    title: "Clear History",
    description: "Wipe chat records",
    action: "clear"
  },
  {
    id: "view-privacy",
    title: "View Privacy",
    description: "Show security status",
    action: "privacy"
  },
  {
    id: "save-session",
    title: "Save Session",
    description: "Manually save current session",
    action: "save"
  }
];

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  onExportChat, 
  onClearHistory, 
  onSwitchModel, 
  onToggleReasoning 
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleCommand(filteredCommands[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  const handleCommand = (command: typeof commands[0]) => {
    switch (command.action) {
      case "reset":
        if (confirm("Are you sure you want to reset all settings?")) {
          clearConfig();
          window.location.reload();
        }
        break;
      case "export":
        onExportChat?.();
        break;
      case "import":
        // Trigger file input
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf,.docx,.txt";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            console.log("File selected:", file.name);
            // Handle file import here
          }
        };
        input.click();
        break;
      case "model":
        const currentConfig = loadConfig();
        const newModel = currentConfig?.selectedModel === "TinyLlama" ? "Phi-3" : "TinyLlama";
        saveConfig({ selectedModel: newModel });
        onSwitchModel?.(newModel);
        break;
      case "reasoning":
        const config = loadConfig();
        const newReasoning = config?.reasoningLevel === "standard" ? "deep" : "standard";
        saveConfig({ reasoningLevel: newReasoning });
        onToggleReasoning?.();
        break;
      case "clear":
        if (confirm("Are you sure you want to clear all chat history?")) {
          onClearHistory?.();
        }
        break;
      case "privacy":
        alert("Privacy Status: Offline & Secure");
        break;
      case "save":
        // Trigger manual save
        console.log("Manual save triggered");
        break;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 border border-slate-600"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-slate-600">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-lg"
            />
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-4 text-slate-400 text-center">
                No commands found
              </div>
            ) : (
              filteredCommands.map((command, index) => (
                <motion.button
                  key={command.id}
                  className={`w-full p-4 text-left hover:bg-slate-700 transition-colors ${
                    index === selectedIndex ? "bg-slate-700" : ""
                  }`}
                  onClick={() => handleCommand(command)}
                  whileHover={{ backgroundColor: "rgba(51, 65, 85, 0.5)" }}
                >
                  <div className="font-medium text-white">{command.title}</div>
                  <div className="text-sm text-slate-400">{command.description}</div>
                </motion.button>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-slate-600 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>↑↓ Navigate</span>
              <span>Enter Select</span>
              <span>Esc Close</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
