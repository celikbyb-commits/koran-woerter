# Koran-Wörter

Web-App zum Lernen der wichtigsten Wörter des Korans auf Deutsch.

- **Wortliste:** ca. 160 Kernwörter mit Arabisch (mit Vokalzeichen), Umschrift
  und deutscher Bedeutung, nach Themen gefiltert und durchsuchbar (Deutsch,
  Umschrift oder Arabisch, auch ohne Vokalzeichen).
- **Training:** Quiz mit 4 Antwortmöglichkeiten, wahlweise Arabisch → Deutsch
  oder Deutsch → Arabisch. Nach jedem Klick wird sofort *Richtig* / *Falsch*
  angezeigt, am Ende gibt es eine Auswertung und „Fehler üben“.
- **Lernfortschritt** wird nur lokal im Browser gespeichert
  (Karteikasten-Prinzip: falsch beantwortete Wörter kommen öfter dran).
  Kein Login, keine Datenbank.

Die Wörter stehen in [`src/lib/words.ts`](src/lib/words.ts) und lassen sich
dort einfach ergänzen oder korrigieren.

## Lokal starten

```bash
npm install
npm run dev
```

App läuft danach unter `http://localhost:3000`.

## Live schalten (Vercel)

Repo auf [vercel.com](https://vercel.com) importieren und deployen – es werden
keine Umgebungsvariablen benötigt.
