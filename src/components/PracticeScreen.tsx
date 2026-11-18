"use client";

import { useState } from "react";
import { CATEGORIES, WORDS, type Category, type Word } from "@/lib/words";
import type { State } from "@/lib/progress";
import { weakWords, type Direction } from "@/lib/quiz";
import { CATEGORY_KEY, useI18n, type T } from "@/lib/i18n";
import { Button, IconBolt, IconDumbbell, IconTarget } from "./ui";

export type PracticeConfig = {
  title: string;
  pool: Word[];
  count: number;
  direction: Direction | "mix";
};

const DIRECTIONS = [
  ["ar-de", "dirArDe"],
  ["de-ar", "dirDeAr"],
  ["mix", "dirMix"],
] as const;

export type MatchConfig = { title: string; pool: Word[]; count: number };

/** Woher die Wörter fürs Üben kommen */
type Source = "gesehen" | "top100" | "top500" | "alle" | Category;

function sources(t: T): [Source, string][] {
  return [
    ["gesehen", t("srcSeen")],
    ["top100", t("srcTop100")],
    ["top500", t("srcTop500")],
    ["alle", t("srcAll", { n: WORDS.length })],
    ...CATEGORIES.map((c) => [c.id, t(CATEGORY_KEY[c.id])] as [Source, string]),
  ];
}

function poolFor(source: Source, progress: State): Word[] {
  switch (source) {
    case "gesehen":
      return WORDS.filter((w) => progress.words[w.id]);
    case "top100":
      return WORDS.slice(0, 100);
    case "top500":
      return WORDS.slice(0, 500);
    case "alle":
      return WORDS;
    default:
      return WORDS.filter((w) => w.category === source);
  }
}

export default function PracticeScreen({
  progress,
  onStart,
  onStartMatch,
}: {
  progress: State;
  onStart: (c: PracticeConfig) => void;
  onStartMatch: (c: MatchConfig) => void;
}) {
  const { t } = useI18n();
  const SOURCES = sources(t);
  const hasSeen = Object.keys(progress.words).length >= 4;
  const [category, setCategory] = useState<Source>(hasSeen ? "gesehen" : "top100");
  const [direction, setDirection] = useState<Direction | "mix">("ar-de");
  const [count, setCount] = useState(10);
  const [matchCategory, setMatchCategory] = useState<Source>(hasSeen ? "gesehen" : "top100");
  const [matchCount, setMatchCount] = useState(20);
  const matchPool = poolFor(matchCategory, progress);
  const weak = weakWords(progress);
  const pool = poolFor(category, progress);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <h1 className="text-2xl font-extrabold text-slate-800">{t("practiceTitle")}</h1>

      {/* Profi-Modus */}
      <div id="profi" className="flex scroll-mt-24 flex-col gap-5 rounded-2xl border-2 border-b-4 border-violet-200 bg-violet-50/50 p-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-white">
            <IconBolt className="h-8 w-8" />
          </span>
          <div>
            <p className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
              {t("proMode")}
              <span className="rounded-md bg-violet-500 px-1.5 py-0.5 text-[10px] tracking-wide text-white uppercase">
                {t("advanced")}
              </span>
            </p>
            <p className="text-sm font-semibold text-slate-500">
              {t("proSub")}
            </p>
          </div>
        </div>

        <Group label={t("wordsFrom")}>
          <div className="flex flex-wrap gap-2">
            {SOURCES.filter(([id]) => id !== "gesehen" || hasSeen).map(([id, label]) => (
              <Chip key={id} active={matchCategory === id} onClick={() => setMatchCategory(id)} tone="violet">
                {label}
              </Chip>
            ))}
          </div>
        </Group>

        <Group label={t("amount")}>
          <div className="flex flex-wrap gap-2">
            {[10, 20, 40].map((n) => (
              <Chip key={n} active={matchCount === n} onClick={() => setMatchCount(n)} tone="violet">
                {n}
              </Chip>
            ))}
            <Chip active={matchCount === 0} onClick={() => setMatchCount(0)} tone="violet">
              {t("all")}
            </Chip>
          </div>
        </Group>

        <button
          type="button"
          onClick={() =>
            onStartMatch({
              title: t("proTitle"),
              pool: matchPool,
              count: matchCount === 0 ? matchPool.length : Math.min(matchCount, matchPool.length),
            })
          }
          className="w-full rounded-2xl border-b-4 border-violet-700 bg-violet-500 px-5 py-3 text-[15px] font-extrabold tracking-wide text-white uppercase transition-all hover:bg-violet-400 active:translate-y-[2px] active:border-b-2"
        >
          {t("findPairsBtn")}
        </button>
      </div>

      {/* Fehler wiederholen */}
      <div className="flex items-center gap-4 rounded-2xl border-2 border-b-4 border-slate-200 p-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
          <IconTarget className="h-8 w-8" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold text-slate-800">{t("repeatMistakes")}</p>
          <p className="text-sm font-semibold text-slate-500">
            {weak.length > 0
              ? t("weakN", { n: weak.length })
              : t("noWeak")}
          </p>
        </div>
        <Button
          disabled={weak.length === 0}
          onClick={() =>
            onStart({
              title: t("repeatMistakes"),
              pool: weak,
              count: Math.min(weak.length, 15),
              direction: "mix",
            })
          }
          className="shrink-0 !px-4"
        >
          {t("start")}
        </Button>
      </div>

      {/* Freies Training */}
      <div className="flex flex-col gap-5 rounded-2xl border-2 border-b-4 border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-500">
            <IconDumbbell className="h-8 w-8" />
          </span>
          <div>
            <p className="text-lg font-extrabold text-slate-800">{t("freeTraining")}</p>
            <p className="text-sm font-semibold text-slate-500">
              {t("freeSub")}
            </p>
          </div>
        </div>

        <Group label={t("wordsFrom")}>
          <div className="flex flex-wrap gap-2">
            {SOURCES.filter(([id]) => id !== "gesehen" || hasSeen).map(([id, label]) => (
              <Chip key={id} active={category === id} onClick={() => setCategory(id)}>
                {label}
              </Chip>
            ))}
          </div>
        </Group>

        <Group label={t("direction")}>
          <div className="flex flex-wrap gap-2">
            {DIRECTIONS.map(([d, label]) => (
              <Chip key={d} active={direction === d} onClick={() => setDirection(d)}>
                {t(label)}
              </Chip>
            ))}
          </div>
        </Group>

        <Group label={t("questions")}>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 20].map((n) => (
              <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                {n}
              </Chip>
            ))}
          </div>
        </Group>

        <Button
          onClick={() =>
            onStart({
              title: t("freeTraining"),
              pool,
              count: Math.min(count, pool.length),
              direction,
            })
          }
          className="w-full"
        >
          {t("startTraining")}
        </Button>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-extrabold tracking-wide text-slate-400 uppercase">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  tone = "sky",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "sky" | "violet";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 border-b-4 px-3 py-1.5 text-sm font-bold transition-all active:translate-y-[2px] active:border-b-2 ${
        active
          ? tone === "violet"
            ? "border-violet-400 bg-violet-100 text-violet-700"
            : "border-sky-400 bg-sky-50 text-sky-600"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
