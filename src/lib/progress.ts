"use client";

import { useSyncExternalStore } from "react";

// Gesamter Lernstand, nur lokal im Browser gespeichert:
// - Wörter nach dem Karteikasten-Prinzip (richtig → ein Fach weiter, falsch → Fach 0)
// - abgeschlossene Lektionen, Erfahrungspunkte (XP) und Tagesserie

export const MAX_BOX = 5;
/** Ab diesem Fach gilt ein Wort als "gelernt". */
export const LEARNED_BOX = 3;
export const DAILY_GOAL = 20;

export type WordStat = {
  box: number;
  right: number;
  wrong: number;
  /** Tag, an dem das Wort wieder abgefragt werden sollte (JJJJ-MM-TT) */
  due?: string;
};

export type Lang = "de" | "tr";

/** Abstand bis zur nächsten Wiederholung (in Tagen) je Karteikasten-Fach. */
const INTERVALS = [0, 1, 3, 7, 14, 30];
export type LessonStat = { best: number; times: number };

export type State = {
  words: Record<string, WordStat>;
  lessons: Record<string, LessonStat>;
  xp: number;
  daily: Record<string, number>;
  streak: { count: number; last: string | null };
  /** Wörter in Lektionen automatisch vorlesen */
  sound: boolean;
  /** Sprache der Bedeutungen und der Oberfläche */
  lang: Lang;
  /** Umschrift (lateinische Buchstaben) unter arabischen Wörtern anzeigen */
  showTranslit: boolean;
};

const STORAGE_KEY = "koran-woerter-state-v2";
const LEGACY_KEY = "koran-woerter-progress-v1";

const EMPTY: State = {
  words: {},
  lessons: {},
  xp: 0,
  daily: {},
  streak: { count: 0, last: null },
  sound: true,
  lang: "de",
  showTranslit: true,
};

let cache: State | null = null;
const listeners = new Set<() => void>();

export function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

function read(): State {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = { ...EMPTY, ...(JSON.parse(raw) as Partial<State>) };
    } else {
      // Fortschritt aus der ersten Version übernehmen
      const legacy = window.localStorage.getItem(LEGACY_KEY);
      cache = { ...EMPTY, words: legacy ? JSON.parse(legacy) : {} };
    }
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

