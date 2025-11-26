/**
 * CommandPalette.tsx
 * Central command palette for chat actions (export, clear, settings).
 * Used in active chat scaffolds; actions are all local/offline.
 * Privacy: Executes local callbacks only; no network calls.
 */

import { AnimatePresence, motion } from "framer-motion";

export interface CommandAction {
  title: string;
  description?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CommandAction[];
}

export default function CommandPalette({ isOpen, onClose, actions }: CommandPaletteProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xl bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Command Palette</h3>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white text-sm"
                aria-label="Close command palette"
              >
                Esc
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {actions.map((action) => (
                <button
                  key={action.title}
                  onClick={() => {
                    action.onSelect();
                    onClose();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="text-white text-sm font-semibold">{action.title}</div>
                  {action.description && (
                    <div className="text-xs text-gray-400 mt-1">{action.description}</div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
