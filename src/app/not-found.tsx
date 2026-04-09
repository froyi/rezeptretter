import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <span className="material-symbols-outlined text-6xl text-outline-variant">
          search_off
        </span>
        <h1 className="text-4xl font-headline font-bold text-on-surface">
          404
        </h1>
        <p className="text-on-surface-variant">
          Diese Seite wurde nicht gefunden.
        </p>
        <Link
          href="/"
          className="inline-block hero-gradient text-on-primary font-semibold px-6 py-3 rounded-xl touch-target transition-transform hover:scale-105"
        >
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
