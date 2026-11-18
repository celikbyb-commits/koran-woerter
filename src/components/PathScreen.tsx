"use client";

import { useState } from "react";
import { ALL_LESSONS, UNITS, type Lesson, type Unit } from "@/lib/course";
import { dueWordIds, type State } from "@/lib/progress";
import { useI18n } from "@/lib/i18n";
import { Arabic, ArabicWord, Button, IconBolt, IconBook, IconCheck, IconClock, IconLock, IconStar } from "./ui";

// Versatz der Lektions-Knoten für den geschwungenen Pfad (in px)
const OFFSETS = [0, 44, 70, 44, 0, -44, -70, -44];

export function isUnlocked(lesson: Lesson, progress: State): boolean {
  if (lesson.order === 0) return true;
  return !!progress.lessons[ALL_LESSONS[lesson.order - 1].id];
}

export default function PathScreen({
  progress,
  onStartLesson,
  onShowWords,
  onAdvanced,
  onReview,
}: {
  progress: State;
  onStartLesson: (lesson: Lesson, unit: Unit) => void;
  onReview: () => void;
  onShowWords: (unit: Unit) => void;
  onAdvanced: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const current = ALL_LESSONS.find((l) => !progress.lessons[l.id]);
  const { t } = useI18n();
  const due = dueWordIds(progress).length;

  return (
    <div className="flex flex-col gap-10 pb-10" onClick={() => setOpen(null)}>
      {due > 0 && (
        <button
          type="button"
          onClick={onReview}
          className="-mb-6 flex items-center gap-4 rounded-2xl border-2 border-b-4 border-amber-300 bg-amber-50 px-4 py-3 text-left transition-all hover:bg-amber-100 active:translate-y-[2px] active:border-b-2"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-white">
            <IconClock className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold text-amber-700">{t("reviewTitle")}</span>
            <span className="block text-sm font-semibold text-amber-600">{t("reviewSub", { n: due })}</span>
          </span>
          <span className="text-2xl font-extrabold text-amber-400" aria-hidden>›</span>
        </button>
      )}
      <button
        type="button"
        onClick={onAdvanced}
        className="-mb-4 flex items-center gap-4 rounded-2xl border-2 border-b-4 border-violet-200 bg-violet-50 px-4 py-3 text-left transition-all hover:bg-violet-100 active:translate-y-[2px] active:border-b-2"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white">
          <IconBolt className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold text-violet-700">{t("advancedTitle")}</span>
          <span className="block text-sm font-semibold text-violet-500">{t("advancedSub")}</span>
        </span>
        <span className="text-2xl font-extrabold text-violet-400" aria-hidden>›</span>
      </button>
      {UNITS.map((unit) => {
        const done = unit.lessons.filter((l) => progress.lessons[l.id]).length;
        return (
          <section key={unit.id} className="flex flex-col items-center gap-8">
            {/* Einheiten-Banner */}
            <div
              className={`flex w-full items-center justify-between gap-4 rounded-2xl border-b-4 px-5 py-4 text-white ${unit.theme.bg} ${unit.theme.shadow}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-extrabold tracking-wide uppercase opacity-80">
                  {t("unitHeader", { n: unit.number, done, total: unit.lessons.length })}
                </p>
                <h2 className="mt-0.5 text-xl font-extrabold">
                  {t("unitTitle", { from: unit.from, to: unit.to })}
                </h2>
                <p className="mt-1 text-sm font-bold opacity-90">
                  {t("unitCoverage", { p: Math.round(unit.coverage) })}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowWords(unit);
                }}
                className="flex shrink-0 items-center gap-2 rounded-xl border-2 border-white/40 px-3 py-2 text-sm font-extrabold uppercase transition-colors hover:bg-white/15"
              >
                <IconBook className="h-5 w-5" />
                <span className="hidden sm:inline">{t("words")}</span>
              </button>
            </div>

            {/* Lektionen */}
            <div className="mt-2 flex flex-col items-center gap-5">
              {unit.lessons.map((lesson, i) => {
                const stat = progress.lessons[lesson.id];
                const unlocked = isUnlocked(lesson, progress);
                const isCurrent = current?.id === lesson.id;
                const offset = OFFSETS[i % OFFSETS.length];
                return (
                  <div
                    key={lesson.id}
                    className={`relative flex flex-col items-center ${open === lesson.id ? "z-30" : "z-0"} ${isCurrent ? "mt-12" : ""}`}
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    {isCurrent && open !== lesson.id && (
                      <div className="animate-bounce-soft absolute -top-12 z-10 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold tracking-wide whitespace-nowrap uppercase shadow-sm">
                        <span className={unit.theme.text}>{t("start")}</span>
                        <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-slate-200 bg-white" />
                      </div>
                    )}

                    <LessonNode
                      unit={unit}
                      done={!!stat}
                      perfect={stat?.best === 100}
                      unlocked={unlocked}
                      current={isCurrent}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(open === lesson.id ? null : lesson.id);
                      }}
                      label={t("lessonN", { n: lesson.numberInUnit })}
                    />

                    {open === lesson.id && (
                      <LessonPopover
                        unit={unit}
                        lesson={lesson}
                        unlocked={unlocked}
                        best={stat?.best}
                        offset={offset}
                        onStart={() => onStartLesson(lesson, unit)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <Arabic className="text-4xl text-emerald-600">وَقُل رَّبِّ زِدْنِي عِلْمًا</Arabic>
        <p className="text-sm font-semibold text-emerald-600 italic">wa qul rabbi zidnī ʿilmā</p>
        <p className="text-sm font-semibold text-slate-400">{t("verseFooter")}</p>
      </div>
    </div>
  );
}

function LessonNode({
  unit,
  done,
  perfect,
  unlocked,
  current,
  label,
  onClick,
}: {
  unit: Unit;
  done: boolean;
  perfect: boolean;
  unlocked: boolean;
  current: boolean;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { t } = useI18n();
  const color = !unlocked
    ? "bg-slate-200 border-slate-300 text-slate-400"
    : perfect
      ? "bg-amber-400 border-amber-600 text-white"
      : `${unit.theme.bg} ${unit.theme.shadow} text-white`;

  return (
    <div className="relative">
      {current && (
        <span className="absolute -inset-2.5 rounded-full border-[6px] border-slate-200" aria-hidden />
      )}
      <button
        type="button"
        onClick={onClick}
        aria-label={`${label}${done ? t("doneSuffix") : unlocked ? "" : t("lockedSuffix")}`}
        className={`relative flex h-[70px] w-[76px] items-center justify-center rounded-[50%] border-b-[7px] transition-transform active:translate-y-[4px] active:border-b-[3px] ${color}`}
      >
        {!unlocked ? (
          <IconLock className="h-8 w-8" />
        ) : done ? (
          <IconCheck className="h-9 w-9" />
        ) : (
          <IconStar className="h-9 w-9" />
        )}
      </button>
    </div>
  );
}

function LessonPopover({
  unit,
  lesson,
  unlocked,
  best,
  offset,
  onStart,
}: {
  unit: Unit;
  lesson: Lesson;
  unlocked: boolean;
  best?: number;
  /** Versatz des Knotens – das Fenster wird wieder auf die Spalte zentriert. */
  offset: number;
  onStart: () => void;
}) {
  const { t } = useI18n();
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ left: `calc(50% - ${offset}px)` }}
      className={`animate-pop absolute top-[88px] z-20 w-72 -translate-x-1/2 rounded-2xl p-4 text-white shadow-xl ${
        unlocked ? unit.theme.bg : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        style={{ left: `calc(50% + ${offset}px)` }}
        className={`absolute -top-2 h-4 w-4 -translate-x-1/2 rotate-45 ${
          unlocked ? unit.theme.bg : "bg-slate-100"
        }`}
      />
      <p className={`text-lg font-extrabold ${unlocked ? "" : "text-slate-600"}`}>
        {t("lessonN", { n: lesson.numberInUnit })}
      </p>
      <p className="text-sm font-semibold opacity-90">
        {unlocked
          ? best !== undefined
            ? t("bestResult", { p: best, n: lesson.words.length })
            : t("newWordsN", { n: lesson.words.length })
          : t("lockedHint")}
      </p>
      {unlocked && (
        <>
          <div className="my-3 flex flex-wrap justify-end gap-x-3 gap-y-1">
            {lesson.words.map((w) => (
              <ArabicWord key={w.id} word={w} className="text-2xl" translitClassName="!text-xs !opacity-90" />
            ))}
          </div>
          <button
            type="button"
            onClick={onStart}
            className={`w-full rounded-xl border-b-4 border-slate-200 bg-white py-3 text-[15px] font-extrabold tracking-wide uppercase transition-all active:translate-y-[2px] active:border-b-2 ${unit.theme.text}`}
          >
            {best !== undefined ? t("repeatXp") : t("goXp")}
          </button>
        </>
      )}
      {!unlocked && (
        <Button variant="secondary" disabled className="mt-3 w-full">
          {t("locked")}
        </Button>
      )}
    </div>
  );
}
