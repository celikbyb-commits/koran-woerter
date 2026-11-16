"use client";

import { useSyncExternalStore } from "react";

// Lernfortschritt pro Wort nach dem Karteikasten-Prinzip (Leitner):
// richtig → ein Fach weiter, falsch → zurück in Fach 0.
// Gespeichert nur lokal im Browser des Nutzers.

export const MAX_BOX = 5;
/** Ab diesem Fach gilt ein Wort als "gelernt". */
export const LEARNED_BOX = 3;

export type WordStat = { box: number; right: number; wrong: number };
export type Progress = Record<string, WordStat>;

const STORAGE_KEY = "koran-woerter-progress-v1";
const EMPTY: Progress = {};

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function read(): Progress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function write(next: Progress) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Speicher nicht verfügbar (z.B. privater Modus) – Fortschritt gilt nur für diese Sitzung.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function recordAnswer(wordId: string, correct: boolean) {
  const current = read();
  const prev = current[wordId] ?? { box: 0, right: 0, wrong: 0 };
  write({
    ...current,
    [wordId]: correct
      ? { ...prev, box: Math.min(prev.box + 1, MAX_BOX), right: prev.right + 1 }
      : { ...prev, box: 0, wrong: prev.wrong + 1 },
  });
}

export function resetProgress() {
  write({});
}

/** Gewicht für die Zufallsauswahl: unsichere Wörter kommen öfter dran. */
export function weightFor(stat: WordStat | undefined): number {
  if (!stat) return 5;
  return [8, 6, 4, 3, 2, 1][stat.box] ?? 1;
}
