// Gibt alle Wörter als JSON aus (für scripts/generate-audio.sh).
import { WORDS, audioSlug } from "../src/lib/words.ts";
console.log(JSON.stringify(WORDS.map((w) => ({ slug: audioSlug(w), ar: w.ar, translit: w.translit }))));
