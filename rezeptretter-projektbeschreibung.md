# Rezeptretter – Projektbeschreibung

## Vision

**Rezeptretter** ist eine Progressive Web App (PWA), die Rezepte aus verschiedenen Online-Quellen extrahiert, normalisiert und in einem einheitlichen Format speichert. Im Mittelpunkt steht ein **Kochmodus**, der das Nachkochen so einfach wie möglich macht – Schritt für Schritt, mit Timer und immer sichtbaren Zutaten.

Das Problem: Rezepte sammeln sich überall an – in Instagram-Saves, Chefkoch-Lesezeichen, Browser-Tabs. Man findet sie nicht wieder, die Seiten sind vollgestopft mit Werbung, und beim Kochen scrollt man sich die Finger wund. Rezeptretter löst das.

## Zielgruppe

Menschen, die regelmäßig kochen und Rezepte aus dem Internet sammeln. Primär Mobile-Nutzung (Handy in der Küche), aber auch Desktop zum Organisieren.

## Tech-Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **KI:** Claude API (für spätere Erweiterungen: Instagram, Foto-Import)
- **Hosting:** Vercel
- **PWA:** Installierbar, Offline-fähig, Share Target

## Design-Richtlinien

- **Mobile-First** – die App wird primär auf dem Handy in der Küche genutzt
- **Cleanes, warmes Design** – keine Überladung, großzügiger Whitespace
- **Große Touch-Targets** – Bedienung mit nassen/mehligen Händen
- **Kochmodus optimiert für Lesbarkeit** – große Schrift, hoher Kontrast
- **Farbpalette:** Warme, appetitliche Töne (z.B. sanftes Orange/Terracotta als Akzentfarbe, warmes Weiß als Hintergrund, dunkles Grau für Text)

---

## Screens & Funktionsbeschreibungen

### 1. Landing Page / Marketing

**Zweck:** Neue Nutzer überzeugen, sich zu registrieren.

**Inhalte:**
- Headline: "Rette deine Rezepte. Koch sie nach." (o.ä.)
- Kurze Beschreibung: "Extrahiere Rezepte von jeder Webseite. Organisiere sie an einem Ort. Koch sie Schritt für Schritt nach."
- 3 Feature-Highlights mit Icons:
  - **Importieren:** "Füge eine URL ein – Rezeptretter extrahiert das Rezept automatisch"
  - **Organisieren:** "Alle Rezepte an einem Ort, übersichtlich und werbefrei"
  - **Nachkochen:** "Kochmodus mit Schritt-für-Schritt-Anleitung und Timer"
- CTA-Button: "Kostenlos starten"
- Vorschau-Mockup der App (optional)

**Layout:** Single-Page, vertikal scrollbar, Hero-Section oben mit CTA.

---

### 2. Login / Registrierung

**Zweck:** Authentifizierung für neue und bestehende Nutzer.

**Inhalte:**
- App-Logo + Name "Rezeptretter"
- Tab-Umschalter: "Anmelden" / "Registrieren"
- **Anmelden:** E-Mail + Passwort + "Anmelden"-Button + "Passwort vergessen?"-Link
- **Registrieren:** E-Mail + Passwort + Passwort bestätigen + "Registrieren"-Button
- Alternativ: "Magic Link per E-Mail senden" (passwortlos)
- Später: Social Login (Google)

**Layout:** Zentrierte Card auf dem Screen, minimalistisch.

---

### 3. Rezept-Übersicht (Hauptscreen nach Login)

**Zweck:** Alle gespeicherten Rezepte des Nutzers auf einen Blick.

**Inhalte:**
- **Header:** App-Name links, Profilbild/Avatar rechts (Klick öffnet Profil-Menü)
- **Import-Button:** Prominenter FAB (Floating Action Button) oder Top-Bar-Button mit "+"-Icon → führt zum Import-Screen
- **Suchleiste:** Oben, durchsucht Titel und Zutaten
- **Rezept-Grid:** Karten in einem responsiven Grid (2 Spalten mobil, 3-4 Desktop)
  - Jede **Rezeptkarte** zeigt:
    - Rezeptbild (oder Platzhalter-Grafik wenn kein Bild vorhanden)
    - Titel (max. 2 Zeilen, danach abgeschnitten)
    - Quelle-Icon (Chefkoch-Logo, generisches Web-Icon, etc.)
    - Zubereitungszeit (wenn vorhanden)
