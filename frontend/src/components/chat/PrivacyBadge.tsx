/**
 * PrivacyBadge.tsx
 * Compact badge showing offline/connectivity and security posture for chats.
 * Used in chat headers to reinforce offline + lock status.
 * Privacy: Purely visual; reads local state only.
 */

import { useMemo } from "react";
import clsx from "clsx";

interface PrivacyBadgeProps {
  isOnline: boolean;
  securityLevel: "standard" | "secure";
  className?: string;
}

export default function PrivacyBadge({ isOnline, securityLevel, className }: PrivacyBadgeProps) {
  const { label, tone, dot } = useMemo(() => {
    if (!isOnline) {
      return {
        label: "Offline (local only)",
        tone: "bg-amber-500/15 border border-amber-400/30 text-amber-100",
        dot: "bg-amber-400",
      };
    }
    if (securityLevel === "secure") {
      return {
        label: "Secure • Local model active",
        tone: "bg-emerald-500/15 border border-emerald-400/30 text-emerald-100",
        dot: "bg-emerald-400",
      };
    }
    return {
      label: "Standard • Local model",
      tone: "bg-blue-500/15 border border-blue-400/30 text-blue-100",
      dot: "bg-blue-400",
    };
  }, [isOnline, securityLevel]);

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium",
        tone,
        className
      )}
    >
      <span className={clsx("h-2 w-2 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}
