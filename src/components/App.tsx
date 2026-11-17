"use client";

import { useState } from "react";
import type { Lesson, Unit } from "@/lib/course";
import type { Category } from "@/lib/words";
import {
  DAILY_GOAL,
  addXp,
  completeLesson,
  currentStreak,
  todayXp,
  useProgress,
  type State,
} from "@/lib/progress";
import { buildLessonSteps, buildPracticeSteps, type Step } from "@/lib/quiz";
import LessonPlayer, { type LessonResult } from "./LessonPlayer";
import PathScreen from "./PathScreen";
import PracticeScreen from "./PracticeScreen";
import ProfileScreen from "./ProfileScreen";
import WordsScreen from "./WordsScreen";
import {
  Arabic,
  IconBook,
  IconDumbbell,
  IconFlame,
  IconGem,
  IconPath,
  IconTarget,
  IconUser,
  ProgressBar,
} from "./ui";

type Tab = "lernen" | "ueben" | "woerter" | "profil";

type Session = {
  title: string;
  steps: Step[];
  xpFor: (r: LessonResult) => number;
  onDone: (r: LessonResult) => void;
};

const TABS: { id: Tab; label: string; icon: (p: { className?: string }) => React.ReactNode }[] = [
  { id: "lernen", label: "Lernen", icon: IconPath },
  { id: "ueben", label: "Üben", icon: IconDumbbell },
  { id: "woerter", label: "Wörter", icon: IconBook },
  { id: "profil", label: "Statistik", icon: IconUser },
];