- **Empty State** (wenn noch keine Rezepte): Illustration + "Importiere dein erstes Rezept" + Button

**Interaktionen:**
- Klick auf Rezeptkarte → Rezeptdetail
- Long-Press / Rechtsklick → Kontextmenü (Löschen, Bearbeiten)
- Pull-to-Refresh auf Mobil
- Suchfeld filtert Rezepte in Echtzeit

**Layout:** App-Shell mit festem Header, scrollbarer Content-Bereich.

---

### 4. Rezept importieren

**Zweck:** Neues Rezept per URL importieren.

**Inhalte:**
- **URL-Eingabefeld:** Großes, prominentes Textfeld mit Placeholder "Rezept-URL einfügen..."
- **Einfügen-Button:** Neben dem Textfeld (Clipboard-Icon für "Aus Zwischenablage einfügen")
- **Import-Button:** "Rezept importieren" – löst die Extraktion aus
- **Ladezustand:** Skeleton-Loading oder Spinner mit "Rezept wird extrahiert..."
- **Vorschau nach Extraktion:**
  - Rezeptbild
  - Titel (editierbar)
  - Zutaten-Liste (editierbar)
  - Zubereitungsschritte (editierbar)
  - Portionen, Zeiten (editierbar)
  - Quelle (URL, automatisch befüllt)
- **Speichern-Button:** "Rezept speichern" – speichert in die Datenbank
- **Fehlerzustand:** "Rezept konnte nicht extrahiert werden" + Hinweis, manuell einzugeben

**Interaktionen:**
- URL einfügen → "Importieren" klicken → Ladeanimation → Vorschau erscheint
- Nutzer kann alle Felder vor dem Speichern bearbeiten/korrigieren
- "Speichern" → Weiterleitung zur Rezeptdetail-Seite

**Layout:** Vertikal, oben das Eingabefeld, darunter die Vorschau (erscheint nach Import).

---

### 5. Rezeptdetail

**Zweck:** Vollständige Ansicht eines gespeicherten Rezepts.

**Inhalte:**
- **Hero-Bereich:**
  - Großes Rezeptbild (volle Breite, ggf. mit Gradient-Overlay für Text)
  - Titel über dem Bild oder direkt darunter
  - Meta-Infos: Zubereitungszeit, Kochzeit, Portionen
  - Quelle (Link zur Originalseite)
- **Aktionsleiste:**
  - "Kochmodus starten" – Primärer CTA-Button, prominent
  - "Bearbeiten" – Sekundärer Button
  - "Löschen" – Icon-Button (Papierkorb)
  - "Teilen" – Icon-Button (Share)
- **Portionen-Regler:**
  - Stepper (- / +) zum Anpassen der Portionen
  - Zutatenmengen werden live umgerechnet
- **Zutaten-Sektion:**
  - Liste aller Zutaten mit Menge + Einheit + Name
  - Optionale Checkbox pro Zutat (zum Abhaken beim Einkaufen)
- **Zubereitung-Sektion:**
  - Nummerierte Schritte
  - Ggf. Zeitangabe pro Schritt (z.B. "15 Min. backen")

**Interaktionen:**
- "Kochmodus starten" → wechselt in den Kochmodus (Screen 6)
- Portionen-Stepper → Zutaten werden proportional umgerechnet
- "Bearbeiten" → Alle Felder werden editierbar (Inline-Edit oder separater Edit-Screen)
- Zurück-Button → zurück zur Übersicht

**Layout:** Vertikal scrollbar, Hero-Bild oben, dann Meta, dann Zutaten, dann Schritte.

---

### 6. Kochmodus

**Zweck:** Schritt-für-Schritt-Anleitung während des Kochens. Optimiert für freihändige Bedienung.

**Inhalte pro Schritt:**
- **Fortschrittsleiste:** Oben, zeigt aktuellen Schritt von Gesamt (z.B. "Schritt 3 von 8")
- **Schritttext:** Groß, gut lesbar (mind. 18-20px), zentriert
- **Timer-Button:** Wenn der Schritt eine Zeitangabe enthält → Button "Timer: 15 Min." → Klick startet Countdown
- **Timer-Anzeige:** Großer Countdown (MM:SS), visueller Ring/Progress, Vibration + Sound bei Ablauf
- **Navigation:**
  - Großer "Weiter"-Button unten (volle Breite)
  - "Zurück"-Button (kleiner, sekundär)
  - Alternativ: Swipe links/rechts
