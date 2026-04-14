import Link from "next/link";

export default function RezeptNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">
            search_off
          </span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-headline font-bold text-on-surface">
            Rezept nicht gefunden
          </h1>
          <p className="text-on-surface-variant leading-relaxed">
            Das Rezept existiert nicht oder wurde gelöscht.
          </p>
        </div>
        <Link
          href="/rezepte"
          className="inline-flex items-center gap-2 hero-gradient text-white rounded-full h-12 px-6 font-medium hover:brightness-110 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">
            arrow_back
          </span>
          Zurück zur Übersicht
        </Link>
      </div>
    </div>
  );
}