function write(next: State) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Speicher nicht verfügbar (z.B. privater Modus) – gilt dann nur für diese Sitzung.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProgress(): State {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

export function recordAnswer(wordId: string, correct: boolean) {
  const s = read();
  const prev = s.words[wordId] ?? { box: 0, right: 0, wrong: 0 };
  let next: WordStat;
  if (correct) {
    const box = Math.min(prev.box + 1, MAX_BOX);
    // Pro Tag nur ein Fach aufsteigen: mehrfach richtig am selben Tag verlängert den Abstand nicht
    const sameDay = prev.due !== undefined && prev.due > dayKey();
    next = sameDay
      ? { ...prev, right: prev.right + 1 }
      : { ...prev, box, right: prev.right + 1, due: addDays(INTERVALS[box]) };
  } else {
    next = { ...prev, box: 0, wrong: prev.wrong + 1, due: dayKey() };
  }
  write({ ...s, words: { ...s.words, [wordId]: next } });
}

/** IDs der Wörter, die heute (oder früher) zur Wiederholung fällig sind. */
export function dueWordIds(s: State): string[] {
  const today = dayKey();
  return Object.entries(s.words)
    .filter(([, w]) => (w.due ?? today) <= today)
    .map(([id]) => id);
}

export function setShowTranslit(on: boolean) {
  write({ ...read(), showTranslit: on });
}

export function setLang(lang: Lang) {
  write({ ...read(), lang });
}

export function addXp(amount: number) {
  if (amount <= 0) return;
  const s = read();
  const today = dayKey();
  let streak = s.streak;
  if (streak.last !== today) {
    streak = {
      count: streak.last === yesterdayKey() ? streak.count + 1 : 1,
      last: today,
    };
  }
  write({
    ...s,
    xp: s.xp + amount,
    daily: { ...s.daily, [today]: (s.daily[today] ?? 0) + amount },
    streak,
  });
}

export function completeLesson(lessonId: string, accuracy: number) {
  const s = read();
  const prev = s.lessons[lessonId];
  write({
    ...s,
    lessons: {
      ...s.lessons,
      [lessonId]: {
        best: Math.max(prev?.best ?? 0, accuracy),
        times: (prev?.times ?? 0) + 1,
      },
    },
  });
}

export function resetProgress() {
  write({ ...EMPTY, sound: read().sound, lang: read().lang, showTranslit: read().showTranslit });
}

export function setSound(on: boolean) {
  write({ ...read(), sound: on });
}

/** Aktuelle Serie: verfällt, wenn gestern und heute nichts gelernt wurde. */
export function currentStreak(s: State): number {
  if (s.streak.last === dayKey() || s.streak.last === yesterdayKey()) {
    return s.streak.count;
  }
  return 0;
}

export function todayXp(s: State): number {
  return s.daily[dayKey()] ?? 0;
}

/** Gewicht für die Zufallsauswahl: unsichere Wörter kommen öfter dran. */
export function weightFor(stat: WordStat | undefined): number {
  if (!stat) return 5;
  return [8, 6, 4, 3, 2, 1][stat.box] ?? 1;
}

/* ------------------------------------------------------------------ */
/* Sicherung: Fortschritt exportieren / auf anderem Gerät einlesen     */
/* ------------------------------------------------------------------ */

const BACKUP_TAG = "koran-woerter-sicherung";

/** Fortschritt als JSON-Text (für Datei oder Code). */
export function exportBackup(): string {
  return JSON.stringify({ app: BACKUP_TAG, version: 1, created: new Date().toISOString(), state: read() });
}

function isState(x: unknown): x is State {
  const s = x as State;
  return !!s && typeof s === "object" && typeof s.words === "object" && typeof s.xp === "number";
}

/** Zwei Stände zusammenführen: pro Eintrag gewinnt der weiter fortgeschrittene. */
function merge(a: State, b: State): State {
  const words: Record<string, WordStat> = { ...a.words };
  for (const [id, w] of Object.entries(b.words ?? {})) {
    const cur = words[id];
    if (!cur || w.right + w.wrong > cur.right + cur.wrong) words[id] = w;
  }
  const lessons: Record<string, LessonStat> = { ...a.lessons };
  for (const [id, l] of Object.entries(b.lessons ?? {})) {
    const cur = lessons[id];
    lessons[id] = cur ? { best: Math.max(cur.best, l.best), times: Math.max(cur.times, l.times) } : l;
  }
  const daily: Record<string, number> = { ...a.daily };
  for (const [d, n] of Object.entries(b.daily ?? {})) daily[d] = Math.max(daily[d] ?? 0, n);
  const streak = (b.streak?.last ?? "") > (a.streak?.last ?? "") ? b.streak : a.streak;
  return { ...a, words, lessons, daily, streak, xp: Math.max(a.xp, b.xp ?? 0) };
}

/** Sicherung einlesen und mit dem aktuellen Stand zusammenführen. Gibt false bei ungültigen Daten zurück. */
export function importBackup(text: string): boolean {
  try {
    const data = JSON.parse(text.trim());
    const state = data?.app === BACKUP_TAG ? data.state : data;
    if (!isState(state)) return false;
    write(merge(read(), { ...EMPTY, ...state }));
    return true;
  } catch {
    return false;
  }
}

/** Kompakter Code (gzip + Base64), z.B. zum Kopieren per Nachricht. */
export async function exportCode(): Promise<string> {
  const json = exportBackup();
  if (typeof CompressionStream === "undefined") return btoa(unescape(encodeURIComponent(json)));
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return "KW1:" + btoa(bin);
}

export async function importCode(code: string): Promise<boolean> {
  const c = code.trim().replace(/\s+/g, "");
  try {
    if (c.startsWith("KW1:")) {
      const bin = atob(c.slice(4));
      const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
      return importBackup(await new Response(stream).text());
    }
    if (c.startsWith("{")) return importBackup(c);
    return importBackup(decodeURIComponent(escape(atob(c))));
  } catch {
    return false;
  }
}
