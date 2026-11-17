"use client";

import { useMemo, useState } from "react";
import { UNITS } from "@/lib/course";
import type { Category } from "@/lib/words";
import { LEARNED_BOX, MAX_BOX, type State } from "@/lib/progress";
import { Arabic, SpeakButton } from "./ui";

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

export default function WordsScreen({
  progress,
  initialCategory,
}: {
  progress: State;
  initialCategory: Category | "alle";
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "alle">(initialCategory);

  const units = useMemo(() => {
    const qLatin = normalizeLatin(query.trim());
    const qArabic = normalizeArabic(query.trim());
    return UNITS.filter((u) => category === "alle" || u.id === category)
      .map((u) => ({
        unit: u,
        words: u.words.filter(
          (w) =>
            !qLatin ||
            normalizeLatin(w.de).includes(qLatin) ||
            normalizeLatin(w.translit).includes(qLatin) ||
            (qArabic !== "" && normalizeArabic(w.ar).includes(qArabic)),
        ),
      }))
      .filter((g) => g.words.length > 0);
  }, [query, category]);

  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1 className="text-2xl font-extrabold text-slate-800">Wörter</h1>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Suchen – Deutsch, Umschrift oder Arabisch"
        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {[{ id: "alle" as const, title: "Alle" }, ...UNITS].map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setCategory(u.id)}
            className={`shrink-0 rounded-xl border-2 border-b-4 px-3 py-1.5 text-sm font-bold whitespace-nowrap transition-all active:translate-y-[2px] active:border-b-2 ${
              category === u.id
                ? "border-sky-400 bg-sky-50 text-sky-600"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {u.title}
          </button>
        ))}
      </div>

      {units.map(({ unit, words }) => {
        const learned = unit.words.filter((w) => (progress.words[w.id]?.box ?? 0) >= LEARNED_BOX).length;
        return (
          <section key={unit.id} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between px-1">
              <h2 className={`text-sm font-extrabold tracking-wide uppercase ${unit.theme.text}`}>
                {unit.title}
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {learned}/{unit.words.length} gelernt
              </span>
            </div>
            <ul className="overflow-hidden rounded-2xl border-2 border-slate-200">
              {words.map((w, i) => {
                const box = progress.words[w.id]?.box ?? 0;
                return (
                  <li
                    key={w.id}
                    className={`flex items-center gap-3 bg-white px-4 py-3 ${i > 0 ? "border-t-2 border-slate-100" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800">{w.de}</p>
                      <p className="text-sm font-semibold text-slate-400 italic">{w.translit}</p>
                    </div>
                    <Strength box={box} />
                    <Arabic className="w-24 shrink-0 text-right text-3xl leading-relaxed text-slate-900 sm:w-32">
                      {w.ar}
                    </Arabic>
                    <SpeakButton text={w.ar} size="sm" />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {units.length === 0 && (
        <p className="py-10 text-center font-semibold text-slate-400">Kein Wort gefunden.</p>
      )}
    </div>
  );
}

/** Lernstand als kleine Balken (wie Signalstärke). */
function Strength({ box }: { box: number }) {
  return (
    <div
      className="flex h-5 shrink-0 items-end gap-[3px]"
      title={`Lernstand ${box} von ${MAX_BOX}`}
      aria-label={`Lernstand ${box} von ${MAX_BOX}`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`w-[5px] rounded-full ${n <= box ? (box >= LEARNED_BOX ? "bg-amber-400" : "bg-emerald-400") : "bg-slate-200"}`}
          style={{ height: `${n * 20}%` }}
        />
      ))}
    </div>
  );
}
