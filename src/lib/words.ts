// Kernwortschatz des Korans: häufige Wörter, die zusammen einen großen Teil
// des Korantextes abdecken. Verben stehen in der Grundform (3. Person
// maskulin Singular Perfekt, z.B. "qāla" = "er sagte" → "sagen").

export type Category =
  | "glaube"
  | "menschen"
  | "schoepfung"
  | "jenseits"
  | "verben"
  | "eigenschaften"
  | "partikeln"
  | "pronomen";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "glaube", label: "Glaube & Gottesdienst" },
  { id: "menschen", label: "Mensch & Familie" },
  { id: "schoepfung", label: "Schöpfung & Zeit" },
  { id: "jenseits", label: "Leben & Jenseits" },
  { id: "verben", label: "Verben" },
  { id: "eigenschaften", label: "Eigenschaften" },
  { id: "partikeln", label: "Partikeln & Präpositionen" },
  { id: "pronomen", label: "Pronomen & Hinweiswörter" },
];

export type Word = {
  id: string;
  ar: string;
  translit: string;
  de: string;
  category: Category;
};

type Raw = [translit: string, ar: string, de: string];

const RAW: Record<Category, Raw[]> = {
  glaube: [
    ["Allāh", "اللَّه", "Allah, Gott"],
    ["rabb", "رَبّ", "Herr"],
    ["ilāh", "إِلَٰه", "Gott, Gottheit"],
    ["ar-Raḥmān", "الرَّحْمَٰن", "der Allerbarmer"],
    ["ar-Raḥīm", "الرَّحِيم", "der Barmherzige"],
    ["īmān", "إِيمَان", "Glaube"],
    ["kitāb", "كِتَاب", "Buch, Schrift"],
    ["āya", "آيَة", "Zeichen, Vers"],
    ["rasūl", "رَسُول", "Gesandter"],
    ["nabiyy", "نَبِيّ", "Prophet"],
    ["dīn", "دِين", "Religion, Gericht"],
    ["ṣalāh", "صَلَاة", "Gebet"],
    ["zakāh", "زَكَاة", "Zakat, Pflichtabgabe"],
    ["taqwā", "تَقْوَىٰ", "Gottesfurcht"],
    ["hudā", "هُدًى", "Rechtleitung"],
    ["raḥma", "رَحْمَة", "Barmherzigkeit"],
    ["ʿabd", "عَبْد", "Diener"],
    ["dhikr", "ذِكْر", "Gedenken, Ermahnung"],
    ["ḥaqq", "حَقّ", "Wahrheit"],
    ["islām", "إِسْلَام", "Hingabe (Islam)"],
    ["shayṭān", "شَيْطَان", "Satan"],
    ["malak", "مَلَك", "Engel"],
    ["nūr", "نُور", "Licht"],
    ["ẓulumāt", "ظُلُمَات", "Finsternisse"],
    ["qurʾān", "قُرْآن", "Koran, Lesung"],
    ["sabīl", "سَبِيل", "Weg"],
    ["ṣirāṭ", "صِرَاط", "Pfad"],
    ["ṣabr", "صَبْر", "Geduld"],
    ["dhanb", "ذَنْب", "Sünde"],
    ["qalb", "قَلْب", "Herz"],
    ["nafs", "نَفْس", "Seele, Selbst"],
  ],
  menschen: [
    ["nās", "نَاس", "Menschen, Leute"],
    ["insān", "إِنْسَان", "Mensch"],
    ["qawm", "قَوْم", "Volk"],
    ["ibn", "اِبْن", "Sohn"],
    ["ab", "أَب", "Vater"],
    ["umm", "أُمّ", "Mutter"],
    ["akh", "أَخ", "Bruder"],
    ["imraʾa", "اِمْرَأَة", "Frau"],
    ["rajul", "رَجُل", "Mann"],
    ["yad", "يَد", "Hand"],
    ["ʿayn", "عَيْن", "Auge, Quelle"],
    ["wajh", "وَجْه", "Gesicht, Angesicht"],
    ["samʿ", "سَمْع", "Gehör"],
    ["baṣar", "بَصَر", "Sehvermögen, Blick"],
    ["ʿilm", "عِلْم", "Wissen"],
    ["mulk", "مُلْك", "Herrschaft, Königreich"],
    ["māl", "مَال", "Besitz, Vermögen"],
    ["bayt", "بَيْت", "Haus"],
  ],
  schoepfung: [
    ["samāʾ", "سَمَاء", "Himmel"],
    ["arḍ", "أَرْض", "Erde"],
    ["shams", "شَمْس", "Sonne"],
    ["qamar", "قَمَر", "Mond"],
    ["māʾ", "مَاء", "Wasser"],
    ["layl", "لَيْل", "Nacht"],
    ["nahār", "نَهَار", "Tag (Tageslicht)"],
    ["yawm", "يَوْم", "Tag"],
    ["shayʾ", "شَيْء", "Ding, Sache"],
    ["baḥr", "بَحْر", "Meer"],
    ["jabal", "جَبَل", "Berg"],
    ["dunyā", "دُنْيَا", "diesseitige Welt"],
    ["ʿālamīn", "عَالَمِين", "Welten"],
    ["rīḥ", "رِيح", "Wind"],
    ["sāʿa", "سَاعَة", "Stunde"],
  ],
  jenseits: [
    ["ākhira", "آخِرَة", "Jenseits"],
    ["janna", "جَنَّة", "Paradies, Garten"],
    ["nār", "نَار", "Feuer, Hölle"],
    ["ʿadhāb", "عَذَاب", "Strafe, Pein"],
    ["qiyāma", "قِيَامَة", "Auferstehung"],
    ["ajr", "أَجْر", "Lohn"],
    ["mawt", "مَوْت", "Tod"],
    ["ḥayāh", "حَيَاة", "Leben"],
    ["ḥisāb", "حِسَاب", "Abrechnung"],
  ],
  verben: [
    ["qāla", "قَالَ", "sagen"],
    ["kāna", "كَانَ", "sein"],
    ["ʿalima", "عَلِمَ", "wissen"],
    ["jaʿala", "جَعَلَ", "machen, setzen"],
    ["jāʾa", "جَاءَ", "kommen"],
    ["atā", "أَتَىٰ", "kommen, bringen"],
    ["raʾā", "رَأَىٰ", "sehen"],
    ["samiʿa", "سَمِعَ", "hören"],
    ["ʿamila", "عَمِلَ", "tun, handeln"],
    ["arāda", "أَرَادَ", "wollen"],
    ["shāʾa", "شَاءَ", "wünschen, wollen"],
    ["āmana", "آمَنَ", "glauben"],
    ["kafara", "كَفَرَ", "leugnen, ungläubig sein"],
    ["khalaqa", "خَلَقَ", "erschaffen"],
    ["anzala", "أَنْزَلَ", "herabsenden"],
    ["ittabaʿa", "اِتَّبَعَ", "folgen"],
    ["daʿā", "دَعَا", "rufen, bitten"],
    ["kataba", "كَتَبَ", "schreiben, vorschreiben"],
    ["aṭāʿa", "أَطَاعَ", "gehorchen"],
    ["rajaʿa", "رَجَعَ", "zurückkehren"],
    ["hadā", "هَدَىٰ", "rechtleiten"],
    ["ẓalama", "ظَلَمَ", "Unrecht tun"],
    ["qatala", "قَتَلَ", "töten"],
    ["akala", "أَكَلَ", "essen"],
    ["khāfa", "خَافَ", "fürchten"],
    ["naṣara", "نَصَرَ", "helfen, beistehen"],
    ["dhakara", "ذَكَرَ", "gedenken, erwähnen"],
    ["ʿabada", "عَبَدَ", "anbeten, dienen"],
    ["ghafara", "غَفَرَ", "vergeben"],
    ["tāba", "تَابَ", "bereuen, umkehren"],
    ["shakara", "شَكَرَ", "danken"],
    ["aḥabba", "أَحَبَّ", "lieben"],
    ["dakhala", "دَخَلَ", "eintreten"],
    ["kharaja", "خَرَجَ", "hinausgehen"],
    ["wajada", "وَجَدَ", "finden"],
  ],
  eigenschaften: [
    ["ʿaẓīm", "عَظِيم", "gewaltig, großartig"],
    ["kabīr", "كَبِير", "groß"],
    ["ʿalīm", "عَلِيم", "allwissend"],
    ["ḥakīm", "حَكِيم", "allweise"],
    ["ghafūr", "غَفُور", "allvergebend"],
    ["qadīr", "قَدِير", "allmächtig"],
    ["alīm", "أَلِيم", "schmerzhaft"],
    ["kathīr", "كَثِير", "viel"],
    ["qalīl", "قَلِيل", "wenig"],
    ["khayr", "خَيْر", "gut, besser"],
    ["sharr", "شَرّ", "Übel"],
    ["ṣāliḥ", "صَالِح", "rechtschaffen"],
    ["mubīn", "مُبِين", "deutlich, klar"],
    ["mustaqīm", "مُسْتَقِيم", "gerade"],
    ["aḥad", "أَحَد", "einer, jemand"],
    ["kull", "كُلّ", "alle, jeder"],
    ["samīʿ", "سَمِيع", "allhörend"],
    ["baṣīr", "بَصِير", "allsehend"],
  ],
  partikeln: [
    ["min", "مِنْ", "von, aus"],
    ["fī", "فِي", "in"],
    ["ʿalā", "عَلَىٰ", "auf"],
    ["ilā", "إِلَىٰ", "zu, nach"],
    ["ʿan", "عَنْ", "über, weg von"],
    ["maʿa", "مَعَ", "mit"],
    ["lā", "لَا", "nein, nicht"],
    ["lam", "لَمْ", "nicht (Vergangenheit)"],
    ["lan", "لَنْ", "niemals (Zukunft)"],
    ["inna", "إِنَّ", "wahrlich"],
    ["idhā", "إِذَا", "wenn, sobald"],
    ["illā", "إِلَّا", "außer"],
    ["thumma", "ثُمَّ", "dann, danach"],
    ["aw", "أَوْ", "oder"],
    ["bal", "بَلْ", "vielmehr"],
    ["qad", "قَدْ", "bereits, schon"],
    ["laʿalla", "لَعَلَّ", "vielleicht, auf dass"],
    ["man", "مَنْ", "wer"],
    ["mā", "مَا", "was"],
    ["kayfa", "كَيْفَ", "wie"],
    ["yā", "يَا", "O! (Anrede)"],
    ["bayna", "بَيْنَ", "zwischen"],
    ["ʿinda", "عِنْدَ", "bei"],
    ["qabla", "قَبْلَ", "vor (zeitlich)"],
    ["baʿda", "بَعْدَ", "nach (zeitlich)"],
    ["ḥattā", "حَتَّىٰ", "bis"],
    ["dūna", "دُونَ", "außer, unterhalb"],
  ],
  pronomen: [
    ["huwa", "هُوَ", "er"],
    ["hiya", "هِيَ", "sie (Singular)"],
    ["hum", "هُمْ", "sie (Plural)"],
    ["anta", "أَنْتَ", "du"],
    ["antum", "أَنْتُمْ", "ihr"],
    ["anā", "أَنَا", "ich"],
    ["naḥnu", "نَحْنُ", "wir"],
    ["alladhī", "الَّذِي", "derjenige, welcher"],
    ["alladhīna", "الَّذِينَ", "diejenigen, welche"],
    ["hādhā", "هَٰذَا", "dieser, dies"],
    ["dhālika", "ذَٰلِكَ", "jener, das"],
  ],
};

export const WORDS: Word[] = (Object.keys(RAW) as Category[]).flatMap((cat) =>
  RAW[cat].map(([translit, ar, de]) => ({
    id: `${cat}:${translit}`,
    ar,
    translit,
    de,
    category: cat,
  })),
);

/** Einzelne Bedeutungs-Stichwörter, um zu ähnliche Antwortoptionen zu vermeiden. */
export function meaningKeys(de: string): string[] {
  return de
    .replace(/\(.*?\)/g, "")
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Dateiname der Aussprache-Datei in /public/audio (nur ASCII). */
export function audioSlug(w: Pick<Word, "id">): string {
  return w.id
    .replace(/\u02BF/g, "3") // ʿAin (wie im arabischen Chat-Alphabet)
    .replace(/\u02BE/g, "2") // Hamza
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
