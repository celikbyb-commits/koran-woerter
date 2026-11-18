"use client";

import { useMemo, useState } from "react";
import { UNITS } from "@/lib/course";
import { CATEGORIES, CORPUS, WORDS, type Category } from "@/lib/words";
import { LEARNED_BOX, MAX_BOX, type State } from "@/lib/progress";
import { Arabic, IconX, SpeakButton } from "./ui";
import { CATEGORY_KEY, useI18n } from "@/lib/i18n";
import VerseExample from "./VerseExample";

/** "alle", eine Wortart oder eine Einheit (z.B. "u3") */
export type WordFilter = "alle" | Category | `u${number}`;

const PAGE = 80;

/** Vokalzeichen entfernen und Alif-Formen vereinheitlichen, damit die Suche tolerant ist. */
function normalizeArabic(s: string) {
  return s
    .replace(/[ً-ٰٟۖ-ۭـ]/g, "")
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
  initialFilter,
}: {
  progress: State;
  initialFilter: WordFilter;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<WordFilter>(initialFilter);
  const [limit, setLimit] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const { t, m, num } = useI18n();

  const filtered = useMemo(() => {
    const qLatin = normalizeLatin(query.trim());
    const qArabic = normalizeArabic(query.trim());
    return WORDS.filter((w) => {
      if (filter.startsWith("u") && filter !== `u${w.unit}`) return false;
      if (!filter.startsWith("u") && filter !== "alle" && w.category !== filter) return false;
      if (!qLatin && !qArabic) return true;
      return (
        normalizeLatin(w.de).includes(qLatin) ||
        normalizeLatin(w.tr).includes(qLatin) ||
        normalizeLatin(w.translit).includes(qLatin) ||
        (qArabic !== "" &&
          (normalizeArabic(w.ar).includes(qArabic) || normalizeArabic(w.root).replace(/ /g, "") === qArabic))
      );
    });
  }, [query, filter]);


  const unitFilter = filter.startsWith("u") ? UNITS.find((u) => u.id === filter) : undefined;
  const learned = WORDS.filter((w) => (progress.words[w.id]?.box ?? 0) >= LEARNED_BOX).length;

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-slate-800">{t("tabWords")}</h1>
        <span className="text-sm font-bold text-slate-400">
          {t("learnedOf", { n: learned, total: WORDS.length })}
        </span>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setLimit(PAGE);
        }}
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {unitFilter && (
          <button
            type="button"
            onClick={() => setFilter("alle")}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 border-sky-400 bg-sky-50 px-3 py-1.5 text-sm font-bold whitespace-nowrap text-sky-600"
          >
            {t("unitN", { n: unitFilter.number })}
            <IconX className="h-4 w-4" />
          </button>
        )}
        {[{ id: "alle" as const, label: t("all") }, ...CATEGORIES.map((c) => ({ id: c.id, label: t(CATEGORY_KEY[c.id]) }))].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setFilter(c.id);
              setLimit(PAGE);
            }}
            className={`shrink-0 rounded-xl border-2 border-b-4 px-3 py-1.5 text-sm font-bold whitespace-nowrap transition-all active:translate-y-[2px] active:border-b-2 ${
              filter === c.id
                ? "border-sky-400 bg-sky-50 text-sky-600"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="px-1 text-sm font-semibold text-slate-400">
        {t("wordsSorted", { n: filtered.length })}
      </p>

      <ul className="overflow-hidden rounded-2xl border-2 border-slate-200">
        {filtered.slice(0, limit).map((w, i) => {
          const box = progress.words[w.id]?.box ?? 0;
          return (
            <li key={w.id} className={`bg-white ${i > 0 ? "border-t-2 border-slate-100" : ""}`}>
            <div
              role="button"
              tabIndex={0}
              aria-expanded={openId === w.id}
              onClick={() => setOpenId(openId === w.id ? null : w.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenId(openId === w.id ? null : w.id);
                }
              }}
              className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-slate-50 sm:px-4"
            >
              <span className="w-9 shrink-0 text-center text-xs font-extrabold text-slate-300 tabular-nums">
                {w.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800">{m(w)}</p>
                <p className="text-sm font-semibold text-slate-400">
                  <span className="italic">{w.translit}</span>
                  <span className="text-slate-300"> · </span>
                  {w.count}×
                  {w.root && (
                    <>
                      <span className="text-slate-300"> · </span>
                      {t("root")} <Arabic className="text-base">{w.root}</Arabic>
                    </>
                  )}
                </p>
              </div>
              <Strength box={box} />
              <div className="flex w-24 shrink-0 flex-col items-end sm:w-32">
                <Arabic className="text-3xl leading-relaxed text-slate-900">{w.ar}</Arabic>
              </div>
              <SpeakButton word={w} size="sm" />
            </div>
            {openId === w.id && (
              <div className="px-3 pb-3 sm:px-4">
                <VerseExample word={w} />
              </div>
            )}
            </li>
          );
        })}
      </ul>

      {filtered.length > limit && (
        <button
          type="button"
          onClick={() => setLimit(limit + PAGE * 2)}
          className="self-center rounded-xl border-2 border-b-4 border-slate-200 px-5 py-2 text-sm font-extrabold tracking-wide text-sky-500 uppercase hover:bg-slate-50"
        >
          {t("moreN", { n: filtered.length - limit })}
        </button>
      )}

      {filtered.length === 0 && (
        <p className="py-10 text-center font-semibold text-slate-400">{t("noneFound")}</p>
      )}

      <p className="px-1 text-xs font-semibold text-slate-400">
        {t("sourceNote", { min: CORPUS.mindesthaeufigkeit, total: num(CORPUS.woerter_gesamt) })}
      </p>
    </div>
  );
}

/** Lernstand als kleine Balken (wie Signalstärke). */
function Strength({ box }: { box: number }) {
  const { t } = useI18n();
  return (
    <div
      className="hidden h-5 shrink-0 items-end gap-[3px] sm:flex"
      title={t("strength", { n: box, max: MAX_BOX })}
      aria-label={t("strength", { n: box, max: MAX_BOX })}
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
