#!/usr/bin/env bash
# Bringt alle Tondateien auf eine einheitliche Lautheit (EBU R128, -20 LUFS, Spitze max. -3 dB).
# Aufruf: bash scripts/normalize-audio.sh [datei.mp3 ...]   (ohne Angabe: alle in public/audio)
set -euo pipefail
cd "$(dirname "$0")/.."
files=("$@"); [ ${#files[@]} -eq 0 ] && files=(public/audio/*.mp3)
for f in "${files[@]}"; do
  tmp="${f%.mp3}.norm.mp3"
  ffmpeg -hide_banner -loglevel error -y -i "$f" -af "loudnorm=I=-20:TP=-3:LRA=7" -ar 44100 -ac 1 -b:a 64k "$tmp"
  mv "$tmp" "$f"
done
echo "normalisiert: ${#files[@]} Dateien"
