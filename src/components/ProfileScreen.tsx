"use client";

import { ALL_LESSONS, UNITS } from "@/lib/course";
import { WORDS } from "@/lib/words";
import {
  DAILY_GOAL,
  LEARNED_BOX,
  currentStreak,
  dayKey,
  resetProgress,
  setShowTranslit,
  todayXp,
  type State,
} from "@/lib/progress";
import { IconBook, IconCheck, IconFlame, IconGem, ProgressBar } from "./ui";
import { useI18n } from "@/lib/i18n";
import OfflineCard from "./OfflineCard";
import BackupCard from "./BackupCard";

export default function ProfileScreen({ progress }: { progress: State }) {
  const { t } = useI18n();
  const WEEKDAYS = t("weekdays").split("|");
  const learned = WORDS.filter((w) => (progress.words[w.id]?.box ?? 0) >= LEARNED_BOX).length;
  const lessonsDone = ALL_LESSONS.filter((l) => progress.lessons[l.id]).length;

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { label: WEEKDAYS[d.getDay()], xp: progress.daily[dayKey(d)] ?? 0, today: i === 6 };
  });
  const maxXp = Math.max(DAILY_GOAL, ...week.map((d) => d.xp));

  return (
    <div className="flex flex-col gap-6 pb-10">
      <h1 className="text-2xl font-extrabold text-slate-800">{t("statsTitle")}</h1>

      <div className="grid grid-cols-2 gap-3">
        <Tile icon={<IconFlame className="h-7 w-7 text-orange-500" />} value={currentStreak(progress)} label={t("streak")} />
        <Tile icon={<IconGem className="h-7 w-7 text-sky-400" />} value={progress.xp} label={t("xpTotal")} />
        <Tile icon={<IconBook className="h-7 w-7 text-amber-400" />} value={`${learned}/${WORDS.length}`} label={t("wordsLearned")} />
        <Tile icon={<IconCheck className="h-7 w-7 text-emerald-500" />} value={`${lessonsDone}/${ALL_LESSONS.length}`} label={t("lessons")} />
      </div>

      {/* Wochenübersicht */}
      <section className="rounded-2xl border-2 border-slate-200 p-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-extrabold text-slate-800">{t("thisWeek")}</h2>
          <span className="text-sm font-bold text-slate-400">
            {t("todayXp", { n: todayXp(progress), goal: DAILY_GOAL })}
          </span>
        </div>
        <div className="flex h-36 items-end justify-between gap-2">
          {week.map((d, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-xs font-bold text-slate-400">{d.xp || ""}</span>
              <div
                className={`w-full max-w-10 rounded-t-lg ${
                  d.xp >= DAILY_GOAL ? "bg-amber-400" : d.xp > 0 ? "bg-emerald-400" : "bg-slate-100"
                }`}
                style={{ height: `${Math.max(6, (d.xp / maxXp) * 100)}%` }}
              />
              <span className={`text-xs font-extrabold ${d.today ? "text-sky-500" : "text-slate-400"}`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Fortschritt pro Einheit */}
      <section className="flex flex-col gap-4 rounded-2xl border-2 border-slate-200 p-4">
        <h2 className="font-extrabold text-slate-800">{t("perUnit")}</h2>
        {UNITS.map((u) => {
          const n = u.words.filter((w) => (progress.words[w.id]?.box ?? 0) >= LEARNED_BOX).length;
          return (
            <div key={u.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-700">{t("unitN", { n: u.number })} · {t("unitTitle", { from: u.from, to: u.to })}</span>
                <span className="text-slate-400">
                  {n}/{u.words.length}
                </span>
              </div>
              <ProgressBar value={n / u.words.length} color={u.theme.bar} className="!h-3" />
            </div>
          );
        })}
      </section>

      <section className="flex items-center gap-4 rounded-2xl border-2 border-slate-200 p-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-extrabold text-slate-800">{t("translitTitle")}</h2>
          <p className="text-sm font-semibold text-slate-500">{t("translitHint")}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={progress.showTranslit}
          aria-label={t("translitTitle")}
          onClick={() => setShowTranslit(!progress.showTranslit)}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${progress.showTranslit ? "bg-emerald-500" : "bg-slate-300"}`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${progress.showTranslit ? "left-7" : "left-1"}`}
          />
        </button>
      </section>

      <BackupCard />

      <OfflineCard />

      <p className="px-1 text-sm font-semibold text-slate-400">{t("learnedNote", { n: LEARNED_BOX })}</p>

      <button
        type="button"
        onClick={() => {
          if (window.confirm(t("resetConfirm"))) resetProgress();
        }}
        className="self-center rounded-xl px-4 py-2 text-sm font-extrabold tracking-wide text-rose-500 uppercase hover:bg-rose-50"
      >
        {t("reset")}
      </button>
    </div>
  );
}

function Tile({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 p-3">
      {icon}
      <div className="min-w-0">
        <p className="text-xl leading-tight font-extrabold text-slate-800">{value}</p>
        <p className="truncate text-xs font-bold text-slate-400">{label}</p>
      </div>
    </div>
  );
}
