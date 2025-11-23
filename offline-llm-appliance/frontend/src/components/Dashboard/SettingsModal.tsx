/**
 * SettingsModal.tsx
 * Purpose: Settings modal with profile, security, theme, and about tabs
 * Usage: Accessed via settings button or F10 (debug reset)
 * Privacy: All settings stored locally
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Shield, Palette, Info } from 'lucide-react';
import { useAppSessionStore } from '../../store/appSessionStore';
import { loadConfig, saveConfig } from '../../lib/config';
import { lockApp } from '../../lib/auth';

interface SettingsModalProps {
  onClose: () => void;
}

type Tab = 'profile' | 'security' | 'theme' | 'about';

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const config = loadConfig();
  const { theme, setTheme } = useAppSessionStore();
  const [lockTimeout, setLockTimeout] = useState(300); // 5 minutes default

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleSaveProfile = () => {
    if (config) {
      // Save config would update specific fields
      saveConfig(config);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-slate-800 rounded-xl border border-slate-700 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold">Settings</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    defaultValue={config?.name || ''}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <input
                    type="text"
                    defaultValue={config?.role || ''}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                  />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Idle Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={lockTimeout}
                    onChange={(e) => setLockTimeout(parseInt(e.target.value))}
                    min={60}
                    max={3600}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                  />
                </div>
                <button
                  onClick={() => lockApp()}
                  className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors"
                >
                  Lock App Now
                </button>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['dark', 'light', 'midnight', 'dim'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`px-4 py-3 rounded-lg border transition-colors ${
                          theme === t
                            ? 'bg-blue-600 border-blue-500'
                            : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">MONAD v3.7.0</h3>
                  <p className="text-sm text-gray-400">
                    Secure, Personalized & Professional Offline AI Platform
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Data Storage</h3>
                  <p className="text-sm text-gray-400">
                    All data stored locally in AppData directory.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">License</h3>
                  <p className="text-sm text-gray-400">MIT License</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
