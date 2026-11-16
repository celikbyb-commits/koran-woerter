"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, WORDS, type Category } from "@/lib/words";
import { MAX_BOX, useProgress } from "@/lib/progress";

/** Vokalzeichen entfernen und Alif-Formen vereinheitlichen, damit die Suche tolerant ist. */
function normalizeArabic(s: string) {
  return s
    .replace(/[ً-ٰٟۖ-ۭ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي");
}

function normalizeLatin(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ʿʾ'`-]/g, "")
    .toLowerCase();
}

export default function WordList() {
  const progress = useProgress();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "alle">("alle");

  const filtered = useMemo(() => {
    const qLatin = normalizeLatin(query.trim());
    const qArabic = normalizeArabic(query.trim());
    return WORDS.filter((w) => {
      if (category !== "alle" && w.category !== category) return false;
      if (!qLatin && !qArabic) return true;
      return (
        normalizeLatin(w.de).includes(qLatin) ||
        normalizeLatin(w.translit).includes(qLatin) ||
        (qArabic !== "" && normalizeArabic(w.ar).includes(qArabic))
      );
    });
  }, [query, category]);

  return (
    <div className="flex flex-col gap-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Suchen (Deutsch, Umschrift oder Arabisch)"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {[{ id: "alle" as const, label: "Alle" }, ...CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              category === c.id
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">{filtered.length} Wörter</p>

      <ul className="flex flex-col gap-2">
        {filtered.map((w) => {
          const box = progress[w.id]?.box ?? 0;
          return (
            <li
              key={w.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{w.de}</p>
                <p className="text-sm text-slate-500 italic">{w.translit}</p>
                <div
                  className="mt-1.5 flex gap-1"
                  title={`Lernstand ${box} von ${MAX_BOX}`}
                  aria-label={`Lernstand ${box} von ${MAX_BOX}`}
                >
                  {Array.from({ length: MAX_BOX }, (_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-4 rounded-full ${
                        i < box ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span
                lang="ar"
                dir="rtl"
                className="font-arabic shrink-0 text-3xl leading-relaxed text-slate-900"
              >
                {w.ar}
              </span>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">
          Kein Wort gefunden.
        </p>
      )}
    </div>
  );
}