- **Zutaten-Button:** Sticky unten oder als ausklappbare Sidebar/Bottom-Sheet → zeigt alle Zutaten

**Besonderheiten:**
- **Wake Lock aktiv** – Display schaltet sich nicht aus
- **Großzügige Touch-Targets** – Buttons mind. 48px hoch
- **Hoher Kontrast** – gut lesbar bei Küchenlicht
- **Kein unnötiges UI** – nur der aktuelle Schritt, Navigation, Timer

**Interaktionen:**
- Swipe oder Tap → nächster/vorheriger Schritt
- Timer starten → Countdown läuft, auch beim Wechseln der Schritte sichtbar (Mini-Timer in der Ecke)
- "Zutaten anzeigen" → Bottom-Sheet mit Zutatenliste
- "Kochmodus beenden" → Bestätigungsdialog → zurück zur Rezeptdetail-Seite

**Layout:** Vollbild, kein Header/Navigation außer dem Kochmodus-eigenen UI. Ein Schritt pro Screen.

---

### 7. Profil / Einstellungen

**Zweck:** Account-Verwaltung und App-Einstellungen.

**Inhalte:**
- Avatar / Name / E-Mail
- "Passwort ändern"
- "Abmelden"
- App-Einstellungen:
  - Standardportionen (z.B. immer 2 Portionen)
  - Kochmodus: Schriftgröße, Timer-Sound an/aus
- "Account löschen" (ganz unten, rot)

**Layout:** Einfache Liste mit Sektionen.

---

## Globale Elemente

### Navigation (Mobile)
- **Bottom Navigation Bar** mit 3 Tabs:
  - **Rezepte** (Home-Icon) → Rezept-Übersicht
  - **Importieren** (+/Import-Icon) → Import-Screen
  - **Profil** (Person-Icon) → Profil/Einstellungen

### Navigation (Desktop)
- **Sidebar** links mit denselben Navigationspunkten
- Content-Bereich rechts, breiter

### PWA-Elemente
- **App-Icon:** Kochtopf oder Rettungsring mit Kochlöffel (passend zum Namen "Rezeptretter")
- **Splash Screen:** Logo + App-Name auf warmem Hintergrund
- **Theme Color:** Akzentfarbe (Terracotta/warmes Orange)

---

## User Flows

### Flow 1: Erstes Rezept importieren
1. User öffnet App → Landing Page
2. Klickt "Kostenlos starten" → Registrierung
3. Erstellt Account → wird zur leeren Rezeptübersicht weitergeleitet
4. Sieht Empty State: "Importiere dein erstes Rezept"
5. Klickt Import-Button → Import-Screen
6. Fügt Chefkoch-URL ein → Klickt "Importieren"
7. Rezept wird extrahiert → Vorschau erscheint
8. Prüft/korrigiert Daten → Klickt "Speichern"
9. Wird zur Rezeptdetail-Seite weitergeleitet

### Flow 2: Rezept nachkochen
1. User öffnet App → Rezeptübersicht
2. Tippt auf ein Rezept → Rezeptdetail
3. Passt Portionen an (z.B. 4 statt 2)
4. Klickt "Kochmodus starten"
5. Schritt 1 erscheint, großer Text
6. Tippt "Weiter" → Schritt 2
7. Schritt hat Timer-Angabe → startet Timer
8. Kocht weiter, Timer läuft in der Ecke
9. Timer klingelt → Vibration + Sound
10. Letzter Schritt → "Fertig! Guten Appetit" 

### Flow 3: Rezept aus Browser teilen (PWA Share Target)
1. User ist auf einer Rezeptseite im Browser
2. Tippt "Teilen" → wählt "Rezeptretter"
3. App öffnet sich mit vorausgefüllter URL im Import-Screen
4. Weiter wie Flow 1, Schritt 6-9

---

## Spätere Erweiterungen (nach MVP)

- **Instagram-Import:** Post-Link teilen → Claude Vision API extrahiert Rezept aus Caption/Bild
- **Foto-Import:** Kochbuchseite fotografieren → OCR + KI-Extraktion
- **Tags & Sammlungen:** Rezepte kategorisieren (vegan, schnell, Dessert, etc.)
- **Einkaufsliste:** Zutaten aus mehreren Rezepten zusammenführen
- **Wochenplan / Meal Planning:** Rezepte auf Wochentage verteilen
- **Rezepte teilen:** Per Link oder innerhalb der App mit anderen Nutzern
