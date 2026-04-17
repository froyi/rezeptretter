"use client";

import Link from "next/link";

type TabId = "rezepte" | "einkaufsliste" | "importieren" | "profil";

interface SidebarNavProps {
  activeTab: TabId;
  userName?: string;
  onSignOut?: () => void;
}

const navItems: { id: TabId; icon: string; label: string; href: string }[] = [
  { id: "rezepte", icon: "home", label: "Rezepte", href: "/rezepte" },
  {
    id: "einkaufsliste",
    icon: "shopping_cart",
    label: "Einkaufsliste",
    href: "/einkaufsliste",
  },
  {
    id: "importieren",
    icon: "add_circle",
    label: "Importieren",
    href: "/importieren",
  },
  { id: "profil", icon: "person", label: "Profil", href: "/profil" },
];

export function SidebarNav({
  activeTab,
  userName,
  onSignOut,
}: SidebarNavProps) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 w-[260px] flex-col bg-surface-container-low border-r border-outline-variant/30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <span className="material-symbols-outlined text-primary text-2xl">
          restaurant_menu
        </span>
        <span className="font-headline font-bold text-xl tracking-tight text-primary">
          Rezeptretter
        </span>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 px-6 py-4 mx-4 rounded-2xl bg-surface-container">
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-surface-variant text-xl">
            person
          </span>
        </div>
        <span className="text-sm font-medium text-on-surface truncate">
          {userName || "Benutzer"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-4 mt-6">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
                isActive
                  ? "hero-gradient text-white shadow-lg shadow-primary/10"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span
                className={`material-symbols-outlined ${isActive ? "filled" : ""}`}
              >
                {item.icon}
              </span>
              <span className="text-sm font-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      {onSignOut && (
        <div className="px-4 pb-6">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-label font-medium">Abmelden</span>
          </button>
        </div>
      )}
    </aside>
  );
}
