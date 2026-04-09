import Link from "next/link";

interface TopNavBarProps {
  rightActions?: React.ReactNode;
}

export function TopNavBar({ rightActions }: TopNavBarProps) {
  return (
    <header className="fixed top-0 z-50 w-full glass-nav">
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-xl mx-auto">
        {/* Logo */}
        <Link href="/rezepte" className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">
            restaurant_menu
          </span>
          <h1 className="font-headline font-bold text-2xl tracking-tight text-primary">
            Rezeptretter
          </h1>
        </Link>

        {/* Right side: custom actions or default profile */}
        {rightActions ?? (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high ring-2 ring-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">
              person
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
