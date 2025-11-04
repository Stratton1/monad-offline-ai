/**
 * ClipboardGuard.tsx
 * Purpose: Component wrapper to scrub clipboard on unmount
 * Usage: Wraps sensitive components (journal, passwords)
 * Privacy: Automatically scrubs clipboard when component unmounts
 */

import { useEffect } from 'react';
import { scrubClipboard } from '../lib/clipboard';

interface ClipboardGuardProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export default function ClipboardGuard({
  children,
  enabled = true,
}: ClipboardGuardProps) {
  useEffect(() => {
    if (!enabled) return;

    // Scrub clipboard on unmount
    return () => {
      scrubClipboard();
    };
  }, [enabled]);

  return <>{children}</>;
}
