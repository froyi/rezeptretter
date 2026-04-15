"use client";

import { useState, useEffect } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * Sticky banner shown when the device goes offline.
 * Shows a brief "Wieder online!" confirmation when reconnecting.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline) {
      // Just came back online
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      id="offline-banner"
      role="alert"
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 animate-slide-down ${
        isOnline
          ? "bg-primary text-white"
          : "bg-error-container text-on-error-container"
      }`}
    >
      <span className="material-symbols-outlined text-lg">
        {isOnline ? "wifi" : "wifi_off"}
      </span>
      {isOnline ? "Wieder online!" : "Du bist offline – einige Funktionen sind eingeschränkt"}
    </div>
  );
}
