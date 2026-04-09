---
description: Neue Trello-Aufgabe starten – Ticket auswählen, Feature-Branch erstellen, Tests laufen lassen, Stitch-Design laden, Implementierungsplan schreiben
---

# Neue Aufgabe starten

// turbo-all

## 1. Trello-Board laden

Setze das **🍳 Rezeptretter PWA** Board (`69d774961dfd7e94f78d00ec`) als aktives Board.

## 2. Todo-Tickets anzeigen

Hole alle Karten aus der **📋 Todo**-Liste (`69d774aabd5899be7e240aec`) und zeige sie dem User als nummerierte Liste mit Name, Label und Kurzbeschreibung.

Falls die Todo-Liste leer ist, zeige stattdessen die **Backlog**-Liste (`69d774a0ebb7c1e54b14eec5`) und frage, welche Tickets nach Todo verschoben werden sollen.

**Frage den User**, welches Ticket er bearbeiten möchte. **Warte auf Antwort.**

## 3. Ticket nach "In Progress" verschieben

Verschiebe die gewählte Karte in die **🚧 In Progress**-Liste (`69d774abad31bfa4f2b9c3a6`).

## 4. Feature-Branch erstellen

```bash
cd /Users/maikschoessler/projects/antigravity/rezeptretter
git checkout main
git pull origin main
git checkout -b <branch-name>
```

Branch-Naming basierend auf dem Trello-Label:
- 🎨 UI/Screen → `feature/<kebab-case-screen-name>`
- ⚙️ Infrastruktur → `chore/<kebab-case-name>`
- 🔐 Auth → `feature/auth-<kebab-case-name>`
- 🧠 Logik/API → `feature/<kebab-case-name>`
- 📱 PWA → `chore/pwa-<kebab-case-name>`
- 🧪 Testing → `test/<kebab-case-name>`
- 🐛 Bug (falls vorhanden) → `fix/<kebab-case-name>`

Beispiel: Ticket "🏠 Screen: Landing Page" → `feature/landing-page`

## 5. Tests laufen lassen

```bash
cd /Users/maikschoessler/projects/antigravity/rezeptretter
npm test 2>/dev/null || echo "Noch keine Tests vorhanden – weiter im Workflow"
```

Stelle sicher, dass alle bestehenden Tests bestehen (Clean State). Beim allerersten Ticket gibt es möglicherweise noch keine Tests – das ist OK.

## 6. Stitch-Design laden

Wenn das Ticket ein Screen-Ticket ist (Label "🎨 UI/Screen"), dann:

1. Finde den passenden Stitch-Export unter `stitch-export/<screen-name>/`
2. Lade `screenshot.png` als visuelle Referenz
3. Lade `code.html` als Code-Referenz für Tailwind-Klassen und Layout

Diese Dateien dienen als **Design-Vorlage** für die Implementierung.

## 7. Trello-Aufgabe im Detail lesen

Hole die vollständigen Details der ausgewählten Trello-Karte:
- Komplette Beschreibung (Layout-Spezifikation, Design-Tokens, Logik)
- Labels
- Kommentare (Tech-Stack-Entscheidungen, Hinweise)
- Akzeptanzkriterien (Checkliste)

## 8. Codebase analysieren

- Relevante bestehende Dateien finden und lesen
- Abhängigkeiten zu anderen Tickets prüfen
- Bestehende Komponenten identifizieren, die wiederverwendet werden können
- Design System Tokens prüfen (sind alle nötigen Tokens vorhanden?)

## 9. Implementierungsplan erstellen

Erstelle `implementation_plan.md` als Artifact mit:
- **Ist-Zustand:** Was existiert bereits?
- **Vorgeschlagene Änderungen:** Gruppiert nach Dateien/Komponenten
- **Stitch-Referenz:** Welche Design-Details aus dem Export übernommen werden
- **Offene Fragen** an den User (falls nötig)
- **Verifikationsplan:** Tests, Browser-Tests, Screenshot-Vergleich mit Stitch-Design

**WICHTIG:** Fange NICHT mit der Umsetzung an! Zeige den Plan dem User zur Freigabe.
