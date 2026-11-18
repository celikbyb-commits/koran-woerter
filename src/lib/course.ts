import { UNIT_INFO, WORDS, type Word } from "./words";

// Lernpfad: Wörter nach Häufigkeit – je 60 Wörter eine Einheit, aufgeteilt in kleine Lektionen.

export const LESSON_SIZE = 6;

export type Theme = {
  bg: string;
  shadow: string;
  text: string;
  soft: string;
  bar: string;
};

// Feste Klassen-Strings, damit Tailwind sie beim Build findet.
const THEMES: Theme[] = [
  { bg: "bg-emerald-500", shadow: "border-emerald-700", text: "text-emerald-600", soft: "bg-emerald-50", bar: "bg-emerald-500" },
  { bg: "bg-sky-500", shadow: "border-sky-700", text: "text-sky-600", soft: "bg-sky-50", bar: "bg-sky-500" },
  { bg: "bg-violet-500", shadow: "border-violet-700", text: "text-violet-600", soft: "bg-violet-50", bar: "bg-violet-500" },
  { bg: "bg-amber-500", shadow: "border-amber-700", text: "text-amber-600", soft: "bg-amber-50", bar: "bg-amber-500" },
  { bg: "bg-rose-500", shadow: "border-rose-700", text: "text-rose-600", soft: "bg-rose-50", bar: "bg-rose-500" },
  { bg: "bg-teal-500", shadow: "border-teal-700", text: "text-teal-600", soft: "bg-teal-50", bar: "bg-teal-500" },
  { bg: "bg-indigo-500", shadow: "border-indigo-700", text: "text-indigo-600", soft: "bg-indigo-50", bar: "bg-indigo-500" },
  { bg: "bg-orange-500", shadow: "border-orange-700", text: "text-orange-600", soft: "bg-orange-50", bar: "bg-orange-500" },
];

export type Lesson = {
  id: string;
  /** Position im gesamten Pfad (für die Freischaltung). */
  order: number;
  numberInUnit: number;
  words: Word[];
};

export type Unit = {
  id: string;
  number: number;
  title: string;
  /** Anteil des Korantextes, der nach dieser Einheit abgedeckt ist (in %) */
  coverage: number;
  /** Position des ersten/letzten Wortes in der Häufigkeitsliste */
  from: number;
  to: number;
  theme: Theme;
  words: Word[];
  lessons: Lesson[];
};

function chunk(words: Word[]): Word[][] {
  const out: Word[][] = [];
  for (let i = 0; i < words.length; i += LESSON_SIZE) {
    out.push(words.slice(i, i + LESSON_SIZE));
  }
  // Zu kleine letzte Lektion an die vorherige anhängen
  if (out.length > 1 && out[out.length - 1].length < 3) {
    const last = out.pop()!;
    out[out.length - 1].push(...last);
  }
  return out;
}

let order = 0;
export const UNITS: Unit[] = UNIT_INFO.map((info, i) => {
  const words = WORDS.filter((w) => w.unit === info.number);
  return {
    id: `u${info.number}`,
    number: info.number,
    title: `Wörter ${info.from}–${info.to}`,
    coverage: info.coverage,
    from: info.from,
    to: info.to,
    theme: THEMES[i % THEMES.length],
    words,
    lessons: chunk(words).map((ws, j) => ({
      id: `u${info.number}-${j + 1}`,
      order: order++,
      numberInUnit: j + 1,
      words: ws,
    })),
  };
});

export const ALL_LESSONS: Lesson[] = UNITS.flatMap((u) => u.lessons);
