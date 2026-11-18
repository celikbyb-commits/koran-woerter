"use client";

import { useEffect, useState } from "react";
import type { Word } from "@/lib/words";
import { useI18n } from "@/lib/i18n";

type Example = { ref: string; words: string[]; hi: number };

// Die Beispielverse (ca. 250 KB) werden erst geladen, wenn sie gebraucht werden.
let cache: Record<string, Example> | null = null;
let loading: Promise<Record<string, Example>> | null = null;

function loadExamples() {
  if (cache) return Promise.resolve(cache);
  loading ??= fetch("/data/beispielverse.json")
    .then((r) => r.json())
    .then((d: Record<string, Example>) => (cache = d));
  return loading;
}

/** Ein kurzer Koranvers, in dem das Wort vorkommt – das Wort ist farbig markiert. */
export default function VerseExample({ word }: { word: Pick<Word, "id"> }) {
  const { t } = useI18n();
  const [ex, setEx] = useState<Example | null>(cache?.[word.id] ?? null);

  useEffect(() => {
    let alive = true;
    loadExamples()
      .then((d) => alive && setEx(d[word.id] ?? null))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [word.id]);

  if (!ex) return <div className="h-24 animate-pulse rounded-2xl bg-slate-50" />;
  const [s, a] = ex.ref.split(":");
  return (
    <figure className="rounded-2xl border-2 border-amber-100 bg-amber-50/60 px-4 py-3">
      <blockquote lang="ar" dir="rtl" className="font-arabic text-2xl leading-[2.1] text-slate-800">
        {ex.words.map((w, i) => (
          <span key={i}>
            {i > 0 && " "}
            <span className={i === ex.hi ? "rounded-md bg-amber-300/70 px-1 text-slate-900" : ""}>{w}</span>
          </span>
        ))}
      </blockquote>
      <figcaption className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-amber-700">
        <span>{t("surah", { s, a })}</span>
        <a
          href={`https://quran.com/${s}/${a}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-amber-900"
        >
          {t("verseTranslation")} ↗
        </a>
      </figcaption>
    </figure>
  );
}
