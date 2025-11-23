/**
 * clipboard.ts
 * Purpose: Clipboard scrubbing utilities for sensitive data
 * Usage: Used by journal and password fields to prevent clipboard leaks
 * Privacy: Scrubs clipboard after sensitive operations
 * Security: Prevents clipboard persistence for sensitive data
 */

/**
 * Scrub clipboard after sensitive operation
 */
export async function scrubClipboard(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      // Clear clipboard after short delay
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText('');
        } catch (error) {
          // Ignore clipboard errors
          console.warn('[Clipboard] Failed to scrub clipboard:', error);
        }
      }, 100);
    }
  } catch (error) {
    // Clipboard API may not be available
    console.warn('[Clipboard] Clipboard scrubbing not available:', error);
  }
}

/**
 * Copy sensitive data with auto-scrub
 */
export async function copySensitive(
  text: string,
  scrubDelay: number = 5000
): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      
      // Scrub after delay
      setTimeout(async () => {
        await scrubClipboard();
      }, scrubDelay);
    }
  } catch (error) {
    console.error('[Clipboard] Failed to copy sensitive data:', error);
    throw error;
  }
}

/**
 * Check if clipboard API is available
 */
export function isClipboardAvailable(): boolean {
  return typeof navigator !== 'undefined' &&
    navigator.clipboard !== undefined &&
    navigator.clipboard.writeText !== undefined;
}
