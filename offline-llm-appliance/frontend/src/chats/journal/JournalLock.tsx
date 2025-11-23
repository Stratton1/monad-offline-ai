/**
 * JournalLock.tsx
 * Purpose: Passcode unlock screen for journal access
 * Usage: Gates JournalChat behind separate passcode
 * Privacy: Passcode verified locally, never transmitted
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { unlockJournal } from '../../lib/auth';

interface JournalLockProps {
  onUnlock: () => void;
}

export default function JournalLock({ onUnlock }: JournalLockProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await unlockJournal(passcode);
      if (result.success) {
        setPasscode('');
        onUnlock();
      } else {
        setError(result.error || 'Incorrect passcode');
        setPasscode('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setPasscode('');
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
            className="absolute w-1 h-1 bg-violet-400/20 rounded-full"
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
          <div className="w-20 h-20 mx-auto mb-6 bg-violet-600/20 rounded-full flex items-center justify-center border border-violet-500/30">
            <Lock className="w-10 h-10 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Journal Locked
          </h1>
          <p className="text-gray-400 text-sm">
            Enter your journal passcode to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(null);
              }}
              placeholder="Enter passcode"
              className="w-full p-4 rounded-xl bg-slate-700/50 backdrop-blur-sm text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-violet-400 border border-slate-600"
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading || !passcode.trim()}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? 'Unlocking...' : 'Unlock Journal'}
          </motion.button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-6">
          Journal entries are encrypted with a separate passcode.
        </p>
      </motion.div>
    </div>
  );
}
