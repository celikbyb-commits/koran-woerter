"use client";

import { useProgress, type Lang } from "./progress";
import type { Word } from "./words";

// Alle Oberflächen-Texte auf Deutsch und Türkisch.
// {name} wird durch Werte ersetzt, z.B. t("lessonN", { n: 3 }).

const de = {
  appName: "Koran-Wörter",
  tabLearn: "Lernen",
  tabPractice: "Üben",
  tabWords: "Wörter",
  tabStats: "Statistik",
  streak: "Tage in Folge",
  xpTotal: "XP gesamt",
  dailyGoal: "Tagesziel",
  dailyDone: "Geschafft! Bis morgen 🌙",
  dailyCollect: "Sammle {n} XP",
  language: "Sprache",

  // Lernpfad
  advancedTitle: "Profi-Modus für Fortgeschrittene",
  advancedSub: "Arabisch und Deutsch nebeneinander – Paare finden",
  unitHeader: "Einheit {n} · {done}/{total} Lektionen",
  unitTitle: "Wörter {from}–{to}",
  unitCoverage: "Danach kennst du ca. {p} % der Wörter im Koran",
  words: "Wörter",
  start: "Start",
  lessonN: "Lektion {n}",
  bestResult: "Bestes Ergebnis: {p}% · {n} Wörter",
  newWordsN: "{n} neue Wörter",
  lockedHint: "Schließe zuerst die vorherigen Lektionen ab.",
  repeatXp: "Wiederholen (+5 XP)",
  goXp: "Los geht's (+10 XP)",
  locked: "Gesperrt",
  doneSuffix: " (abgeschlossen)",
  lockedSuffix: " (gesperrt)",
  verseFooter: "„Und sag: Mein Herr, mehre mich an Wissen.“ (Ṭā-Hā 20:114)",
  reviewTitle: "Wiederholung fällig",
  reviewSub: "{n} Wörter solltest du heute wiederholen",
  reviewNone: "Alles wiederholt – gut gemacht!",
  reviewSession: "Wiederholung",

  // Lektion
  exitLesson: "Lektion beenden",
  exitLessonConfirm: "Lektion wirklich beenden? Dein Fortschritt in dieser Lektion geht verloren.",
  soundOff: "Ton aus",
  soundOn: "Ton an",
  inARow: "{n}× in Folge",
  newWord: "Neues Wort",
  rememberWord: "Merke dir dieses Wort",
  inQuranN: "{n}× im Koran",
  root: "Wurzel",
  quranExample: "im Koran z. B.",
  whatMeans: "Was bedeutet dieses Wort?",
  chooseArabic: "Wähle das richtige arabische Wort",
  wrong: "Leider falsch",
  correctIs: "Richtig ist:",
  check: "Prüfen",
  continue: "Weiter",
  perfect: "Perfekt!",
  lessonDone: "Lektion geschafft!",
  accuracy: "Genauigkeit",
  time: "Zeit",
  practiceMore: "Noch üben",
  praise: "Richtig!|Super!|Sehr gut!|Klasse!|Ausgezeichnet!|Mā shāʾ Allāh!",
  verse: "Vers",
  verseShow: "Im Vers ansehen",
  verseTranslation: "Übersetzung auf quran.com",
  surah: "Sure {s}, Vers {a}",

  // Profi-Modus
  exitTraining: "Training beenden",
  exitTrainingConfirm: "Training wirklich beenden?",
  proMode: "Profi-Modus",
  findPairs: "Finde die Paare",
  mistakesN: "{n} Fehler",
  roundOf: "Runde {n} von {total}",
  proTitle: "Profi-Modus · Paare finden",

  // Üben
  practiceTitle: "Üben",
  advanced: "Fortgeschrittene",
  proSub: "Arabisch links, Deutsch rechts – finde schnell die Paare",
  wordsFrom: "Wörter aus",
  amount: "Anzahl",
  findPairsBtn: "Paare finden",
  all: "Alle",
  repeatMistakes: "Fehler wiederholen",
  weakN: "{n} Wörter, die noch nicht sitzen",
  noWeak: "Keine offenen Fehler – sehr gut!",
  freeTraining: "Freies Training",
  freeSub: "Stell dir dein eigenes Quiz zusammen",
  direction: "Richtung",
  questions: "Fragen",
  startTraining: "Training starten",
  dirArDe: "Arabisch → Deutsch",
  dirDeAr: "Deutsch → Arabisch",
  dirMix: "Gemischt",
  srcSeen: "Schon gelernte",
  srcTop100: "Top 100",
  srcTop500: "Top 500",
  srcAll: "Alle ({n})",

  // Wortarten
  catNomen: "Nomen & Adjektive",
  catVerben: "Verben",
  catPartikeln: "Partikeln & Pronomen",
  catNamen: "Namen",

  // Wörter
  learnedOf: "{n}/{total} gelernt",
  searchPlaceholder: "Suchen – Deutsch, Umschrift, Arabisch oder Wurzel",
  unitN: "Einheit {n}",
  wordsSorted: "{n} Wörter · sortiert nach Häufigkeit im Koran",
  moreN: "Weitere anzeigen ({n})",
  noneFound: "Kein Wort gefunden.",
  sourceNote:
    "Auswahl und Häufigkeiten: alle Grundformen, die mindestens {min}-mal im Koran vorkommen ({total} Wörter gesamt). Quelle: Quranic Arabic Corpus (corpus.quran.com). Die deutschen Bedeutungen sind eine Lernhilfe und keine Koranübersetzung.",
  strength: "Lernstand {n} von {max}",
  listen: "Aussprache anhören",

  // Statistik
  statsTitle: "Statistik",
  wordsLearned: "Wörter gelernt",
  lessons: "Lektionen",
  thisWeek: "Diese Woche",
  todayXp: "Heute {n}/{goal} XP",
  perUnit: "Fortschritt pro Einheit",
  learnedNote:
    "Ein Wort gilt als gelernt, wenn du es {n}× an verschiedenen Tagen richtig hattest. Dein Fortschritt wird nur auf diesem Gerät gespeichert.",
  reset: "Fortschritt zurücksetzen",
  resetConfirm: "Gesamten Lernfortschritt wirklich löschen?",
  weekdays: "So|Mo|Di|Mi|Do|Fr|Sa",
  install: "Als App installieren",
  installHint:
    "Im Browser-Menü „Zum Startbildschirm hinzufügen“ wählen. Danach funktioniert die App auch ohne Internet.",
  offlineAudio: "Alle Töne für offline laden",
  offlineAudioDone: "Alle Töne sind offline verfügbar ✓",
  offlineAudioLoading: "Lade Töne … {n}%",
} as const;

