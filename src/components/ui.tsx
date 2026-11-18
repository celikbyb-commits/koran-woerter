"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { audioSlug, type Word } from "@/lib/words";
import { useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";

/* ------------------------------------------------------------------ */
/* Knöpfe im "Tasten"-Stil mit Kante unten                            */
/* ------------------------------------------------------------------ */

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300",
  secondary:
    "bg-white text-slate-700 border-slate-200 border-2 border-b-4 hover:bg-slate-50",
  danger: "bg-rose-500 text-white border-rose-700 hover:bg-rose-400",
  ghost: "bg-transparent text-slate-500 border-transparent hover:bg-slate-100",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 px-5 py-3 text-[15px] font-extrabold tracking-wide uppercase transition-all select-none active:translate-y-[2px] active:border-b-2 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function ProgressBar({
  value,
  className = "",
  color = "bg-emerald-500",
}: {
  value: number;
  className?: string;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`h-4 overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div
        className={`relative h-full rounded-full transition-[width] duration-500 ease-out ${color}`}
        style={{ width: `${pct}%` }}
      >
        {pct > 4 && (
          <span className="absolute top-[3px] right-2 left-2 h-[4px] rounded-full bg-white/30" />
        )}
      </div>
    </div>
  );
}

export function Arabic({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span lang="ar" dir="rtl" className={`font-arabic ${className}`}>
      {children}
    </span>
  );
}

/** Arabisches Wort mit Umschrift darunter (sofern eingeschaltet). */
export function ArabicWord({
  word,
  className = "",
  translitClassName = "",
  align = "center",
}: {
  word: Pick<Word, "ar" | "translit">;
  className?: string;
  translitClassName?: string;
  align?: "center" | "end";
}) {
  const { showTranslit } = useProgress();
  return (
    <span className={`inline-flex flex-col ${align === "end" ? "items-end" : "items-center"}`}>
      <Arabic className={className}>{word.ar}</Arabic>
      {showTranslit && (
        <span className={`text-sm font-semibold italic opacity-70 ${translitClassName}`} lang="ar-Latn">
          {word.translit}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Aussprache (MP3-Dateien in /public/audio, erzeugt mit ElevenLabs)   */
/* ------------------------------------------------------------------ */

let currentAudio: HTMLAudioElement | null = null;

export function playWord(word: Pick<Word, "id">) {
  try {
    currentAudio?.pause();
    currentAudio = new Audio(`/audio/${audioSlug(word)}.mp3`);
    void currentAudio.play().catch(() => {});
  } catch {
    // Wiedergabe nicht möglich – ignorieren
  }
}

export function SpeakButton({
  word,
  size = "md",
}: {
  word: Pick<Word, "id">;
  size?: "sm" | "md" | "lg";
}) {
  const dims = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-14 w-14" }[size];
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        playWord(word);
      }}
      aria-label={t("listen")}
      className={`${dims} inline-flex shrink-0 items-center justify-center rounded-2xl border-b-4 border-sky-700 bg-sky-500 text-white transition-all hover:bg-sky-400 active:translate-y-[2px] active:border-b-2`}
    >
      <IconSpeaker className="h-1/2 w-1/2" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Symbole                                                            */
/* ------------------------------------------------------------------ */

type IconProps = { className?: string };

export function IconFlame({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2c.6 3.2-1.2 5.1-2.8 6.9C7.6 10.6 6 12.4 6 15a6 6 0 0 0 12 0c0-2.3-1-4.2-2.2-5.6-.2 1.4-.9 2.6-2 3.2.4-3.6-.9-7.6-1.8-10.6Z"
      />
      <path
        fill="#fde68a"
        d="M12 21a3 3 0 0 1-3-3c0-1.6 1.1-2.6 2-3.6.5 1 1.4 1.5 2.2 1.6-.2-.8 0-1.7.5-2.3.8 1 1.3 2.3 1.3 3.5a3 3 0 0 1-3 3.8Z"
      />
    </svg>
  );
}

export function IconGem({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M6 3h12l4 6-10 12L2 9l4-6Z" />
      <path fill="white" fillOpacity=".35" d="M6 3h6l-4 6H2l4-6Z" />
    </svg>
  );
}

export function IconStar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z"
      />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12.5l4.5 4.5L19 7.5"
      />
    </svg>
  );
}

export function IconX({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </svg>
  );
}

export function IconLock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z"
      />
    </svg>
  );
}

export function IconSpeaker({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4V9Z" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
      />
    </svg>
  );
}

export function IconSpeakerOff({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4V9Z" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M16.5 9.5l5 5M21.5 9.5l-5 5"
      />
    </svg>
  );
}

export function IconBolt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M13.5 2 4 13.5h6.5L9.5 22 20 9.5h-6.5L13.5 2Z" />
    </svg>
  );
}

export function IconPath({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2 3 7v2h18V7l-9-5Zm-7 9v7h3v-7H5Zm5.5 0v7h3v-7h-3Zm5.5 0v7h3v-7h-3ZM3 20v2h18v-2H3Z"
      />
    </svg>
  );
}

export function IconDumbbell({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M5 7a1.5 1.5 0 0 1 3 0v10a1.5 1.5 0 0 1-3 0V7Zm11 0a1.5 1.5 0 0 1 3 0v10a1.5 1.5 0 0 1-3 0V7ZM2 9.5a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0v-5Zm18 0a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0v-5ZM8 11h8v2H8v-2Z"
      />
    </svg>
  );
}

export function IconBook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5a.5.5 0 0 0 0 1H20v3H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"
      />
    </svg>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="8" r="4.5" fill="currentColor" />
      <path fill="currentColor" d="M3 21a9 9 0 0 1 18 0H3Z" />
    </svg>
  );
}

export function IconTarget({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
      <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  );
}
