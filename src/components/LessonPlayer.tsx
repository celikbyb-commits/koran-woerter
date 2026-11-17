"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Word } from "@/lib/words";
import { recordAnswer } from "@/lib/progress";
import { retryOf, type Step } from "@/lib/quiz";
import {
  Arabic,
  Button,
  IconCheck,
  IconClock,
  IconGem,
  IconTarget,
  IconX,
  ProgressBar,
  SpeakButton,
} from "./ui";

export type LessonResult = {
  /** Anteil der Fragen, die beim ersten Versuch richtig waren (0–100). */
  accuracy: number;
  firstTryCorrect: number;
  questionCount: number;
  durationMs: number;
  mistakes: Word[];
};

const PRAISE = ["Richtig!", "Super!", "Sehr gut!", "Klasse!", "Ausgezeichnet!", "Mā shāʾ Allāh!"];

export default function LessonPlayer({
  title,
  steps: initialSteps,
  xpFor,
  onFinish,
  onExit,
}: {
  title: string;
  steps: Step[];
  /** XP, die für dieses Ergebnis gutgeschrieben werden (für den Abschlussbildschirm). */
  xpFor: (r: LessonResult) => number;
  onFinish: (r: LessonResult) => void;
  onExit: () => void;
}) {
  const [queue, setQueue] = useState<Step[]>(initialSteps);
  const [pos, setPos] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState<null | { correct: boolean; praise: string }>(null);
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);
  const [combo, setCombo] = useState(0);
  // Jede Frage zählt erst als gelöst, wenn sie richtig beantwortet wurde
  const [solved, setSolved] = useState(0);
  // Fragen, die beim ersten Versuch richtig waren
  const [firstTry, setFirstTry] = useState(0);
  // Wörter, die mindestens einmal falsch waren (zählen nicht als "erster Versuch richtig")
  const [missed, setMissed] = useState<Word[]>([]);
  const [result, setResult] = useState<LessonResult | null>(null);

  const questionTotal = useMemo(
    () => initialSteps.filter((s) => s.kind === "choice").length,
    [initialSteps],
  );
  const step = queue[pos];

  function finish() {
    const firstTryCorrect = firstTry;
    const r: LessonResult = {
      accuracy: questionTotal ? Math.round((firstTryCorrect / questionTotal) * 100) : 100,
      firstTryCorrect,
      questionCount: questionTotal,
      durationMs: Date.now() - startedAt,
      mistakes: missedUnique(missed),
    };
    setNow(Date.now());
    setResult(r);
    window.scrollTo(0, 0);
    onFinish(r);
  }

  function advance() {
    setSelected(null);
    setChecked(null);
    if (pos + 1 >= queue.length) finish();
    else {
      setPos(pos + 1);
      window.scrollTo(0, 0);
    }
  }

  function check() {
    if (!step || step.kind !== "choice" || !selected || checked) return;
    const correct = selected === step.word.id;
    recordAnswer(step.word.id, correct);
    if (correct) {
      setSolved((n) => n + 1);
      if (!step.retry) setFirstTry((n) => n + 1);
      setCombo((c) => c + 1);
      setChecked({ correct, praise: PRAISE[Math.floor(Math.random() * PRAISE.length)] });
    } else {
      setCombo(0);
      setMissed((m) => [...m, step.word]);
      // Falsch beantwortete Frage kommt am Ende der Lektion noch einmal
      setQueue((q) => [...q, retryOf(step)]);
      setChecked({ correct, praise: "" });
    }
  }

  // Tastatur: 1–4 auswählen, Enter prüfen/weiter
  const handlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    handlerRef.current = (e: KeyboardEvent) => {
      if (result || !step) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (step.kind === "intro" || checked) advance();
        else check();
        return;
      }
      if (step.kind === "choice" && !checked) {
        const n = Number(e.key);
        if (n >= 1 && n <= step.options.length) setSelected(step.options[n - 1].id);
      }
    };
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => handlerRef.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (result) {
    return <FinishScreen title={title} result={result} xp={xpFor(result)} elapsed={now - startedAt} onContinue={onExit} />;
  }

  const progress = questionTotal ? solved / questionTotal : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Kopfzeile */}
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 pt-5 pb-2 sm:pt-8">
        <button
          type="button"
          onClick={() => {
            if (pos === 0 || window.confirm("Lektion wirklich beenden? Dein Fortschritt in dieser Lektion geht verloren.")) onExit();
          }}
          aria-label="Lektion beenden"
          className="rounded-xl p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <IconX className="h-7 w-7" />
        </button>
        <ProgressBar value={progress} className="flex-1" />
        {combo >= 3 && (
          <span className="animate-pop text-sm font-extrabold whitespace-nowrap text-orange-500">
            {combo}× in Folge
          </span>
        )}
      </div>

      {/* Inhalt */}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-4 pb-48 sm:pt-10">
        {step.kind === "intro" ? (
          <IntroCard key={step.key} word={step.word} />
        ) : (
          <ChoiceCard
            key={step.key}
            step={step}
            selected={selected}
            revealed={!!checked}
            onSelect={(id) => !checked && setSelected(id)}
          />
        )}
      </div>

      {/* Fußleiste */}
      <BottomBar
        state={step.kind === "intro" ? "intro" : checked ? (checked.correct ? "correct" : "wrong") : "idle"}
        canCheck={!!selected}
        praise={checked?.praise ?? ""}
        solution={step.kind === "choice" ? step.word : null}
        direction={step.kind === "choice" ? step.direction : "ar-de"}
        onCheck={check}
        onContinue={advance}
      />
    </div>
  );
}

