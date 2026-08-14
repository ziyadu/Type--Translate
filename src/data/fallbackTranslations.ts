export interface FallbackWord {
  translated: string;
  pronunciation: string;
}

export const FALLBACK_DICTIONARY: Record<string, Record<string, FallbackWord>> = {
  // Arabic
  ar: {
    hello: { translated: "مرحبا", pronunciation: "marhaban" },
    world: { translated: "العالم", pronunciation: "al-alam" },
    how: { translated: "كيف", pronunciation: "kayfa" },
    are: { translated: "تكون", pronunciation: "takun" },
    you: { translated: "انت", pronunciation: "anta" },
    today: { translated: "اليوم", pronunciation: "al-yawm" },
    simple: { translated: "بسيط", pronunciation: "baseet" },
    complex: { translated: "معقد", pronunciation: "mu'aqqad" },
    journey: { translated: "رحلة", pronunciation: "rihlat" },
    success: { translated: "نجاح", pronunciation: "najah" },
    program: { translated: "برنامج", pronunciation: "barnamaj" },
    science: { translated: "علم", pronunciation: "ilm" },
    planet: { translated: "كوكب", pronunciation: "kawkab" },
    explore: { translated: "استكشاف", pronunciation: "istikshaf" },
    nature: { translated: "طبيعة", pronunciation: "tabi'ah" },
    code: { translated: "رمز", pronunciation: "ramz" },
    just: { translated: "فقط", pronunciation: "faqat" },
    by: { translated: "بواسطة", pronunciation: "biwasitat" },
    look: { translated: "انظر", pronunciation: "unzur" },
    this: { translated: "هذا", pronunciation: "hadha" }
  },
  // Hindi
  hi: {
    hello: { translated: "नमस्ते", pronunciation: "namaste" },
    world: { translated: "दुनिया", pronunciation: "duniya" },
    how: { translated: "कैसे", pronunciation: "kaise" },
    are: { translated: "हैं", pronunciation: "hain" },
    you: { translated: "आप", pronunciation: "aap" },
    today: { translated: "आज", pronunciation: "aaj" },
    simple: { translated: "सरल", pronunciation: "saral" },
    complex: { translated: "जटिल", pronunciation: "jatil" },
    journey: { translated: "यात्रा", pronunciation: "yaatra" },
    success: { translated: "सफलता", pronunciation: "safalta" },
    program: { translated: "कार्यक्रम", pronunciation: "kaaryakram" },
    science: { translated: "विज्ञान", pronunciation: "vigyaan" },
    planet: { translated: "ग्रह", pronunciation: "grah" },
    explore: { translated: "खोज", pronunciation: "khoj" },
    nature: { translated: "प्रकृति", pronunciation: "prakriti" },
    quantum: { translated: "क्वांटम", pronunciation: "kwaantam" },
    galaxy: { translated: "आकाशगंगा", pronunciation: "aakaashganga" },
    harmony: { translated: "सामंजस्य", pronunciation: "saamanjasy" },
    balance: { translated: "संतुलन", pronunciation: "santulan" },
    crystal: { translated: "क्रिस्टल", pronunciation: "kristal" },
    rhythm: { translated: "लय", pronunciation: "lay" },
    code: { translated: "कोड", pronunciation: "kod" },
    humor: { translated: "हास्य", pronunciation: "haasy" },
    people: { translated: "लोग", pronunciation: "log" },
    year: { translated: "वर्ष", pronunciation: "varsh" },
    good: { translated: "अच्छा", pronunciation: "achha" },
    some: { translated: "कुछ", pronunciation: "kuchh" },
    could: { translated: "सकते हैं", pronunciation: "sakte hain" },
    them: { translated: "उन्हें", pronunciation: "unhein" },
    see: { translated: "देखना", pronunciation: "dekhna" },
    other: { translated: "अन्य", pronunciation: "any" },
    than: { translated: "की तुलना में", pronunciation: "ki tulna mein" },
    then: { translated: "तब", pronunciation: "tab" },
    now: { translated: "अब", pronunciation: "ab" },
    look: { translated: "देखो", pronunciation: "dekho" },
    only: { translated: "केवल", pronunciation: "keval" },
    come: { translated: "आना", pronunciation: "aana" },
    over: { translated: "ऊपर", pronunciation: "oopar" },
    think: { translated: "सोचना", pronunciation: "sochna" },
    also: { translated: "भी", pronunciation: "bhee" },
    just: { translated: "बस", pronunciation: "bas" },
    by: { translated: "द्वारा", pronunciation: "dwaara" },
    this: { translated: "यह", pronunciation: "yah" }
  },
  // Bengali
  bn: {
    hello: { translated: "হ্যালো", pronunciation: "hyālō" },
    world: { translated: "বিশ্ব", pronunciation: "bishsho" },
    how: { translated: "কেমন", pronunciation: "kemon" },
    are: { translated: "আছেন", pronunciation: "achen" },
    you: { translated: "আপনি", pronunciation: "apni" },
    today: { translated: "আজ", pronunciation: "aj" },
    simple: { translated: "সহজ", pronunciation: "shohoj" },
    complex: { translated: "জটিল", pronunciation: "jotil" },
    journey: { translated: "যাত্রা", pronunciation: "jatra" },
    success: { translated: "সফলতা", pronunciation: "shofolta" },
    program: { translated: "প্রোগ্রাম", pronunciation: "program" },
    science: { translated: "বিজ্ঞান", pronunciation: "biggan" },
    planet: { translated: "গ্রহ", pronunciation: "groho" },
    explore: { translated: "অন্বেষণ", pronunciation: "onweshon" },
    nature: { translated: "প্রকৃতি", pronunciation: "prokriti" },
    code: { translated: "কোড", pronunciation: "kod" },
    just: { translated: "শুধু", pronunciation: "shudhu" },
    by: { translated: "দ্বারা", pronunciation: "dwara" },
    look: { translated: "দেখুন", pronunciation: "dekhun" },
    this: { translated: "এটি", pronunciation: "eti" }
  },
  // Spanish
  es: {
    hello: { translated: "hola", pronunciation: "OH-lah" },
    world: { translated: "mundo", pronunciation: "MOON-doh" },
    how: { translated: "cómo", pronunciation: "cOH-moh" },
    are: { translated: "están", pronunciation: "ehs-tAHN" },
    you: { translated: "tú", pronunciation: "too" },
    today: { translated: "hoy", pronunciation: "oy" },
    simple: { translated: "simple", pronunciation: "SEEM-pleh" },
    complex: { translated: "complejo", pronunciation: "cohm-PLEH-hoh" },
    journey: { translated: "viaje", pronunciation: "be-AH-heh" },
    success: { translated: "éxito", pronunciation: "EHK-see-toh" },
    program: { translated: "programa", pronunciation: "proh-GRAH-mah" },
    science: { translated: "ciencia", pronunciation: "see-EHN-syah" },
    planet: { translated: "planeta", pronunciation: "plah-NEH-tah" },
    explore: { translated: "explorar", pronunciation: "ehks-ploh-RAHR" },
    nature: { translated: "naturaleza", pronunciation: "nah-too-rah-LEH-zah" },
    code: { translated: "código", pronunciation: "KOH-dee-goh" },
    just: { translated: "solo", pronunciation: "SOH-loh" },
    by: { translated: "por", pronunciation: "pohr" },
    look: { translated: "mira", pronunciation: "MEE-rah" },
    this: { translated: "esto", pronunciation: "EHS-toh" }
  },
  // French
  fr: {
    hello: { translated: "bonjour", pronunciation: "bohn-zhoor" },
    world: { translated: "monde", pronunciation: "mohnd" },
    how: { translated: "comment", pronunciation: "co-mahnd" },
    are: { translated: "êtes", pronunciation: "ehtr" },
    you: { translated: "vous", pronunciation: "voo" },
    today: { translated: "aujourd'hui", pronunciation: "o-zhor-dwee" },
    simple: { translated: "simple", pronunciation: "san-pl" },
    complex: { translated: "complexe", pronunciation: "cohn-plex" },
    journey: { translated: "voyage", pronunciation: "vwa-yahzh" },
    success: { translated: "succès", pronunciation: "suk-seh" },
    program: { translated: "programme", pronunciation: "pro-grahm" },
    science: { translated: "science", pronunciation: "see-ahns" },
    planet: { translated: "planète", pronunciation: "plah-neht" },
    explore: { translated: "explorer", pronunciation: "ex-plo-ray" },
    nature: { translated: "nature", pronunciation: "nah-tuhr" },
    code: { translated: "code", pronunciation: "cohd" }
  },
  // Japanese
  ja: {
    hello: { translated: "こんにちは", pronunciation: "konnichiwa" },
    world: { translated: "世界", pronunciation: "sekai" },
    how: { translated: "どのように", pronunciation: "dono yōni" },
    are: { translated: "である", pronunciation: "de aru" },
    you: { translated: "あなた", pronunciation: "anata" },
    today: { translated: "今日", pronunciation: "kyō" },
    simple: { translated: "単純な", pronunciation: "tanjun na" },
    complex: { translated: "複雑な", pronunciation: "fukuzatsu na" },
    journey: { translated: "旅", pronunciation: "tabi" },
    success: { translated: "成功", pronunciation: "seikō" },
    program: { translated: "プログラム", pronunciation: "puroguramu" },
    science: { translated: "科学", pronunciation: "kagaku" },
    planet: { translated: "惑星", pronunciation: "wakusei" },
    explore: { translated: "探検する", pronunciation: "tanken suru" },
    nature: { translated: "自然", pronunciation: "shizen" },
    code: { translated: "コード", pronunciation: "kōdo" }
  }
};

export function getFallbackTranslation(text: string, targetLang: string) {
  const words = text.split(/\s+/).filter(Boolean);
  const langDict = FALLBACK_DICTIONARY[targetLang] || FALLBACK_DICTIONARY["hi"];

  const mappedWords = words.map((word) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
    const fallback = langDict ? langDict[cleanWord] : null;
    if (fallback) {
      return {
        original: word,
        translated: fallback.translated,
        pronunciation: fallback.pronunciation
      };
    }
    // CRITICAL: Do NOT return the original English text if translation fails!
    return {
      original: word,
      translated: "—",
      pronunciation: "—"
    };
  });

  const validTranslatedWords = mappedWords.filter(w => w.translated !== "—");
  const sentenceTranslation = validTranslatedWords.length > 0 
    ? mappedWords.map(w => w.translated !== "—" ? w.translated : "—").join(" ")
    : "—";

  const sentencePronunciation = validTranslatedWords.length > 0
    ? mappedWords.map(w => w.pronunciation !== "—" ? w.pronunciation : "—").join(" ")
    : "—";

  return {
    original: text,
    translation: sentenceTranslation,
    pronunciation: sentencePronunciation,
    words: mappedWords,
    isFallback: true
  };
}
