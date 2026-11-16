"use client";

import { useState } from "react";
import Trainer from "./Trainer";
import WordList from "./WordList";

type Tab = "training" | "liste";

export default function KoranApp() {
  const [tab, setTab] = useState<Tab>("training");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/90 px-4 pt-4 backdrop-blur">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-lg font-semibold text-slate-900">Koran-Wörter</h1>
          <span className="font-arabic text-2xl text-emerald-700" lang="ar">
            كَلِمَات القُرْآن
          </span>
        </div>
        <nav className="mt-3 flex gap-1" aria-label="Bereiche">
          {(
            [
              ["training", "Training"],
              ["liste", "Wortliste"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                tab === id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-4 py-5">
        {tab === "training" ? <Trainer /> : <WordList />}
      </main>
    </div>
  );
}