function missedUnique(words: Word[]): Word[] {
  const seen = new Set<string>();
  return words.filter((w) => (seen.has(w.id) ? false : (seen.add(w.id), true)));
}

/* ------------------------------------------------------------------ */

function IntroCard({ word }: { word: Word }) {
  return (
    <div className="animate-slide-in flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-extrabold tracking-wide text-violet-600 uppercase">
          Neues Wort
        </span>
      </div>
      <h2 className="text-2xl font-extrabold text-slate-800">Merke dir dieses Wort</h2>
      <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-b-4 border-slate-200 px-6 py-10">
        <Arabic className="text-7xl leading-snug text-slate-900">{word.ar}</Arabic>
        <div className="flex items-center gap-3">
          <SpeakButton text={word.ar} />
          <span className="text-lg font-semibold text-slate-400 italic">{word.translit}</span>
        </div>
        <div className="mt-2 h-px w-16 bg-slate-200" />
        <p className="text-center text-2xl font-extrabold text-slate-800">{word.de}</p>
      </div>
    </div>
  );
}

function ChoiceCard({
  step,
  selected,
  revealed,
  onSelect,
}: {
  step: Extract<Step, { kind: "choice" }>;
  selected: string | null;
  revealed: boolean;
  onSelect: (id: string) => void;
}) {
  const arToDe = step.direction === "ar-de";
  return (
    <div className="animate-slide-in flex flex-col gap-6">
      <h2 className="text-2xl font-extrabold text-slate-800">
        {arToDe ? "Was bedeutet dieses Wort?" : "Wähle das richtige arabische Wort"}
      </h2>

      <div className="flex items-center justify-center gap-4 rounded-3xl bg-slate-50 px-4 py-6">
        {arToDe ? (
          <>
            <SpeakButton text={step.word.ar} size="lg" />
            <Arabic className="text-6xl leading-snug text-slate-900">{step.word.ar}</Arabic>
          </>
        ) : (
          <p className="text-center text-3xl font-extrabold text-slate-800">{step.word.de}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {step.options.map((o, i) => {
          const isSel = selected === o.id;
          const isRight = o.id === step.word.id;
          let look = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
          if (revealed && isRight) look = "border-emerald-400 bg-emerald-50 text-emerald-700";
          else if (revealed && isSel) look = "border-rose-400 bg-rose-50 text-rose-600";
          else if (revealed) look = "border-slate-200 bg-white text-slate-300";
          else if (isSel) look = "border-sky-400 bg-sky-50 text-sky-700";
          return (
            <button
              key={o.id}
              type="button"
              disabled={revealed}
              onClick={() => onSelect(o.id)}
              className={`group flex min-h-[64px] items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-left transition-all active:translate-y-[2px] active:border-b-2 disabled:active:translate-y-0 disabled:active:border-b-4 ${look}`}
            >
              <span
                className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-bold sm:flex ${
                  isSel && !revealed ? "border-sky-300 text-sky-500" : "border-slate-200 text-slate-400"
                }`}
              >
                {i + 1}
              </span>
              {arToDe ? (
                <span className="flex-1 text-lg font-bold">{o.de}</span>
              ) : (
                <Arabic className="flex-1 text-right text-4xl leading-relaxed">{o.ar}</Arabic>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BottomBar({
  state,
  canCheck,
  praise,
  solution,
  direction,
  onCheck,
  onContinue,
}: {
  state: "intro" | "idle" | "correct" | "wrong";
  canCheck: boolean;
  praise: string;
  solution: Word | null;
  direction: "ar-de" | "de-ar";
  onCheck: () => void;
  onContinue: () => void;
}) {
  const bg =
    state === "correct" ? "bg-emerald-100" : state === "wrong" ? "bg-rose-100" : "bg-white border-t-2 border-slate-100";
  return (
    <div className={`fixed inset-x-0 bottom-0 z-20 pb-[env(safe-area-inset-bottom)] ${bg}`}>
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-7">
        {(state === "correct" || state === "wrong") && solution && (
          <div className="animate-slide-up flex items-center gap-4">
            <span
              className={`hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white sm:flex ${
                state === "correct" ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {state === "correct" ? <IconCheck className="h-9 w-9" /> : <IconX className="h-9 w-9" />}
            </span>
            <div className={state === "correct" ? "text-emerald-700" : "text-rose-700"}>
              <p className="text-2xl font-extrabold">{state === "correct" ? praise : "Leider falsch"}</p>
              {state === "wrong" ? (
                <p className="mt-1 font-semibold">
                  Richtig ist:{" "}
                  {direction === "ar-de" ? (
                    <strong>{solution.de}</strong>
                  ) : (
                    <Arabic className="text-2xl font-bold">{solution.ar}</Arabic>
                  )}
                </p>
              ) : null}
              <p className="mt-0.5 text-sm font-semibold opacity-80">
                <Arabic className="text-lg">{solution.ar}</Arabic> · {solution.translit} · {solution.de}
              </p>
            </div>
          </div>
        )}

        {state === "idle" && <div className="hidden sm:block" />}
        {state === "intro" && <div className="hidden sm:block" />}

        {state === "idle" ? (
          <Button onClick={onCheck} disabled={!canCheck} className="w-full sm:w-44">
            Prüfen
          </Button>
        ) : (
          <Button
            onClick={onContinue}
            variant={state === "wrong" ? "danger" : "primary"}
            className="w-full sm:w-44"
            ref={(el) => el?.focus({ preventScroll: true })}
          >
            Weiter
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FinishScreen({
  title,
  result,
  xp,
  elapsed,
  onContinue,
}: {
  title: string;
  result: LessonResult;
  xp: number;
  elapsed: number;
  onContinue: () => void;
}) {
  const mins = Math.floor(elapsed / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);
  const perfect = result.accuracy === 100;
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-4 pt-10 pb-36 text-center">
        <div className="animate-pop relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-amber-100">
            <span className="text-6xl" aria-hidden>
              {perfect ? "🏆" : result.accuracy >= 70 ? "🌟" : "💪"}
            </span>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-amber-500">
            {perfect ? "Perfekt!" : "Lektion geschafft!"}
          </h1>
          <p className="mt-2 font-semibold text-slate-500">{title}</p>
        </div>

        <div className="grid w-full grid-cols-3 gap-3">
          <StatTile label="XP" color="border-amber-400 bg-amber-400" textColor="text-amber-500">
            <IconGem className="h-5 w-5" /> {xp}
          </StatTile>
          <StatTile label="Genauigkeit" color="border-emerald-500 bg-emerald-500" textColor="text-emerald-500">
            <IconTarget className="h-5 w-5" /> {result.accuracy}%
          </StatTile>
          <StatTile label="Zeit" color="border-sky-500 bg-sky-500" textColor="text-sky-500">
            <IconClock className="h-5 w-5" /> {mins}:{String(secs).padStart(2, "0")}
          </StatTile>
        </div>

        {result.mistakes.length > 0 && (
          <div className="w-full rounded-2xl border-2 border-slate-200 p-4 text-left">
            <p className="mb-2 text-sm font-extrabold tracking-wide text-slate-400 uppercase">
              Noch üben
            </p>
            <ul className="flex flex-col gap-2">
              {result.mistakes.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3">
                  <span className="font-bold text-slate-700">{w.de}</span>
                  <Arabic className="text-2xl text-slate-800">{w.ar}</Arabic>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t-2 border-slate-100 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-3xl justify-end px-4 py-5 sm:py-7">
          <Button onClick={onContinue} className="w-full sm:w-44" ref={(el) => el?.focus({ preventScroll: true })}>
            Weiter
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  color,
  textColor,
  children,
}: {
  label: string;
  color: string;
  textColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border-2 ${color}`}>
      <p className="py-1 text-[11px] font-extrabold tracking-wide text-white uppercase">{label}</p>
      <p className={`flex items-center justify-center gap-1 rounded-t-xl bg-white py-3 text-lg font-extrabold ${textColor}`}>
        {children}
      </p>
    </div>
  );
}
