# Koran-Wörter

Web-App zum Lernen der wichtigsten Wörter des Korans auf Deutsch.

- **Lernpfad:** 24 Einheiten (nach Häufigkeit) mit kurzen Lektionen à ca. 6 Wörtern,
  die nacheinander freigeschaltet werden. Neue Wörter werden zuerst vorgestellt,
  dann abgefragt (Arabisch → Deutsch und Deutsch → Arabisch).
- **Quiz:** Antwort antippen → „Prüfen“ → sofort *Richtig* / *Leider falsch*.
  Falsch beantwortete Fragen kommen am Ende der Lektion noch einmal.
- **Motivation:** XP, Tagesziel, Tage-in-Folge-Serie, Abschlussbildschirm mit
  Genauigkeit und Zeit.
- **Üben:** Fehler gezielt wiederholen oder freies Training nach Thema/Richtung.
- **Wörter:** alle 1.434 Wörter mit Arabisch, Umschrift, Deutsch, Häufigkeit
  und Wurzel; durchsuchbar (auch nach Wurzel), mit Lernstand und Aussprache.
- **Statistik:** Wochenübersicht, Fortschritt pro Einheit.
- Lernfortschritt wird nur lokal im Browser gespeichert – kein Login, keine
  Datenbank.

## Wortschatz

Die App enthält **alle 1.434 Grundformen, die mindestens 5-mal im Koran
vorkommen** – zusammen rund 95 % des Korantextes. Auswahl, Reihenfolge
(nach Häufigkeit), Wurzeln und Koran-Schreibweisen stammen aus dem
[Quranic Arabic Corpus](https://corpus.quran.com) (Universität Leeds, Fassung
[mustafa0x/quran-morphology](https://github.com/mustafa0x/quran-morphology)).
Die deutschen Bedeutungen wurden mithilfe der englischen Wort-für-Wort-Übersetzung
von quran.com erstellt und sind **noch von einer fachkundigen Person zu prüfen**.

- `data/korpus-grundformen.json` – Grundformen mit Häufigkeit (aus dem Korpus)
- `data/uebersetzungen.tsv` – Rang, arabische Anzeigeform (optional), Deutsch
- `python3 scripts/build-vocab.py` erzeugt daraus `src/data/vocab.json`
  (inkl. automatischer Umschrift und Einteilung in Einheiten à 60 Wörter)

Korrekturen: Zeile in `data/uebersetzungen.tsv` ändern, Build-Skript ausführen,
bei geänderter arabischer Form die Aussprache neu erzeugen (siehe unten).

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
ELEVENLABS_API_KEY=sk_... python3 scripts/generate-audio.py      # nur fehlende
ELEVENLABS_API_KEY=sk_... python3 scripts/generate-audio.py r6   # einzelne neu (ID = r + Rang)
```
