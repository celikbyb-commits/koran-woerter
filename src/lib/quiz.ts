import { WORDS, meaningKeys, type Word } from "./words";
import { weightFor, type State } from "./progress";

export type Direction = "ar-de" | "de-ar";

export type Step =
  | { kind: "intro"; key: string; word: Word }
  | { kind: "choice"; key: string; word: Word; direction: Direction; options: Word[]; retry?: boolean };

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function overlaps(a: Word, b: Word): boolean {
  const keys = new Set(meaningKeys(a.de));
  return a.ar === b.ar || meaningKeys(b.de).some((k) => keys.has(k));
}

/** Falsche Antworten, bevorzugt aus derselben Kategorie (macht es anspruchsvoller). */
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

let seq = 0;
function choice(word: Word, direction: Direction): Step {
  return {
    kind: "choice",
    key: `q${seq++}`,
    word,
    direction,
    options: shuffle([word, ...distractorsFor(word)]),
  };
}

/**
 * Lektion: neue Wörter werden erst vorgestellt und direkt abgefragt
 * (Arabisch → Deutsch), danach kommt jedes Wort noch einmal in
 * umgekehrter Richtung dran.
 */
export function buildLessonSteps(words: Word[], progress: State): Step[] {
  const steps: Step[] = [];
  for (const w of words) {
    if (!progress.words[w.id]) steps.push({ kind: "intro", key: `i${seq++}`, word: w });
    steps.push(choice(w, "ar-de"));
  }
  for (const w of shuffle(words)) steps.push(choice(w, "de-ar"));
  return steps;
}

/** Zieht `count` verschiedene Wörter, unsichere/neue Wörter mit höherer Wahrscheinlichkeit. */
function weightedSample(pool: Word[], count: number, progress: State): Word[] {
  const remaining = [...pool];
  const picked: Word[] = [];
  while (picked.length < count && remaining.length > 0) {
    const weights = remaining.map((w) => weightFor(progress.words[w.id]));
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

export function buildPracticeSteps(
  pool: Word[],
  count: number,
  direction: Direction | "mix",
  progress: State,
): Step[] {
  return weightedSample(pool, count, progress).map((w) =>
    choice(w, direction === "mix" ? (Math.random() < 0.5 ? "ar-de" : "de-ar") : direction),
  );
}

/** Wörter, die zuletzt falsch beantwortet wurden und noch nicht sitzen. */
export function weakWords(progress: State): Word[] {
  return WORDS.filter((w) => {
    const s = progress.words[w.id];
    return s && s.wrong > 0 && s.box < 3;
  });
}

/** Für eine Wiederholungsrunde: Frage mit neuem Schlüssel und neu gemischten Optionen. */
export function retryOf(step: Extract<Step, { kind: "choice" }>): Step {
  return { ...step, key: `q${seq++}`, options: shuffle(step.options), retry: true };
}

/**
 * Wörter für "Paare zuordnen" in Runden aufteilen. Innerhalb einer Runde
 * dürfen keine zwei Wörter dieselbe Bedeutung haben, sonst wäre die
 * Zuordnung nicht eindeutig.
 */
export function buildMatchRounds(
  pool: Word[],
  count: number,
  progress: State,
  roundSize = 5,
): Word[][] {
  const words = weightedSample(pool, count, progress);
  const rounds: Word[][] = [];
  for (const w of words) {
    const round = rounds.find((r) => r.length < roundSize && !r.some((x) => overlaps(x, w)));
    if (round) round.push(w);
    else rounds.push([w]);
  }
  // Einzelne Wörter am Ende lohnen keine eigene Runde
  return rounds.filter((r) => r.length >= 2 || rounds.length === 1);
}
