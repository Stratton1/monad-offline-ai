/**
 * UnlockScreen.tsx
 * Purpose: Password unlock screen that gates app access
 * Usage: Displayed on app launch and after idle timeout
 * Privacy: Password is verified locally, never transmitted
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { unlockApp } from '../lib/auth';

interface UnlockScreenProps {
  onUnlock: () => void;
  isJournalUnlock?: boolean;
  onJournalUnlock?: () => void;
}

export default function UnlockScreen({
  onUnlock,
  isJournalUnlock = false,
  onJournalUnlock,
}: UnlockScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // For journal unlock, we need a different flow (will be implemented in Journal component)
      if (isJournalUnlock && onJournalUnlock) {
        // Journal unlock handled separately
        onJournalUnlock();
        return;
      }

      const result = await unlockApp(password);
      if (result.success) {
        setPassword('');
        onUnlock();
      } else {
        setError(result.error || 'Failed to unlock');
        setPassword('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white px-8 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <img
            src="/MONAD_Logo.svg"
            alt="MONAD"
            className="w-20 h-20 mx-auto mb-6 opacity-80"
          />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {isJournalUnlock ? 'Unlock Journal' : 'Unlock MONAD'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isJournalUnlock
              ? 'Enter your journal passcode to continue'
              : 'Enter your password to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder={isJournalUnlock ? 'Enter passcode' : 'Enter password'}
              className="w-full p-4 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 border border-slate-600"
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </motion.button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-6">
          0 bytes leave your device. Your password is verified locally.
        </p>
      </motion.div>
    </div>
  );
}
