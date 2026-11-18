"use client";

import { useRef, useState } from "react";
import { exportBackup, exportCode, importBackup, importCode } from "@/lib/progress";
import { useI18n } from "@/lib/i18n";
import { Button } from "./ui";

/** Fortschritt ohne Konto sichern und auf einem anderen Gerät wieder einlesen. */
export default function BackupCard() {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function download() {
    const blob = new Blob([exportBackup()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `koran-woerter-sicherung-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function upload(file: File) {
    const ok = importBackup(await file.text());
    setMsg({ ok, text: ok ? t("backupOk") : t("backupFail") });
  }

  async function copyCode() {
    const code = await exportCode();
    try {
      await navigator.clipboard.writeText(code);
      setMsg({ ok: true, text: t("backupCopied") });
    } catch {
      // Zwischenablage nicht erlaubt: Code zum manuellen Kopieren anzeigen
      window.prompt(t("backupCopy"), code);
    }
  }

  async function pasteCode() {
    const code = window.prompt(t("backupPastePrompt"));
    if (!code) return;
    const ok = await importCode(code);
    setMsg({ ok, text: ok ? t("backupOk") : t("backupFail") });
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-slate-200 p-4">
      <h2 className="font-extrabold text-slate-800">{t("backupTitle")}</h2>
      <p className="text-sm font-semibold text-slate-500">{t("backupHint")}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={download} className="!px-2 !text-xs">
          {t("backupDownload")}
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()} className="!px-2 !text-xs">
          {t("backupUpload")}
        </Button>
        <Button variant="secondary" onClick={copyCode} className="!px-2 !text-xs">
          {t("backupCopy")}
        </Button>
        <Button variant="secondary" onClick={pasteCode} className="!px-2 !text-xs">
          {t("backupPaste")}
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      {msg && (
        <p role="status" className={`text-sm font-bold ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}>
          {msg.text}
        </p>
      )}
    </section>
  );
}
