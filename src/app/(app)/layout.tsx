export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* TopNavBar – wird im Shared-Components-Ticket implementiert */}
      <header className="sticky top-0 z-50 glass-nav px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            restaurant_menu
          </span>
          <span className="font-headline font-bold text-xl tracking-tighter text-primary">
            Rezeptretter
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-24 lg:pb-0 lg:pl-[260px]">{children}</main>

      {/* BottomNavBar (Mobile) – wird im Shared-Components-Ticket implementiert */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container rounded-t-[3rem] shadow-lg px-6 py-4 flex justify-around items-center lg:hidden">
        <button className="flex flex-col items-center gap-1 touch-target">
          <span className="material-symbols-outlined filled text-primary">home</span>
          <span className="text-xs font-label font-medium text-primary">Rezepte</span>
        </button>
        <button className="flex flex-col items-center gap-1 touch-target">
          <span className="material-symbols-outlined text-on-surface-variant">add_circle</span>
          <span className="text-xs font-label font-medium text-on-surface-variant">Importieren</span>
        </button>
        <button className="flex flex-col items-center gap-1 touch-target">
          <span className="material-symbols-outlined text-on-surface-variant">person</span>
          <span className="text-xs font-label font-medium text-on-surface-variant">Profil</span>
        </button>
      </nav>
    </div>
  );
}
