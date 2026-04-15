"use client";

import { AppShell } from "@/components/app-shell";
import { OfflineBanner } from "@/components/offline-banner";
import { InstallPrompt } from "@/components/install-prompt";

interface AppShellWrapperProps {
  children: React.ReactNode;
  userName: string;
  signOutAction: () => Promise<void>;
}

export function AppShellWrapper({
  children,
  userName,
  signOutAction,
}: AppShellWrapperProps) {
  return (
    <>
      <OfflineBanner />
      <AppShell userName={userName} onSignOut={() => signOutAction()}>
        {children}
      </AppShell>
      <InstallPrompt />
    </>
  );
}

