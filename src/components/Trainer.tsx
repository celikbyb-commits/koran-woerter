"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, WORDS, type Category, type Word } from "@/lib/words";
import {
  LEARNED_BOX,
  recordAnswer,
  resetProgress,
  useProgress,
} from "@/lib/progress";
import { buildQuiz, poolFor, type Direction, type Question } from "./quiz";

type Session = {
  questions: Question[];
  index: number;
  chosenId: string | null;
  correctCount: number;
  mistakes: Word[];
};

const LENGTHS = [10, 20, 30];

export default function Trainer() {
  const progress = useProgress();
  const [direction, setDirection] = useState<Direction>("ar-de");
  const [category, setCategory] = useState<Category | "alle">("alle");
  const [length, setLength] = useState(10);
  const [session, setSession] = useState<Session | null>(null);

  const learnedCount = WORDS.filter(
    (w) => (progress[w.id]?.box ?? 0) >= LEARNED_BOX,
  ).length;

  function start(pool: Word[], count: number) {
    setSession({
      questions: buildQuiz(pool, count, progress),
      index: 0,
      chosenId: null,
      correctCount: 0,
      mistakes: [],
    });
  }

  if (session) {
    return (
      <QuizView
        session={session}
        direction={direction}
        onChange={setSession}
        onRestart={() => start(poolFor(category), length)}
        onRetryMistakes={(words) => start(words, words.length)}
        onExit={() => setSession(null)}
      />
    );
  }

  const poolSize = poolFor(category).length;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Gelernte Wörter</span>
          <span className="font-semibold text-slate-900">
            {learnedCount} / {WORDS.length}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${(learnedCount / WORDS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Ein Wort gilt als gelernt, wenn du es {LEARNED_BOX}× hintereinander
          richtig hattest. Wörter, die du falsch beantwortest, kommen öfter dran.
        </p>
      </section>

      <Field label="Abfragerichtung">
        <Segmented
          value={direction}
          onChange={setDirection}
          options={[
            ["ar-de", "Arabisch → Deutsch"],
            ["de-ar", "Deutsch → Arabisch"],
          ]}
        />
      </Field>

      <Field label="Themenbereich">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "alle")}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="alle">Alle Wörter ({WORDS.length})</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} ({poolFor(c.id).length})
            </option>
          ))}
        </select>
      </Field>

      <Field label="Anzahl Fragen">
        <Segmented
          value={length}
          onChange={setLength}
          options={LENGTHS.map((n) => [n, String(n)] as const)}
        />
      </Field>

      <button
        type="button"
        onClick={() => start(poolFor(category), Math.min(length, poolSize))}
        className="rounded-2xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-700"
      >
        Training starten
      </button>

      {Object.keys(progress).length > 0 && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Gesamten Lernfortschritt zurücksetzen?")) {
              resetProgress();
            }
          }}
          className="self-center text-xs text-slate-400 underline-offset-2 hover:text-red-600 hover:underline"
        >
          Fortschritt zurücksetzen
        </button>
      )}
    </div>
  );
}

