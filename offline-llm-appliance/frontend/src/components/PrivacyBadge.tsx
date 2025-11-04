/**
 * PrivacyBadge.tsx
 * Purpose: Visual indicator component displaying privacy status, security level, and offline operation confirmation.
 * Usage: Displayed throughout the UI to reinforce privacy-first messaging and security status.
 * Privacy: Shows local privacy status only, no data collection or transmission.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PrivacyBadgeProps {
  isOnline: boolean;
  securityLevel: "standard" | "secure";
  className?: string;
}

export default function PrivacyBadge({ isOnline, securityLevel, className = "" }: PrivacyBadgeProps) {
  const [status, setStatus] = useState<"offline-secure" | "offline-unsecure" | "online">("offline-secure");

  useEffect(() => {
    if (isOnline) {
      setStatus("online");
    } else if (securityLevel === "secure") {
      setStatus("offline-secure");
    } else {
      setStatus("offline-unsecure");
    }
  }, [isOnline, securityLevel]);

  const getStatusConfig = () => {
    switch (status) {
      case "offline-secure":
        return {
          color: "bg-green-500",
          text: "Offline & Secure",
          icon: "🟢"
        };
      case "offline-unsecure":
        return {
          color: "bg-yellow-500",
          text: "Offline (Unsecured)",
          icon: "🟡"
        };
      case "online":
        return {
          color: "bg-red-500",
          text: "Network Detected",
          icon: "🔴"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.color} text-white ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-sm">{config.icon}</span>
      <span>{config.text}</span>
    </motion.div>
  );
}
