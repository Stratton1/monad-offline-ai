/**
 * InterestOnboarding.tsx
 * Purpose: Modal for selecting interests (minimum 10 required)
 * Usage: First-time setup for Dispatch chat
 * Privacy: Interests stored locally only
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const INTEREST_OPTIONS = [
  'Technology',
  'Science',
  'Politics',
  'Business',
  'Health',
  'Climate',
  'Sports',
  'Arts',
  'Culture',
  'Education',
  'Finance',
  'International',
  'Local',
  'Entertainment',
  'Innovation',
  'Social Issues',
  'Economy',
  'Environment',
  'Medicine',
  'Space',
  'AI',
  'Privacy',
  'Cybersecurity',
  'Renewable Energy',
];

interface InterestOnboardingProps {
  minInterests: number;
  onComplete: (interests: string[]) => void;
}

export default function InterestOnboarding({
  minInterests,
  onComplete,
}: InterestOnboardingProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelected((current) =>
      current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest]
    );
  };

  const canComplete = selected.length >= minInterests;

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Select Your Interests</h2>
          <p className="text-gray-400 text-sm">
            Choose at least {minInterests} interests to personalize your Dispatch feed.
          </p>
          <p className="text-blue-400 text-sm mt-2">
            Selected: {selected.length} / {minInterests}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 max-h-96 overflow-y-auto mb-6">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                selected.includes(interest)
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
              }`}
            >
              {interest}
              {selected.includes(interest) && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => onComplete(selected)}
            disabled={!canComplete}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue ({selected.length} selected)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
