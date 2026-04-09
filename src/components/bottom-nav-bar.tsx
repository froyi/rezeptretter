"use client";

import Link from "next/link";

type TabId = "rezepte" | "importieren" | "profil";

interface BottomNavBarProps {
  activeTab: TabId;
}

const tabs: { id: TabId; icon: string; label: string; href: string }[] = [
  { id: "rezepte", icon: "home", label: "Rezepte", href: "/rezepte" },
  {
    id: "importieren",
    icon: "add_circle",
    label: "Importieren",
    href: "/importieren",
  },
  { id: "profil", icon: "person", label: "Profil", href: "/profil" },
];

export function BottomNavBar({ activeTab }: BottomNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface rounded-t-[3rem] shadow-[0px_-12px_32px_rgba(50,18,0,0.06)] lg:hidden">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center justify-center touch-target transition-all duration-200 ${
              isActive
                ? "hero-gradient text-white rounded-full px-6 py-2 shadow-lg shadow-primary/10"
                : "text-stone-400 px-4 py-2 hover:text-primary"
            }`}
          >
            <span
              className={`material-symbols-outlined ${isActive ? "filled" : ""}`}
            >
              {tab.icon}
            </span>
            <span className="font-medium text-[12px] font-label">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
