#!/usr/bin/env python3
"""Erzeugt die Aussprache-Dateien (public/audio/<id>.mp3) mit ElevenLabs.

Aufruf (im Projektordner, nach scripts/build-vocab.py):
    ELEVENLABS_API_KEY=sk_... python3 scripts/generate-audio.py [--force] [id ...]

Vorhandene Dateien werden übersprungen, außer mit --force oder wenn
einzelne IDs (z.B. r6) angegeben sind.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request

VOICE_ID = "w9rzKr21ANQAGQcbM9W2"  # "MAVERA Qadir"
MODEL_ID = "eleven_multilingual_v2"
ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT_DIR = os.path.join(ROOT, "public", "audio")

# Einzelne Wörter, die mit den Standard-Einstellungen falsch klangen
# (per Gehör ausgewählt): ID -> (Text, Modell, Stabilität)
OVERRIDES = {
    "r6": ("اَللّٰه.", "eleven_multilingual_v2", 0.85),  # Allāh mit a, nicht "Illāh"
    "r74": ("أَمْر", "eleven_turbo_v2_5", 0.85),  # amr ohne -un, nicht übersteuert
}


def tts(text: str, model: str = MODEL_ID, stability: float = 0.85) -> bytes:
    body = json.dumps(
        {
            "text": text,
            "model_id": model,
            "language_code": "ar",
            "voice_settings": {"stability": stability, "similarity_boost": 0.75, "style": 0.0},
        }
    ).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_64",
        data=body,
        headers={
            "Content-Type": "application/json",
            "xi-api-key": os.environ.get("ELEVENLABS_API_KEY", ""),
        },
    )
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and attempt < 4:
                time.sleep(5 * (attempt + 1))
                continue
            raise
    raise RuntimeError("unreachable")


def main():
    args = sys.argv[1:]
    force = "--force" in args
    only = {a for a in args if not a.startswith("--")}
    os.makedirs(OUT_DIR, exist_ok=True)
    words = json.load(open(os.path.join(ROOT, "src", "data", "vocab.json"), encoding="utf-8"))["words"]
    done = 0
    for w in words:
        if only and w["id"] not in only:
            continue
        path = os.path.join(OUT_DIR, f"{w['id']}.mp3")
        if os.path.exists(path) and not force and not only:
            continue
        # Punkt am Ende: verhindert, dass sehr kurze Wörter abgeschnitten werden
        if w["id"] in OVERRIDES:
            text, model, stab = OVERRIDES[w["id"]]
            data = tts(text, model, stab)
        else:
            data = tts(w["ar"] + ".")
        with open(path, "wb") as f:
            f.write(data)
        done += 1
        if done % 50 == 0:
            print(f"{done} erzeugt (zuletzt {w['id']} {w['translit']})", flush=True)
    print(f"fertig: {done} neu erzeugt – danach: bash scripts/normalize-audio.sh", flush=True)


if __name__ == "__main__":
    main()
