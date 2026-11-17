#!/usr/bin/env python3
"""Erzeugt src/data/vocab.json aus den Korpusdaten und den Übersetzungen.

Eingaben (im Ordner data/):
  korpus-grundformen.json  – Grundformen mit Häufigkeit (Quranic Arabic Corpus)
  korpus-meta.json         – Gesamtzahlen für die Abdeckung
  uebersetzungen.tsv       – Rang <TAB> arabische Anzeigeform (optional) <TAB> Deutsch
                             ("-" als Deutsch = Eintrag weglassen)

Aufruf: python3 scripts/build-vocab.py
"""

import json
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..")
DATA = os.path.join(ROOT, "data")

UNIT_SIZE = 60

# ------------------------------------------------------------------
# Umschrift (vereinfachte DMG-Umschrift) aus vokalisiertem Arabisch
# ------------------------------------------------------------------

CONS = {
    "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "ḥ", "خ": "kh", "د": "d",
    "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh", "ص": "ṣ", "ض": "ḍ",
    "ط": "ṭ", "ظ": "ẓ", "ع": "ʿ", "غ": "gh", "ف": "f", "ق": "q", "ك": "k",
    "ل": "l", "م": "m", "ن": "n", "ه": "h", "و": "w", "ي": "y",
    "ء": "ʾ", "أ": "ʾ", "إ": "ʾ", "ؤ": "ʾ", "ئ": "ʾ",
}
FATHA, KASRA, DAMMA = "َ", "ِ", "ُ"
SUKUN, SHADDA, DAGGER = "ْ", "ّ", "ٰ"
TANWIN = {"ً": "an", "ٌ": "un", "ٍ": "in"}


def translit(ar: str) -> str:
    s = ar.replace("ـ", "").replace("ٱ", "ا").replace("ۡ", SUKUN)
    out = []
    i = 0
    n = len(s)
    last_vowel = ""
    while i < n:
        c = s[i]
        nxt = s[i + 1] if i + 1 < n else ""
        if c == " ":
            out.append(" ")
            last_vowel = ""
        elif c == "آ":
            out.append("ʾā" if out else "ā")
            last_vowel = "ā"
        elif c in (FATHA, KASRA, DAMMA):
            v = {FATHA: "a", KASRA: "i", DAMMA: "u"}[c]
            out.append(v)
            last_vowel = v
        elif c == DAGGER:
            if out and out[-1] == "a":
                out[-1] = "ā"
            else:
                out.append("ā")
            last_vowel = "ā"
        elif c in TANWIN:
            # Tanwin in der Grundform weglassen (nur Fatha-Tanwin auf ى → ā)
            if nxt in ("ى", "ا") or (out and out[-1] in ("y",)):
                pass
            last_vowel = ""
        elif c == SHADDA:
            # vorherigen Konsonanten verdoppeln
            j = len(out) - 1
            while j >= 0 and out[j] in ("a", "i", "u"):
                j -= 1
            if j >= 0:
                out.insert(j + 1, out[j])
        elif c == SUKUN:
            pass
        elif c == "ا":
            if not out:
                # Wortanfang: Alif (Hamzat al-Wasl) – "al-" beim Artikel, sonst "i"
                if nxt in (FATHA, KASRA, DAMMA):
                    pass
                elif nxt == "ل" and (i + 2 >= n or s[i + 2] not in (FATHA, KASRA, DAMMA)):
                    out.append("a")
                    last_vowel = "a"
                else:
                    out.append("i")
                    last_vowel = "i"
            elif last_vowel == "a" or (out and out[-1] == "a"):
                if out[-1] == "a":
                    out[-1] = "ā"
                last_vowel = "ā"
            elif last_vowel in ("ā",):
                pass
            else:
                out.append("ā")
                last_vowel = "ā"
        elif c == "ى":
            if out and out[-1] == "a":
                out[-1] = "ā"
            elif out and out[-1] == "i":
                out[-1] = "ī"
            else:
                out.append("ā")
            last_vowel = "ā"
        elif c == "ة":
            out.append("a" if not (out and out[-1] in ("a", "ā")) else "")
        elif c == "ي" and out and out[-1] == "i" and nxt not in (FATHA, KASRA, DAMMA, SHADDA):
            out[-1] = "ī"
            last_vowel = "ī"
        elif c == "و" and out and out[-1] == "u" and nxt not in (FATHA, KASRA, DAMMA, SHADDA):
            out[-1] = "ū"
            last_vowel = "ū"
        elif c in CONS:
            t = CONS[c]
            # Hamza auf Alif am Wortanfang nicht schreiben
            if t == "ʾ" and not out:
                pass
            else:
                out.append(t)
            last_vowel = ""
        i += 1
    res = "".join(out)
    res = re.sub(r"^al(?=[^aeiouāīū])", "al-", res)
    return res


# ------------------------------------------------------------------

def main():
    src = json.load(open(os.path.join(DATA, "korpus-grundformen.json"), encoding="utf-8"))
    meta = json.load(open(os.path.join(DATA, "korpus-meta.json"), encoding="utf-8"))
    total = meta["bestandteile_mit_grundform"]
    de = {}
    for line in open(os.path.join(DATA, "uebersetzungen.tsv"), encoding="utf-8"):
        parts = line.rstrip("\n").split("\t")
        if len(parts) == 2:
            de[int(parts[0])] = ("", parts[1])
        elif len(parts) == 3:
            de[int(parts[0])] = (parts[1], parts[2])

    words = []
    covered = 0
    for o in src:
        ar_override, meaning = de.get(o["rank"], ("", ""))
        covered += o["count"]
        if not meaning or meaning == "-":
            continue
        ar = ar_override or o["lem"]
        if o["pos"] == "V":
            cat = "verben"
        elif o["pn"]:
            cat = "namen"
        elif o["pos"] == "P" or any(t in o["tag"] for t in ("REL", "DEM", "PRON", "COND", "INTG", "EXP")):
            cat = "partikeln"
        else:
            cat = "nomen"
        words.append({
            "id": f"r{o['rank']}",
            "rank": o["rank"],
            "ar": ar,
            "quran": o["word"] if o["word"] and o["word"] != ar else "",
            "translit": "Allāh" if re.sub(r"[\u064B-\u0652]", "", ar) == "الله" else translit(ar),
            "de": meaning,
            "root": " ".join(o["root"]) if o["root"] else "",
            "count": o["count"],
            "category": cat,
            "coverage": round(covered / total * 100, 1),
        })

    units = []
    for u in range(0, len(words), UNIT_SIZE):
        chunk = words[u:u + UNIT_SIZE]
        units.append({
            "number": len(units) + 1,
            "from": u + 1,
            "to": u + len(chunk),
            "coverage": chunk[-1]["coverage"],
        })
        for w in chunk:
            w["unit"] = len(units)

    os.makedirs(os.path.join(ROOT, "src", "data"), exist_ok=True)
    with open(os.path.join(ROOT, "src", "data", "vocab.json"), "w", encoding="utf-8") as f:
        json.dump({"units": units, "words": words, "meta": meta}, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(words)} Wörter in {len(units)} Einheiten")


if __name__ == "__main__":
    main()
