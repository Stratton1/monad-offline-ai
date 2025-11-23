/**
 * DailyDigest.tsx
 * Purpose: Displays daily digest and good-news lane
 * Usage: Used by DispatchChat for news curation
 * Privacy: All content generated locally, no external sources
 * Note: Placeholder for future offline news generation
 */

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

interface DailyDigestProps {
  type: 'goodnews' | 'daily' | 'deepdives';
  interests?: string[];
  sourcesBias?: 'mainstream' | 'balanced' | 'independent';
}

export default function DailyDigest({
  type,
  interests: _interests,
  sourcesBias: _sourcesBias,
}: DailyDigestProps) {
  // Placeholder content - in production would generate from local sources
  const goodNewsItems = [
    {
      id: 1,
      title: 'Renewable Energy Milestone',
      excerpt: 'Solar capacity reached new heights this quarter.',
      category: 'Climate',
    },
    {
      id: 2,
      title: 'Medical Breakthrough',
      excerpt: 'New treatment shows promise in clinical trials.',
      category: 'Health',
    },
    {
      id: 3,
      title: 'Community Initiative',
      excerpt: 'Local project improves neighborhood wellbeing.',
      category: 'Social',
    },
  ];

  if (type === 'goodnews') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Good News</h3>
            <p className="text-sm text-gray-400">Positive stories curated for you</p>
          </div>
        </div>

        {goodNewsItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-green-400 font-medium">
                    {item.category}
                  </span>
                </div>
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-gray-300">{item.excerpt}</p>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <p className="text-xs text-blue-300">
            Note: In production, good news items would be generated from local news sources
            or user-curated feeds. This is a placeholder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-400">
        {type === 'daily' && 'Daily digest will be generated here.'}
        {type === 'deepdives' && 'Deep dive analysis coming soon.'}
      </p>
    </div>
  );
}
