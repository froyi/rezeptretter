"use client";

import { AppShell } from "@/components/app-shell";

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
    <AppShell userName={userName} onSignOut={() => signOutAction()}>
      {children}
    </AppShell>
  );
}
