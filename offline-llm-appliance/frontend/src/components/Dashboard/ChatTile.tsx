/**
 * ChatTile.tsx
 * Purpose: Individual chat tile in dashboard grid
 * Usage: Displays chat name, icon, and description with lock state
 * Privacy: All operations local
 */

import { motion } from 'framer-motion';
import { Lock, MessageSquare, BookOpen, Briefcase, Newspaper } from 'lucide-react';
import type { ChatDescriptor } from '../../chats/registry';

interface ChatTileProps {
  descriptor: ChatDescriptor;
  onClick: () => void;
  isLocked?: boolean;
}

const icons: Record<ChatDescriptor['kind'], typeof MessageSquare> = {
  Everyday: MessageSquare,
  Journal: BookOpen,
  ProStudioA: Briefcase,
  ProStudioB: Briefcase,
  Dispatch: Newspaper,
};

const descriptions: Record<ChatDescriptor['kind'], string> = {
  Everyday: 'General conversations and everyday tasks',
  Journal: 'Personal journaling with encryption',
  ProStudioA: 'Professional assistance - A',
  ProStudioB: 'Professional assistance - B',
  Dispatch: 'Current affairs and news digest',
};

export default function ChatTile({ descriptor, onClick, isLocked }: ChatTileProps) {
  const Icon = icons[descriptor.kind] || MessageSquare;
  const description = descriptions[descriptor.kind] || 'Chat';

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <Lock className="w-8 h-8 text-yellow-400" />
        </div>
      )}

      {/* Icon */}
      <div className="mb-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 flex items-center justify-center border border-blue-500/30">
          <Icon className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 text-left">{descriptor.title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-400 text-left line-clamp-2">{description}</p>

      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600/0 to-violet-600/0 group-hover:from-blue-600/10 group-hover:to-violet-600/10 transition-all duration-300 pointer-events-none" />
    </motion.button>
  );
}
