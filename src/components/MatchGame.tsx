"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Word } from "@/lib/words";
import { recordAnswer, setSound, useProgress } from "@/lib/progress";
import { shuffle } from "@/lib/quiz";
import { useI18n } from "@/lib/i18n";
import { FinishScreen, type LessonResult } from "./LessonPlayer";
import {
  Arabic,
  IconClock,
  IconSpeaker,
  IconSpeakerOff,
  IconX,
  ProgressBar,
  playWord,
} from "./ui";

type Side = "ar" | "de";
type Pick = { side: Side; id: string };

/**
 * Profi-Modus: links arabische, rechts deutsche Wörter – passende Paare antippen.
 * Sind alle Paare einer Runde gefunden, kommt sofort die nächste Runde.
 */
export default function MatchGame({
  title,
  rounds,
  onFinish,
  onExit,
}: {
  title: string;
  rounds: Word[][];
  onFinish: (r: LessonResult) => void;
  onExit: () => void;
}) {
  const { sound } = useProgress();
  const { t, m } = useI18n();
  const total = useMemo(() => rounds.reduce((n, r) => n + r.length, 0), [rounds]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [order, setOrder] = useState(() => shuffleRound(rounds[0]));
  const [picked, setPicked] = useState<Pick | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<{ ids: string[]; ok: boolean } | null>(null);
  const [missed, setMissed] = useState<Map<string, Word>>(new Map());
  const [found, setFound] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);
  const [result, setResult] = useState<LessonResult | null>(null);
  const locked = useRef(false);

  // Uhr
  useEffect(() => {
    if (result) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [result]);

  const round = rounds[roundIdx];

  // Wird nur aus dem Klick-Handler (über setTimeout) aufgerufen, nie beim Rendern.
  function finish(missedFinal: Map<string, Word>) {
    // eslint-disable-next-line react-hooks/purity
    const end = Date.now();
    const firstTry = total - missedFinal.size;
    const r: LessonResult = {
      accuracy: Math.round((firstTry / total) * 100),
      firstTryCorrect: firstTry,
      questionCount: total,
      durationMs: end - startedAt,
      mistakes: [...missedFinal.values()],
    };
    setNow(end);
    setResult(r);
    window.scrollTo(0, 0);
    onFinish(r);
  }

  // Kurzes Aufleuchten (grün/rot); ein neueres Aufleuchten ersetzt ein älteres.
  const flashSeq = useRef(0);
  function showFlash(ids: string[], ok: boolean, ms: number) {
    const id = ++flashSeq.current;
    setFlash({ ids, ok });
    setTimeout(() => {
      if (flashSeq.current === id) setFlash(null);
    }, ms);
  }

  function tap(side: Side, word: Word) {
    // Gesperrt nur kurz beim Wechsel zur nächsten Runde – sonst kann man ohne Pause weitertippen.
    if (locked.current || matched.has(word.id)) return;
    if (side === "ar" && sound) playWord(word);

    if (!picked || picked.side === side) {
      // Erneutes Antippen derselben Karte hebt die Auswahl auf
      setPicked(picked?.side === side && picked.id === word.id ? null : { side, id: word.id });
      return;
    }

    const arId = side === "ar" ? word.id : picked.id;
    const deId = side === "de" ? word.id : picked.id;
    setPicked(null);

    if (arId === deId) {
      // Richtiges Paar
      const w = round.find((x) => x.id === arId)!;
      recordAnswer(w.id, !missed.has(w.id));
      const nextMatched = new Set(matched).add(w.id);
      setMatched(nextMatched);
      setFound((n) => n + 1);
      showFlash([w.id], true, 400);
      if (nextMatched.size === round.length) {
        locked.current = true;
        setTimeout(() => {
          locked.current = false;
          if (roundIdx + 1 >= rounds.length) finish(missed);
          else {
            setRoundIdx(roundIdx + 1);
            setOrder(shuffleRound(rounds[roundIdx + 1]));
            setMatched(new Set());
          }
        }, 450);
      }
    } else {
      // Falsches Paar – das arabische Wort zählt als Fehler
      const w = round.find((x) => x.id === arId)!;
      if (!missed.has(w.id)) setMissed(new Map(missed).set(w.id, w));
      showFlash([arId, deId], false, 600);
    }
  }

  if (result) {
    return (
      <FinishScreen
        title={title}
        result={result}
        xp={result.firstTryCorrect}
        elapsed={now - startedAt}
        onContinue={onExit}
      />
    );
  }

  const secs = Math.floor((now - startedAt) / 1000);

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 pt-5 pb-2 sm:pt-8">
        <button
          type="button"
          onClick={() => {
            if (found === 0 || window.confirm(t("exitTrainingConfirm"))) onExit();
          }}
          aria-label={t("exitTraining")}
          className="rounded-xl p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <IconX className="h-7 w-7" />
        </button>
        <ProgressBar value={found / total} className="flex-1" color="bg-violet-500" />
        <button
          type="button"
          onClick={() => setSound(!sound)}
          aria-label={sound ? t("soundOff") : t("soundOn")}
          className="rounded-xl p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          {sound ? <IconSpeaker className="h-7 w-7" /> : <IconSpeakerOff className="h-7 w-7" />}
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pt-4 pb-10 sm:pt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-extrabold tracking-wide text-violet-600 uppercase">
              {t("proMode")}
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-800">{t("findPairs")}</h2>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 text-sm font-extrabold tabular-nums">
            <span className="flex items-center gap-1 text-sky-500">
              <IconClock className="h-5 w-5" />
              {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
            </span>
            <span className="text-slate-400">
              {found}/{total} · {t("mistakesN", { n: missed.size })}
            </span>
          </div>
        </div>

        <div key={roundIdx} className="animate-slide-in grid grid-cols-2 gap-3">
          {(["ar", "de"] as const).map((side) => (
            <div key={side} className="flex flex-col gap-3">
              {order[side].map((w) => {
                const isMatched = matched.has(w.id);
                const isPicked = picked?.side === side && picked.id === w.id;
                const isFlash =
                  flash &&
                  (flash.ok
                    ? flash.ids.includes(w.id)
                    : (side === "ar" ? flash.ids[0] : flash.ids[1]) === w.id);
                let look = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
                if (isFlash && flash?.ok) look = "border-emerald-400 bg-emerald-50 text-emerald-600";
                else if (isFlash) look = "animate-shake border-rose-400 bg-rose-50 text-rose-600";
                else if (isMatched) look = "border-slate-100 bg-slate-50 text-slate-300";
                else if (isPicked) look = "border-sky-400 bg-sky-50 text-sky-700";
                return (
                  <button
                    key={w.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => tap(side, w)}
                    className={`flex min-h-[68px] items-center justify-center rounded-2xl border-2 border-b-4 px-2 py-2 text-center transition-all active:translate-y-[2px] active:border-b-2 disabled:cursor-default disabled:active:translate-y-0 disabled:active:border-b-4 ${look}`}
                  >
                    {side === "ar" ? (
                      <Arabic className="text-3xl leading-relaxed">{w.ar}</Arabic>
                    ) : (
                      <span className="text-[15px] leading-tight font-bold">{m(w)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <p className="text-center text-sm font-semibold text-slate-400">
          {t("roundOf", { n: roundIdx + 1, total: rounds.length })}
        </p>
      </div>
    </div>
  );
}

function shuffleRound(words: Word[]): Record<Side, Word[]> {
  return { ar: shuffle(words), de: shuffle(words) };
}
