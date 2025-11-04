/**
 * ExportDialog.tsx
 * Purpose: Dialog for exporting chats to PDF or RTF format
 * Usage: Used by ChatScaffold when user clicks export
 * Privacy: Exports are local only, includes privacy warning
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, File } from 'lucide-react';

interface ExportDialogProps {
  onExport: (format: 'pdf' | 'rtf') => Promise<void>;
  onClose: () => void;
}

export default function ExportDialog({ onExport, onClose }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'rtf' | null>(null);

  const handleExport = async (format: 'pdf' | 'rtf') => {
    setExportFormat(format);
    setIsExporting(true);
    try {
      await onExport(format);
      onClose();
    } catch (error) {
      console.error('[ExportDialog] Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Export Chat</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-400 mb-6">
            Export your conversation to a file. Note: Exported files are unencrypted.
          </p>

          {/* Format Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-slate-600 hover:border-blue-500 hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-8 h-8 text-blue-400" />
              <span className="font-semibold">PDF</span>
              <span className="text-xs text-gray-400">Portable Document Format</span>
              {isExporting && exportFormat === 'pdf' && (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
            </button>

            <button
              onClick={() => handleExport('rtf')}
              disabled={isExporting}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-slate-600 hover:border-blue-500 hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <File className="w-8 h-8 text-green-400" />
              <span className="font-semibold">RTF</span>
              <span className="text-xs text-gray-400">Rich Text Format</span>
              {isExporting && exportFormat === 'rtf' && (
                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          </div>

          {/* Privacy Warning */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <p className="text-xs text-yellow-300">
              ⚠️ Exported files are unencrypted. Store them securely.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
