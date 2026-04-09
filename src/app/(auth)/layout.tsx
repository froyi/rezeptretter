export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Logo Header */}
      <header className="w-full flex justify-center py-8">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">
            restaurant_menu
          </span>
          <h1 className="font-headline font-bold text-3xl tracking-tight text-primary">
            Rezeptretter
          </h1>
        </div>
      </header>

      {/* Auth Content */}
      <main className="flex-grow flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Decorative Blur Circles */}
      <div className="absolute top-12 left-12 w-32 h-32 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-24 right-12 w-48 h-48 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
