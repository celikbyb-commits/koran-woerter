"use client";

import { ALL_LESSONS, UNITS } from "@/lib/course";
import { WORDS } from "@/lib/words";
import {
  DAILY_GOAL,
  LEARNED_BOX,
  currentStreak,
  dayKey,
  resetProgress,
  todayXp,
  type State,
} from "@/lib/progress";
import { IconBook, IconCheck, IconFlame, IconGem, ProgressBar } from "./ui";

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export default function ProfileScreen({ progress }: { progress: State }) {
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
      <h1 className="text-2xl font-extrabold text-slate-800">Statistik</h1>

      <div className="grid grid-cols-2 gap-3">
        <Tile icon={<IconFlame className="h-7 w-7 text-orange-500" />} value={currentStreak(progress)} label="Tage in Folge" />
        <Tile icon={<IconGem className="h-7 w-7 text-sky-400" />} value={progress.xp} label="XP gesamt" />
        <Tile icon={<IconBook className="h-7 w-7 text-amber-400" />} value={`${learned}/${WORDS.length}`} label="Wörter gelernt" />
        <Tile icon={<IconCheck className="h-7 w-7 text-emerald-500" />} value={`${lessonsDone}/${ALL_LESSONS.length}`} label="Lektionen" />
      </div>

      {/* Wochenübersicht */}
      <section className="rounded-2xl border-2 border-slate-200 p-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-extrabold text-slate-800">Diese Woche</h2>
          <span className="text-sm font-bold text-slate-400">
            Heute {todayXp(progress)}/{DAILY_GOAL} XP
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
        <h2 className="font-extrabold text-slate-800">Fortschritt pro Einheit</h2>
        {UNITS.map((u) => {
          const n = u.words.filter((w) => (progress.words[w.id]?.box ?? 0) >= LEARNED_BOX).length;
          return (
            <div key={u.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-700">{u.title}</span>
                <span className="text-slate-400">
                  {n}/{u.words.length}
                </span>
              </div>
              <ProgressBar value={n / u.words.length} color={u.theme.bar} className="!h-3" />
            </div>
          );
        })}
      </section>

      <p className="px-1 text-sm font-semibold text-slate-400">
        Ein Wort gilt als gelernt, wenn du es {LEARNED_BOX}× hintereinander richtig hattest. Dein
        Fortschritt wird nur auf diesem Gerät gespeichert.
      </p>

      <button
        type="button"
        onClick={() => {
          if (window.confirm("Gesamten Lernfortschritt wirklich löschen?")) resetProgress();
        }}
        className="self-center rounded-xl px-4 py-2 text-sm font-extrabold tracking-wide text-rose-500 uppercase hover:bg-rose-50"
      >
        Fortschritt zurücksetzen
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