type Key = keyof typeof de;

const tr: Record<Key, string> = {
  appName: "Kur'an Kelimeleri",
  tabLearn: "Öğren",
  tabPractice: "Pratik",
  tabWords: "Kelimeler",
  tabStats: "İstatistik",
  streak: "Gün üst üste",
  xpTotal: "Toplam XP",
  dailyGoal: "Günlük hedef",
  dailyDone: "Tamamlandı! Yarın görüşürüz 🌙",
  dailyCollect: "{n} XP topla",
  language: "Dil",

  advancedTitle: "İleri seviye: Profi modu",
  advancedSub: "Arapça ve Türkçe yan yana – eşleri bul",
  unitHeader: "Ünite {n} · {done}/{total} ders",
  unitTitle: "Kelime {from}–{to}",
  unitCoverage: "Bundan sonra Kur'an kelimelerinin yaklaşık %{p}'ini bilirsin",
  words: "Kelimeler",
  start: "Başla",
  lessonN: "Ders {n}",
  bestResult: "En iyi sonuç: %{p} · {n} kelime",
  newWordsN: "{n} yeni kelime",
  lockedHint: "Önce önceki dersleri tamamla.",
  repeatXp: "Tekrarla (+5 XP)",
  goXp: "Başlayalım (+10 XP)",
  locked: "Kilitli",
  doneSuffix: " (tamamlandı)",
  lockedSuffix: " (kilitli)",
  verseFooter: "“De ki: Rabbim, ilmimi artır.” (Tâhâ 20:114)",
  reviewTitle: "Tekrar zamanı",
  reviewSub: "Bugün {n} kelimeyi tekrar etmelisin",
  reviewNone: "Hepsi tekrar edildi – aferin!",
  reviewSession: "Tekrar",

  exitLesson: "Dersi bitir",
  exitLessonConfirm: "Dersi gerçekten bitirmek istiyor musun? Bu dersteki ilerlemen kaybolur.",
  soundOff: "Sesi kapat",
  soundOn: "Sesi aç",
  inARow: "{n} kez üst üste",
  newWord: "Yeni kelime",
  rememberWord: "Bu kelimeyi aklında tut",
  inQuranN: "Kur'an'da {n} kez",
  root: "Kök",
  quranExample: "Kur'an'da örn.",
  whatMeans: "Bu kelime ne anlama geliyor?",
  chooseArabic: "Doğru Arapça kelimeyi seç",
  wrong: "Maalesef yanlış",
  correctIs: "Doğrusu:",
  check: "Kontrol et",
  continue: "Devam",
  perfect: "Mükemmel!",
  lessonDone: "Ders tamamlandı!",
  accuracy: "Doğruluk",
  time: "Süre",
  practiceMore: "Tekrar et",
  praise: "Doğru!|Süper!|Çok iyi!|Harika!|Mükemmel!|Mâşâallah!",
  verse: "Ayet",
  verseShow: "Ayette gör",
  verseTranslation: "quran.com'da meali",
  surah: "Sure {s}, ayet {a}",

  exitTraining: "Antrenmanı bitir",
  exitTrainingConfirm: "Antrenmanı gerçekten bitirmek istiyor musun?",
  proMode: "Profi modu",
  findPairs: "Eşleri bul",
  mistakesN: "{n} hata",
  roundOf: "Tur {n} / {total}",
  proTitle: "Profi modu · Eşleri bul",

  practiceTitle: "Pratik",
  advanced: "İleri seviye",
  proSub: "Solda Arapça, sağda Türkçe – eşleri hızla bul",
  wordsFrom: "Kelimeler",
  amount: "Adet",
  findPairsBtn: "Eşleri bul",
  all: "Hepsi",
  repeatMistakes: "Hataları tekrarla",
  weakN: "Henüz oturmamış {n} kelime",
  noWeak: "Açık hata yok – çok iyi!",
  freeTraining: "Serbest antrenman",
  freeSub: "Kendi testini oluştur",
  direction: "Yön",
  questions: "Soru",
  startTraining: "Antrenmanı başlat",
  dirArDe: "Arapça → Türkçe",
  dirDeAr: "Türkçe → Arapça",
  dirMix: "Karışık",
  srcSeen: "Öğrendiklerim",
  srcTop100: "İlk 100",
  srcTop500: "İlk 500",
  srcAll: "Hepsi ({n})",

  catNomen: "İsim & sıfat",
  catVerben: "Fiiller",
  catPartikeln: "Edat & zamir",
  catNamen: "Özel isimler",

  learnedOf: "{n}/{total} öğrenildi",
  searchPlaceholder: "Ara – Türkçe, okunuş, Arapça veya kök",
  unitN: "Ünite {n}",
  wordsSorted: "{n} kelime · Kur'an'daki sıklığa göre",
  moreN: "Daha fazla göster ({n})",
  noneFound: "Kelime bulunamadı.",
  sourceNote:
    "Seçim ve sıklıklar: Kur'an'da en az {min} kez geçen tüm kök kelimeler (toplam {total} kelime). Kaynak: Quranic Arabic Corpus (corpus.quran.com). Türkçe anlamlar bir öğrenme yardımıdır, Kur'an meali değildir.",
  strength: "Öğrenme durumu {n} / {max}",
  listen: "Telaffuzu dinle",

  statsTitle: "İstatistik",
  wordsLearned: "Öğrenilen kelime",
  lessons: "Dersler",
  thisWeek: "Bu hafta",
  todayXp: "Bugün {n}/{goal} XP",
  perUnit: "Ünite bazında ilerleme",
  learnedNote:
    "Bir kelimeyi farklı günlerde {n} kez doğru bilirsen öğrenilmiş sayılır. İlerlemen yalnızca bu cihazda kaydedilir.",
  reset: "İlerlemeyi sıfırla",
  resetConfirm: "Tüm öğrenme ilerlemesi gerçekten silinsin mi?",
  weekdays: "Paz|Pzt|Sal|Çar|Per|Cum|Cmt",
  install: "Uygulama olarak yükle",
  installHint:
    "Tarayıcı menüsünden “Ana ekrana ekle”yi seç. Sonra uygulama internetsiz de çalışır.",
  offlineAudio: "Tüm sesleri çevrimdışı için indir",
  offlineAudioDone: "Tüm sesler çevrimdışı kullanılabilir ✓",
  offlineAudioLoading: "Sesler indiriliyor … %{n}",
};

const DICT: Record<Lang, Record<Key, string>> = { de, tr };

export type T = (key: Key, vars?: Record<string, string | number>) => string;

function format(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export function translate(lang: Lang, key: Key, vars?: Record<string, string | number>) {
  return format(DICT[lang][key], vars);
}

/** Übersetzungsschlüssel der Wortarten */
export const CATEGORY_KEY = {
  nomen: "catNomen",
  verben: "catVerben",
  partikeln: "catPartikeln",
  namen: "catNamen",
} as const;

/** Bedeutung eines Wortes in der gewählten Sprache. */
export function meaningOf(w: Pick<Word, "de" | "tr">, lang: Lang): string {
  return lang === "tr" && w.tr ? w.tr : w.de;
}

export function useI18n() {
  const { lang } = useProgress();
  const t: T = (key, vars) => translate(lang, key, vars);
  const m = (w: Pick<Word, "de" | "tr">) => meaningOf(w, lang);
  const num = (n: number) => n.toLocaleString(lang === "tr" ? "tr-TR" : "de-DE");
  return { lang, t, m, num };
}
