export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 p-8">
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-primary text-5xl">
              restaurant_menu
            </span>
            <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-primary">
              Rezeptretter
            </h1>
          </div>
          <p className="text-xl text-on-surface-variant max-w-lg mx-auto">
            Rette deine Lieblingsrezepte von jeder Webseite. Organisiere sie an
            einem Ort. Koch sie Schritt für Schritt nach.
          </p>
          <button className="hero-gradient text-on-primary font-semibold px-8 py-4 rounded-xl text-lg touch-target transition-transform hover:scale-105 active:scale-95">
            Kostenlos starten
          </button>
        </div>
      </div>
    </main>
  );
}