export default function App() {
  const progress = useProgress();
  const [tab, setTab] = useState<Tab>("lernen");
  const [wordsCategory, setWordsCategory] = useState<Category | "alle">("alle");
  const [session, setSession] = useState<Session | null>(null);

  function startLesson(lesson: Lesson, unit: Unit) {
    const repeat = !!progress.lessons[lesson.id];
    setSession({
      title: `${unit.title} · Lektion ${lesson.numberInUnit}`,
      steps: buildLessonSteps(lesson.words, progress),
      xpFor: (r) => (repeat ? 5 : 10) + (r.accuracy === 100 ? 5 : 0),
      onDone: (r) => {
        completeLesson(lesson.id, r.accuracy);
        addXp((repeat ? 5 : 10) + (r.accuracy === 100 ? 5 : 0));
      },
    });
  }

  if (session) {
    return (
      <LessonPlayer
        key={session.title + session.steps[0]?.key}
        title={session.title}
        steps={session.steps}
        xpFor={session.xpFor}
        onFinish={session.onDone}
        onExit={() => {
          setSession(null);
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl">
      {/* Seitenleiste (Computer) */}
      <nav className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-2 border-r-2 border-slate-100 px-4 py-6 md:flex">
        <Logo />
        <div className="mt-6 flex flex-col gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-4 rounded-xl border-2 px-4 py-2.5 text-[15px] font-extrabold tracking-wide uppercase transition-colors ${
                tab === t.id
                  ? "border-sky-300 bg-sky-50 text-sky-500"
                  : "border-transparent text-slate-500 hover:bg-slate-100"
              }`}
            >
              <t.icon className="h-7 w-7" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Statusleiste (Handy) */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-slate-100 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <Logo compact />
          <StatusPills progress={progress} />
        </header>

        <div className="flex flex-1 gap-10 px-4 md:px-8">
          <main className="mx-auto w-full max-w-xl min-w-0 flex-1 pt-6 pb-28 md:pt-8 md:pb-10">
            {tab === "lernen" && (
              <PathScreen
                progress={progress}
                onStartLesson={startLesson}
                onShowWords={(u) => {
                  setWordsCategory(u.id);
                  setTab("woerter");
                  window.scrollTo(0, 0);
                }}
              />
            )}
            {tab === "ueben" && (
              <PracticeScreen
                progress={progress}
                onStart={(c) =>
                  setSession({
                    title: c.title,
                    steps: buildPracticeSteps(c.pool, c.count, c.direction, progress),
                    xpFor: (r) => r.firstTryCorrect,
                    onDone: (r) => addXp(r.firstTryCorrect),
                  })
                }
              />
            )}
            {tab === "woerter" && (
              <WordsScreen key={wordsCategory} progress={progress} initialCategory={wordsCategory} />
            )}
            {tab === "profil" && <ProfileScreen progress={progress} />}
          </main>

          {/* Rechte Spalte (großer Bildschirm) */}
          <aside className="sticky top-0 hidden h-dvh w-80 shrink-0 flex-col gap-5 py-8 lg:flex">
            <StatusPills progress={progress} />
            <DailyGoal progress={progress} />
          </aside>
        </div>
      </div>

      {/* Navigationsleiste unten (Handy) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-slate-100 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                if (t.id !== "woerter") setWordsCategory("alle");
                window.scrollTo(0, 0);
              }}
              className="flex flex-1 flex-col items-center gap-0.5 py-2"
              aria-current={tab === t.id ? "page" : undefined}
            >
              <span
                className={`flex h-10 w-14 items-center justify-center rounded-xl border-2 transition-colors ${
                  tab === t.id ? "border-sky-300 bg-sky-50 text-sky-500" : "border-transparent text-slate-400"
                }`}
              >
                <t.icon className="h-7 w-7" />
              </span>
              <span className={`text-[11px] font-extrabold ${tab === t.id ? "text-sky-500" : "text-slate-400"}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border-b-4 border-emerald-700 bg-emerald-500 pb-1">
        <Arabic className="text-2xl leading-none font-bold text-white">ك</Arabic>
      </span>
      <span
        className={`font-extrabold tracking-tight whitespace-nowrap text-emerald-600 ${compact ? "hidden text-lg min-[420px]:inline" : "text-xl"}`}
      >
        Koran-Wörter
      </span>
    </div>
  );
}

function StatusPills({ progress }: { progress: State }) {
  const streak = currentStreak(progress);
  const today = todayXp(progress);
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <Pill title="Tage in Folge" className={streak > 0 ? "text-orange-500" : "text-slate-300"}>
        <IconFlame className="h-6 w-6" />
        {streak}
      </Pill>
      <Pill title="XP gesamt" className="text-sky-500">
        <IconGem className="h-6 w-6" />
        {progress.xp}
      </Pill>
      <Pill title="Tagesziel" className={today >= DAILY_GOAL ? "text-amber-500" : "text-slate-400"}>
        <IconTarget className="h-6 w-6" />
        {Math.min(today, DAILY_GOAL)}/{DAILY_GOAL}
      </Pill>
    </div>
  );
}

function Pill({
  title,
  className,
  children,
}: {
  title: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className={`flex items-center gap-1 rounded-xl px-2 py-1 text-[15px] font-extrabold tabular-nums ${className}`}
    >
      {children}
    </span>
  );
}

function DailyGoal({ progress }: { progress: State }) {
  const today = todayXp(progress);
  const done = today >= DAILY_GOAL;
  return (
    <section className="rounded-2xl border-2 border-slate-200 p-5">
      <h2 className="text-lg font-extrabold text-slate-800">Tagesziel</h2>
      <div className="mt-4 flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${done ? "bg-amber-100 text-amber-500" : "bg-slate-100 text-slate-400"}`}>
          <IconTarget className="h-8 w-8" />
        </span>
        <div className="flex-1">
          <p className="mb-2 font-bold text-slate-700">
            {done ? "Geschafft! Bis morgen 🌙" : `Sammle ${DAILY_GOAL} XP`}
          </p>
          <div className="flex items-center gap-2">
            <ProgressBar value={today / DAILY_GOAL} color="bg-amber-400" className="flex-1" />
            <span className="text-sm font-bold text-slate-400 tabular-nums">
              {Math.min(today, DAILY_GOAL)}/{DAILY_GOAL}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
