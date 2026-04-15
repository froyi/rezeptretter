"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Minimal typing for the non-standard event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "rr-install-prompt";
const VISIT_COUNT_KEY = "rr-visit-count";
const MIN_VISITS = 2;

/**
 * Custom install prompt that appears after the user's 2nd visit.
 * Dismissable – won't show again after dismissal or installation.
 */
export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already dismissed or installed
    if (localStorage.getItem(STORAGE_KEY) === "dismissed") return;

    // Count visits
    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(count));

    if (count < MIN_VISITS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Also hide if app was installed
    const onInstalled = () => {
      setShow(false);
      localStorage.setItem(STORAGE_KEY, "dismissed");
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    }
    deferredPrompt.current = null;
    setShow(false);
  }, []);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "dismissed");
    deferredPrompt.current = null;
  }, []);

  if (!show) return null;

  return (
    <div
      id="install-prompt"
      className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 animate-slide-up"
    >
      <div className="bg-surface-container-high rounded-2xl shadow-2xl border border-outline-variant/10 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-2xl">
              install_mobile
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline font-bold text-on-surface">
              Rezeptretter installieren
            </p>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Schneller Zugriff direkt vom Startbildschirm
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-surface-container transition-colors shrink-0 -mt-1 -mr-1"
            aria-label="Schließen"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-xl">
              close
            </span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            id="install-prompt-dismiss"
            onClick={handleDismiss}
            className="flex-1 h-11 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm hover:bg-surface-container-highest transition-colors"
          >
            Nicht jetzt
          </button>
          <button
            id="install-prompt-install"
            onClick={handleInstall}
            className="flex-1 h-11 rounded-full hero-gradient text-white font-medium text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              download
            </span>
            Installieren
          </button>
        </div>
      </div>
    </div>
  );
}
