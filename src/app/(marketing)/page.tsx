import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rezeptretter – Rezepte retten, organisieren, nachkochen",
  description:
    "Extrahiere Rezepte von jeder Webseite mit KI. Organisiere sie werbefrei und koche sie Schritt für Schritt nach.",
};

export default function LandingPage() {
  return (
    <>
      {/* ── Header (Fixed, Glassmorphism) ── */}
      <header className="glass-nav fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-center items-center py-5 w-full max-w-screen-xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary">
              restaurant_menu
            </span>
            <span className="font-headline font-bold text-4xl tracking-tighter text-primary">
              Rezeptretter
            </span>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-16">
        {/* ── Hero Section ── */}
        <section className="px-6 max-w-screen-xl mx-auto mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Copy */}
            <div className="lg:col-span-6 space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-medium text-sm">
                <span className="material-symbols-outlined mr-2 text-sm">
                  magic_button
                </span>
                KI-gestützte Extraktion
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-background leading-[1.1]">
                Rette deine Rezepte.
                <br />
                <span className="text-primary italic">Koch sie nach.</span>
              </h1>

              <p className="text-xl text-on-surface-variant leading-relaxed max-w-lg">
                Extrahiere Rezepte von jeder Webseite. Organisiere sie an einem
                Ort. Koch sie Schritt für Schritt nach – ganz ohne nervige
                Werbung.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-14 px-10 rounded-full hero-gradient text-white font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform hover:shadow-xl hover:shadow-primary/30"
                >
                  Kostenlos starten
                </Link>
              </div>
            </div>

            {/* Right: Hero Image + Floating Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl rotate-2">
                <Image
                  src="/images/hero.png"
                  alt="Frische Zutaten auf rustikaler Holzfläche – Tomaten, Basilikum, Olivenöl"
                  width={800}
                  height={1000}
                  className="w-full aspect-[4/5] object-cover"
                  priority
                />
              </div>

              {/* Blur Circles */}
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary-fixed/30 rounded-full blur-3xl -z-10" />

              {/* Floating UI Card – Desktop only */}
              <div className="absolute bottom-10 -right-4 z-20 bg-surface/90 backdrop-blur-xl p-6 rounded-lg shadow-xl max-w-xs hidden sm:block">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">
                      restaurant
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Linguine al Limone</p>
                    <p className="text-xs text-on-surface-variant">
                      Importiert von &lsquo;The Pasta Queen&rsquo;
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-primary rounded-full" />
                  </div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    Schritt 4 von 6
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Bento Grid ── */}
        <section className="bg-surface-container-low py-24">
          <div className="px-6 max-w-screen-xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Kochen war noch nie so entspannt.
              </h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
                Kein Scrollen durch endlose Blog-Texte mehr. Nur das Rezept, pur
                und perfekt organisiert.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Importieren */}
              <div className="bg-surface-container-lowest p-10 rounded-xl flex flex-col items-start gap-6 transition-transform duration-300 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl text-on-primary-fixed group-hover:text-white transition-colors duration-300">
                    download
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">Importieren</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    Kopiere einfach einen Link. Unsere KI findet die Zutaten und
                    Schritte automatisch für dich.
                  </p>
                </div>
              </div>

              {/* Organisieren */}
              <div className="bg-surface-container-lowest p-10 rounded-xl flex flex-col items-start gap-6 transition-transform duration-300 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl text-on-secondary-container group-hover:text-white transition-colors duration-300">
                    grid_view
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">Organisieren</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    Sortiere deine Schätze in Sammlungen. Erstelle
                    Einkaufslisten mit nur einem Klick.
                  </p>
                </div>
              </div>

              {/* Nachkochen */}
              <div className="bg-surface-container-lowest p-10 rounded-xl flex flex-col items-start gap-6 transition-transform duration-300 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center group-hover:bg-tertiary transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl text-on-tertiary-fixed group-hover:text-white transition-colors duration-300">
                    timer
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">Nachkochen</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    Der intelligente Kochmodus hält den Bildschirm wach und
                    führt dich Schritt für Schritt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="py-24 px-6 max-w-screen-xl mx-auto">
          <div className="bg-[#974400] rounded-xl overflow-hidden flex flex-col lg:flex-row items-center">
            <div className="p-12 lg:p-20 lg:w-1/2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Dein digitaler
                <br />
                Sous-Chef wartet.
              </h2>
              <p className="text-secondary-fixed text-lg">
                Hör auf, Screenshots zu machen oder Lesezeichen zu verlieren.
                Rezeptretter macht das Web zu deinem persönlichen Kochbuch.
              </p>
              <ul className="space-y-4 text-white/90">
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-secondary-fixed"
                    style={{
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    check_circle
                  </span>
                  Funktioniert auf 99% aller Webseiten
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-secondary-fixed"
                    style={{
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    check_circle
                  </span>
                  Keine Werbung, kein Drumherum
                </li>
                <li className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-secondary-fixed"
                    style={{
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    check_circle
                  </span>
                  Teile Rezepte mit Freunden
                </li>
              </ul>
              <div className="pt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-white text-primary font-bold text-lg active:scale-95 transition-transform hover:bg-white/90"
                >
                  Jetzt Rezepte retten
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 h-[400px] lg:h-[600px] w-full relative">
              <Image
                src="/images/cta-vegetables.png"
                alt="Bunte mediterrane Gemüse-Komposition – Paprika, Aubergine, Zucchini, Tomaten"
                fill
                className="object-cover"
                loading="lazy"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-8 text-center text-sm text-on-surface-variant">
        <p>© 2026 Rezeptretter. Made with 🧡</p>
      </footer>
    </>
  );
}
