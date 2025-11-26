/**
 * UIKitPreview.tsx
 * Minimal UI kit showcase for MONAD brand primitives (Button, Badge, Card, Input, Modal).
 * Intended for internal QA/design reference; not wired into the main app flow.
 * Privacy: Purely static sample data rendered locally; no storage or network usage.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const glassCard = 'bg-[rgba(20,24,32,0.6)] border border-white/10 backdrop-blur-xl shadow-xl';
const gradientText = 'bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent';

export default function UIKitPreview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('Stay offline. Stay private.');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-[0.2em]">MONAD UI Kit</p>
            <h1 className={`text-4xl font-bold ${gradientText}`}>Offline-first components</h1>
            <p className="text-gray-400">Everything here is rendered locally; zero external assets.</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 border border-blue-400/40">
            Glassmorphic • Dark default
          </span>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-2xl p-6 ${glassCard}`}>
            <h2 className="text-lg font-semibold mb-4">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold shadow-lg hover:shadow-blue-700/30 transition">
                Primary
              </button>
              <button className="px-4 py-2 rounded-lg border border-white/20 text-sm bg-white/5 hover:bg-white/10 transition">
                Ghost
              </button>
              <button className="px-4 py-2 rounded-lg bg-purple-600/70 hover:bg-purple-500 text-sm font-semibold shadow-lg transition">
                Accent
              </button>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${glassCard}`}>
            <h2 className="text-lg font-semibold mb-4">Badges & Chips</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 border border-blue-400/50">Offline</span>
              <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/15 border border-emerald-400/40">
                AES-GCM
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-amber-500/15 border border-amber-400/40">
                No telemetry
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-slate-700/70 border border-slate-500">Glass chip</span>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${glassCard}`}>
            <h2 className="text-lg font-semibold mb-4">Card</h2>
            <div className="rounded-xl p-5 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 shadow-xl">
              <p className="text-sm text-gray-400 mb-2">Status</p>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
                <span className="font-semibold">Local model active</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">0 bytes leave your device.</p>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${glassCard}`}>
            <h2 className="text-lg font-semibold mb-4">Input</h2>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-800/70 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Type securely..."
            />
            <p className="text-xs text-gray-500 mt-2">Local-only text field (no auto-complete, no telemetry).</p>
          </div>
        </section>

        <section className={`rounded-2xl p-6 ${glassCard}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Modal</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold shadow-lg hover:shadow-blue-700/30 transition"
            >
              Open sample modal
            </button>
          </div>
          <p className="text-sm text-gray-400">Uses framer-motion for subtle entrance/exit.</p>

          <AnimatePresence>
            {isModalOpen && (
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-full max-w-md rounded-2xl p-6 bg-slate-900/90 border border-white/10 shadow-2xl"
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-semibold ${gradientText}`}>Secure modal</h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-300 hover:text-white text-lg"
                      aria-label="Close modal"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    This modal is purely local. Use this pattern for confirmations, privacy notices, or save prompts.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-white/20 text-sm bg-white/5 hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold shadow-lg hover:shadow-blue-700/30 transition"
                    >
                      Confirm
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
