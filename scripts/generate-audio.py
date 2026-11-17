#!/usr/bin/env python3
"""Erzeugt die Aussprache-Dateien (public/audio/<slug>.mp3) mit ElevenLabs.

Aufruf (im Projektordner):
    ELEVENLABS_API_KEY=sk_... python3 scripts/generate-audio.py [--force] [slug ...]

Vorhandene Dateien werden übersprungen, außer mit --force. Mit einzelnen
Slugs (z.B. glaube-allah) werden nur diese Wörter neu erzeugt.
"""

import json
import os
import subprocess
import sys
import urllib.request

VOICE_ID = "w9rzKr21ANQAGQcbM9W2"  # "MAVERA Qadir"
MODEL_ID = "eleven_multilingual_v2"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio")


def load_words():
    out = subprocess.check_output(
        ["node", "--experimental-strip-types", "--no-warnings", "scripts/export-words.mts"],
        cwd=os.path.join(os.path.dirname(__file__), ".."),
    )
    return json.loads(out)


def tts(text: str) -> bytes:
    body = json.dumps(
        {
            "text": text,
            "model_id": MODEL_ID,
            "language_code": "ar",
            "voice_settings": {"stability": 0.6, "similarity_boost": 0.8},
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
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def main():
    args = sys.argv[1:]
    force = "--force" in args
    only = {a for a in args if not a.startswith("--")}
    os.makedirs(OUT_DIR, exist_ok=True)
    words = load_words()
    for w in words:
        if only and w["slug"] not in only:
            continue
        path = os.path.join(OUT_DIR, f"{w['slug']}.mp3")
        if os.path.exists(path) and not force and not only:
            continue
        data = tts(w["ar"])
        with open(path, "wb") as f:
            f.write(data)
        print(f"{w['slug']:<28} {w['translit']:<14} {len(data):>6} B")


if __name__ == "__main__":
    main()
