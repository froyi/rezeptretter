"use client";

import { usePathname } from "next/navigation";
import { TopNavBar } from "@/components/top-nav-bar";
import { BottomNavBar } from "@/components/bottom-nav-bar";
import { SidebarNav } from "@/components/sidebar-nav";

type TabId = "rezepte" | "importieren" | "profil";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  onSignOut?: () => void;
}

function getActiveTab(pathname: string): TabId {
  if (pathname.startsWith("/importieren")) return "importieren";
  if (pathname.startsWith("/profil")) return "profil";
  return "rezepte";
}

export function AppShell({ children, userName, onSignOut }: AppShellProps) {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  // Kochmodus: render children without any navigation chrome
  const isKochmodus = pathname.endsWith("/kochmodus");
  if (isKochmodus) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* TopNavBar – hidden on desktop (sidebar has logo) */}
      <div className="lg:hidden">
        <TopNavBar />
      </div>

      {/* Desktop Sidebar */}
      <SidebarNav
        activeTab={activeTab}
        userName={userName}
        onSignOut={onSignOut}
      />

      {/* Main Content */}
      <main className="pt-[72px] lg:pt-0 pb-32 lg:pb-8 lg:pl-[260px]">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNavBar activeTab={activeTab} />
    </div>
  );
}
