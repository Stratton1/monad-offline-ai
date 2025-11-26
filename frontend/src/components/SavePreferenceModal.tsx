/**
 * SavePreferenceModal.tsx
 * Modal prompting users in "ask" mode to decide how chat history is stored for this session.
 * Used by chat shells to unblock persistence when savePreference === "ask".
 * Privacy: Choices apply only locally; no data leaves the device. Does not write config.
 */

import { motion, AnimatePresence } from "framer-motion";

interface SavePreferenceModalProps {
  isOpen: boolean;
  onSelect: (choice: "once" | "never" | "always" | "cancel") => void;
}

export default function SavePreferenceModal({ isOpen, onSelect }: SavePreferenceModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl p-6"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Save chat history?</h2>
              <p className="text-sm text-gray-300 mt-1">
                Data stays on this device. Choose how to handle this session.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => onSelect("once")}
                className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <div className="font-semibold text-white">Save once</div>
                <div className="text-sm text-gray-400">Persist this session now, ask again later.</div>
              </button>
              <button
                onClick={() => onSelect("always")}
                className="w-full text-left px-4 py-3 rounded-lg bg-blue-600/80 hover:bg-blue-500 border border-blue-400/50 transition-colors"
              >
                <div className="font-semibold text-white">Always save</div>
                <div className="text-sm text-gray-200">Persist chats locally for this session.</div>
              </button>
              <button
                onClick={() => onSelect("never")}
                className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <div className="font-semibold text-white">Never for this session</div>
                <div className="text-sm text-gray-400">Keep everything in memory only.</div>
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onSelect("cancel")}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
