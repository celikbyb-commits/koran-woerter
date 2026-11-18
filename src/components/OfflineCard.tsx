"use client";

import { useState } from "react";
import { WORDS, audioSlug } from "@/lib/words";
import { useI18n } from "@/lib/i18n";
import { Button, ProgressBar } from "./ui";

/** Installation als App erklären und alle Tondateien für die Offline-Nutzung laden. */
export default function OfflineCard() {
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [pct, setPct] = useState(0);

  async function loadAll() {
    setState("loading");
    const urls = WORDS.map((w) => `/audio/${audioSlug(w)}.mp3`).concat("/data/beispielverse.json");
    // Direkt im Speicher ablegen, den auch der Service Worker benutzt (siehe public/sw.js)
    const cache = "caches" in window ? await caches.open("assets-v2") : null;
    let failed = 0;
    for (let i = 0; i < urls.length; i += 12) {
      await Promise.all(
        urls.slice(i, i + 12).map(async (u) => {
          try {
            if (cache && (await cache.match(u))) return;
            const res = await fetch(u);
            if (res.ok && cache) await cache.put(u, res);
          } catch {
            failed++;
          }
        }),
      );
      setPct(Math.round((Math.min(urls.length, i + 12) / urls.length) * 100));
    }
    setState(failed === 0 ? "done" : "idle");
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-slate-200 p-4">
      <h2 className="font-extrabold text-slate-800">{t("install")}</h2>
      <p className="text-sm font-semibold text-slate-500">{t("installHint")}</p>
      {state === "loading" ? (
        <div className="flex flex-col gap-2">
          <ProgressBar value={pct / 100} />
          <p className="text-sm font-bold text-slate-400">{t("offlineAudioLoading", { n: pct })}</p>
        </div>
      ) : state === "done" ? (
        <p className="text-sm font-extrabold text-emerald-600">{t("offlineAudioDone")}</p>
      ) : (
        <Button variant="secondary" onClick={loadAll} className="w-full !normal-case">
          {t("offlineAudio")}
        </Button>
      )}
    </section>
  );
}
