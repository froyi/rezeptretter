"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Keeps the screen awake using the Wake Lock API.
 * Automatically re-acquires after tab visibility changes.
 */
export function useWakeLock(enabled = true) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const acquire = useCallback(async () => {
    if (!enabled || !("wakeLock" in navigator)) return;

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      wakeLockRef.current.addEventListener("release", () => {
        wakeLockRef.current = null;
      });
    } catch {
      // Wake Lock request failed (e.g. low battery)
    }
  }, [enabled]);

  const release = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  useEffect(() => {
    acquire();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        acquire();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      release();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [acquire, release]);

  return { acquire, release };
}
