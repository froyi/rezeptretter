"use client";

import { useEffect } from "react";
import type { DarkModePreference } from "@/lib/types/database.types";

/**
 * Applies dark mode class to <html> based on preference.
 * Supports "system" (auto-detects OS), "light", or "dark".
 */
export function useDarkMode(preference: DarkModePreference) {
  useEffect(() => {
    const root = document.documentElement;

    function applyMode(isDark: boolean) {
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    if (preference === "dark") {
      applyMode(true);
      return;
    }

    if (preference === "light") {
      applyMode(false);
      return;
    }

    // System preference
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    applyMode(mq.matches);

    function onChange(e: MediaQueryListEvent) {
      applyMode(e.matches);
    }

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);
}
