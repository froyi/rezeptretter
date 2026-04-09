import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* TopNavBar */}
      <header className="sticky top-0 z-50 glass-nav px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            restaurant_menu
          </span>
          <span className="font-headline font-bold text-xl tracking-tighter text-primary">
            Rezeptretter
          </span>
        </div>

        {/* User Info + Logout */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant hidden sm:inline">
              {user.user_metadata?.full_name || user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface-variant text-sm font-label font-medium hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                <span className="hidden sm:inline">Abmelden</span>
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 pb-24 lg:pb-0 lg:pl-[260px]">{children}</main>

      {/* BottomNavBar (Mobile) */}
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