function QuizView({
  session,
  direction,
  onChange,
  onRestart,
  onRetryMistakes,
  onExit,
}: {
  session: Session;
  direction: Direction;
  onChange: (s: Session) => void;
  onRestart: () => void;
  onRetryMistakes: (words: Word[]) => void;
  onExit: () => void;
}) {
  const { questions, index, chosenId } = session;
  const finished = index >= questions.length;
  const question = finished ? null : questions[index];
  const answered = chosenId !== null;

  function choose(option: Word) {
    if (!question || answered) return;
    const correct = option.id === question.word.id;
    recordAnswer(question.word.id, correct);
    onChange({
      ...session,
      chosenId: option.id,
      correctCount: session.correctCount + (correct ? 1 : 0),
      mistakes: correct ? session.mistakes : [...session.mistakes, question.word],
    });
  }

  function next() {
    onChange({ ...session, index: index + 1, chosenId: null });
  }

  // Tastatur: 1–4 zum Antworten, Enter/Leertaste für "Weiter".
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!question) return;
      if (!answered) {
        const n = Number(e.key);
        if (n >= 1 && n <= question.options.length) choose(question.options[n - 1]);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (finished) {
    const total = questions.length;
    const pct = Math.round((session.correctCount / total) * 100);
    return (
      <div className="flex flex-col gap-5">
        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500">Ergebnis</p>
          <p className="mt-1 text-4xl font-bold text-slate-900">
            {session.correctCount} / {total}
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-700">
            {pct === 100
              ? "Mā shāʾ Allāh – alles richtig!"
              : pct >= 70
                ? "Sehr gut, weiter so!"
                : "Übung macht den Meister – probier es nochmal."}
          </p>
        </section>

        {session.mistakes.length > 0 && (
          <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">
              Diese Wörter solltest du wiederholen
            </h2>
            <ul className="divide-y divide-slate-100">
              {session.mistakes.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{w.de}</p>
                    <p className="text-xs text-slate-500 italic">{w.translit}</p>
                  </div>
                  <span lang="ar" dir="rtl" className="font-arabic text-2xl">
                    {w.ar}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-col gap-2">
          {session.mistakes.length > 0 && (
            <button
              type="button"
              onClick={() => onRetryMistakes(session.mistakes)}
              className="rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700"
            >
              Fehler üben ({session.mistakes.length})
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className={`rounded-2xl px-4 py-3 font-semibold ${
              session.mistakes.length > 0
                ? "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700"
            }`}
          >
            Neue Runde
          </button>
          <button
            type="button"
            onClick={onExit}
            className="py-2 text-sm text-slate-500 hover:text-slate-800"
          >
            Zurück zu den Einstellungen
          </button>
        </div>
      </div>
    );
  }

  const q = question!;
  const isCorrect = chosenId === q.word.id;
  const promptIsArabic = direction === "ar-de";

  return (
    <div className={`flex flex-col gap-4 ${answered ? "pb-40 sm:pb-24" : ""}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Training beenden"
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums text-slate-500">
          {index + 1}/{questions.length}
        </span>
      </div>

      <section className="flex min-h-36 flex-col items-center justify-center rounded-3xl border border-slate-200/70 bg-white px-4 py-6 text-center shadow-sm">
        <p className="mb-3 text-xs font-medium tracking-wide text-slate-400 uppercase">
          {promptIsArabic ? "Was bedeutet …" : "Wie heißt auf Arabisch …"}
        </p>
        {promptIsArabic ? (
          <p lang="ar" dir="rtl" className="font-arabic text-6xl leading-snug text-slate-900">
            {q.word.ar}
          </p>
        ) : (
          <p className="text-2xl font-semibold text-slate-900">{q.word.de}</p>
        )}
        {answered && (
          <p className="mt-2 text-sm text-slate-500 italic">{q.word.translit}</p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {q.options.map((o, i) => {
          let style =
            "border-slate-200 bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/50";
          if (answered) {
            if (o.id === q.word.id)
              style = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30";
            else if (o.id === chosenId)
              style = "border-red-400 bg-red-50 text-red-900 ring-2 ring-red-400/30";
            else style = "border-slate-200 bg-white text-slate-400";
          }
          return (
            <button
              key={o.id}
              type="button"
              disabled={answered}
              onClick={() => choose(o)}
              className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-2.5 text-left font-medium shadow-sm transition-colors disabled:cursor-default ${style}`}
            >
              <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-500 sm:flex">
                {i + 1}
              </span>
              {promptIsArabic ? (
                <span className="flex-1">{o.de}</span>
              ) : (
                <span lang="ar" dir="rtl" className="font-arabic flex-1 text-right text-3xl leading-relaxed">
                  {o.ar}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          role="status"
          className={`fixed inset-x-0 bottom-0 z-20 border-t pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(15_23_42/0.08)] ${
            isCorrect
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="mx-auto flex max-w-2xl flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="font-semibold">{isCorrect ? "Richtig!" : "Leider falsch"}</p>
            {!isCorrect && (
              <p className="mt-0.5 text-sm">
                <span lang="ar" dir="rtl" className="font-arabic text-xl">
                  {q.word.ar}
                </span>{" "}
                ({q.word.translit}) = <strong>{q.word.de}</strong>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={next}
            ref={(el) => el?.focus({ preventScroll: true })}
            className={`rounded-xl px-5 py-2.5 font-semibold text-white ${
              isCorrect ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {index + 1 < questions.length ? "Weiter" : "Ergebnis anzeigen"}
          </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </div>
  );
}

function Segmented<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly (readonly [T, string])[];
}) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm">
      {options.map(([v, label]) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 px-3 py-2.5 transition-colors ${
            value === v ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
