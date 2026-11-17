# Koran-Wörter

Web-App zum Lernen der wichtigsten Wörter des Korans auf Deutsch.

- **Lernpfad:** 8 Einheiten (nach Themen) mit kurzen Lektionen à ca. 6 Wörtern,
  die nacheinander freigeschaltet werden. Neue Wörter werden zuerst vorgestellt,
  dann abgefragt (Arabisch → Deutsch und Deutsch → Arabisch).
- **Quiz:** Antwort antippen → „Prüfen“ → sofort *Richtig* / *Leider falsch*.
  Falsch beantwortete Fragen kommen am Ende der Lektion noch einmal.
- **Motivation:** XP, Tagesziel, Tage-in-Folge-Serie, Abschlussbildschirm mit
  Genauigkeit und Zeit.
- **Üben:** Fehler gezielt wiederholen oder freies Training nach Thema/Richtung.
- **Wörter:** alle ca. 160 Kernwörter mit Arabisch, Umschrift und Deutsch,
  durchsuchbar, mit Lernstand pro Wort und Aussprache (falls das Gerät eine
  arabische Stimme hat).
- **Statistik:** Wochenübersicht, Fortschritt pro Einheit.
- Lernfortschritt wird nur lokal im Browser gespeichert – kein Login, keine
  Datenbank.

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

## Aussprache (ElevenLabs)

Die Aussprache aller Wörter liegt als MP3 in `public/audio/` und wurde einmalig
mit ElevenLabs (Stimme „MAVERA Qadir“) erzeugt. Neue oder geänderte Wörter:

```bash
ELEVENLABS_API_KEY=sk_... python3 scripts/generate-audio.py            # nur fehlende
ELEVENLABS_API_KEY=sk_... python3 scripts/generate-audio.py glaube-allah  # einzelne neu
```
