import { WORDS, meaningKeys, type Category, type Word } from "@/lib/words";
import { weightFor, type Progress } from "@/lib/progress";

export type Direction = "ar-de" | "de-ar";

export type Question = {
  word: Word;
  options: Word[];
};

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Zieht `count` verschiedene Wörter, unsichere/neue Wörter mit höherer Wahrscheinlichkeit. */
function weightedSample(pool: Word[], count: number, progress: Progress): Word[] {
  const remaining = [...pool];
  const picked: Word[] = [];
  while (picked.length < count && remaining.length > 0) {
    const weights = remaining.map((w) => weightFor(progress[w.id]));
    let r = Math.random() * weights.reduce((s, x) => s + x, 0);
    let idx = 0;
    while (idx < remaining.length - 1 && r >= weights[idx]) {
      r -= weights[idx];
      idx++;
    }
    picked.push(remaining.splice(idx, 1)[0]);
  }
  return picked;
}

function overlaps(a: Word, b: Word): boolean {
  const keys = new Set(meaningKeys(a.de));
  return a.ar === b.ar || meaningKeys(b.de).some((k) => keys.has(k));
}

/** 3 falsche Antworten, bevorzugt aus derselben Kategorie (macht es anspruchsvoller). */
function distractorsFor(word: Word, count = 3): Word[] {
  const candidates = WORDS.filter((w) => w.id !== word.id && !overlaps(word, w));
  const sameCat = shuffle(candidates.filter((w) => w.category === word.category));
  const others = shuffle(candidates.filter((w) => w.category !== word.category));
  const chosen: Word[] = [];
  for (const c of [...sameCat, ...others]) {
    if (chosen.length >= count) break;
    // Auch die Ablenker untereinander dürfen nicht dieselbe Bedeutung haben.
    if (chosen.some((x) => overlaps(x, c))) continue;
    chosen.push(c);
  }
  return chosen;
}

export function buildQuiz(
  pool: Word[],
  length: number,
  progress: Progress,
): Question[] {
  return weightedSample(pool, length, progress).map((word) => ({
    word,
    options: shuffle([word, ...distractorsFor(word)]),
  }));
}

export function poolFor(category: Category | "alle"): Word[] {
  return category === "alle" ? WORDS : WORDS.filter((w) => w.category === category);
}
