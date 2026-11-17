// Wortschatz des Korans: alle Grundformen, die mindestens 5-mal im Koran
// vorkommen (Quelle: Quranic Arabic Corpus, corpus.quran.com).
// Erzeugt mit scripts/build-vocab.py aus data/ – dort Übersetzungen ändern.
import vocab from "@/data/vocab.json";

/** Wortart (für Filter und passende Antwortmöglichkeiten im Quiz). */
export type Category = "nomen" | "verben" | "partikeln" | "namen";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "nomen", label: "Nomen & Adjektive" },
  { id: "verben", label: "Verben" },
  { id: "partikeln", label: "Partikeln & Pronomen" },
  { id: "namen", label: "Namen" },
];

export type Word = {
  id: string;
  /** Rang nach Häufigkeit (1 = häufigstes Wort) */
  rank: number;
  /** Grundform (Wörterbuchform) */
  ar: string;
  /** Häufigste Schreibweise im Koran (falls abweichend) */
  quran: string;
  translit: string;
  de: string;
  /** Wurzelbuchstaben, z.B. "ر ح م" */
  root: string;
  /** Vorkommen im Koran */
  count: number;
  category: Category;
  /** Anteil des Korantextes (in %), der mit allen Wörtern bis hier abgedeckt ist */
  coverage: number;
  unit: number;
};

export const WORDS = vocab.words as Word[];
export const UNIT_INFO = vocab.units as { number: number; from: number; to: number; coverage: number }[];
export const CORPUS = vocab.meta;

/** Einzelne Bedeutungs-Stichwörter, um zu ähnliche Antwortoptionen zu vermeiden. */
export function meaningKeys(de: string): string[] {
  return de
    .replace(/\(.*?\)/g, "")
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Dateiname der Aussprache-Datei in /public/audio. */
export function audioSlug(w: Pick<Word, "id">): string {
  return w.id;
}
