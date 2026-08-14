import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { getFallbackTranslation } from "./src/data/fallbackTranslations";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!ai) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// Parse JSON bodies with limit for base64 image payloads
app.use(express.json({ limit: "15mb" }));

// OCR Scan endpoint for Camera & Image Upload
app.post("/api/scan-image", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "No image payload provided" });
    }

    // Extract base64 and mime type
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (image.startsWith("data:")) {
      const parts = image.split(";base64,");
      mimeType = parts[0].replace("data:", "");
      base64Data = parts[1];
    }

    const gemini = getGeminiClient();
    if (!gemini) {
      return res.status(500).json({ error: "Gemini API key is not configured" });
    }

    const candidateModels = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let responseText: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await gemini.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: "Perform optical character recognition (OCR) on this image. Extract all legible text from the document, book page, sign, handwritten script, or image. Return ONLY the plain extracted text, keeping paragraphs intact. Do not include introductory notes, commentary, or code blocks."
                },
              ],
            },
          ],
        });

        if (response.text) {
          responseText = response.text.trim();
          break;
        }
      } catch (err: any) {
        const isQuota = err.status === 429 || err.message?.includes("429") || err.message?.includes("quota");
        if (isQuota) {
          console.warn(`[OCR] Model ${modelName} rate limit reached. Trying next model...`);
        } else {
          console.warn(`[OCR] Model ${modelName} attempt failed:`, err.message || err);
        }
      }
    }

    if (!responseText) {
      return res.status(500).json({
        error: "Unable to extract text from the provided image. Please make sure the image is clear and well-lit.",
      });
    }

    res.json({ extractedText: responseText });
  } catch (error: any) {
    console.error("Error in /api/scan-image:", error);
    res.status(500).json({ error: error.message || "Failed to scan image" });
  }
});

// Language map for translation prompt
const LANGUAGE_NAMES: Record<string, string> = {
  hi: "Hindi",
  ur: "Urdu",
  bn: "Bengali",
  pa: "Punjabi",
  mr: "Marathi",
  gu: "Gujarati",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  ne: "Nepali",
  si: "Sinhala",
  zh: "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
  fa: "Persian (Farsi)",
  ps: "Pashto",
  tr: "Turkish",
  vi: "Vietnamese",
  th: "Thai",
  id: "Indonesian",
  ms: "Malay",
  tl: "Filipino (Tagalog)",
  my: "Burmese",
  km: "Khmer",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  uk: "Ukrainian",
  pl: "Polish",
  nl: "Dutch",
  el: "Greek",
  he: "Hebrew",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  ro: "Romanian",
  hu: "Hungarian",
  cs: "Czech",
  sk: "Slovak",
  bg: "Bulgarian",
  hr: "Croatian",
  sr: "Serbian",
  ca: "Catalan",
  lt: "Lithuanian",
  lv: "Latvian",
  et: "Estonian",
  hy: "Armenian",
  ka: "Georgian",
  az: "Azerbaijani",
  kk: "Kazakh",
  uz: "Uzbek",
  sw: "Swahili",
  am: "Amharic",
  ha: "Hausa",
  yo: "Yoruba",
  ig: "Igbo",
  zu: "Zulu",
  af: "Afrikaans"
};

// Defensive JSON parsing function to strip markdown code blocks
function cleanJSONString(str: string): string {
  let cleaned = str.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Student Chat Assistant Endpoint using Gemini API
app.post("/api/student-chat", async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing or invalid messages array." });
    }

    const gemini = getGeminiClient();
    if (!gemini) {
      return res.json({
        reply: "I am your Student Assistant! To unlock live AI responses, ensure the GEMINI_API_KEY is configured in Settings. In the meantime, focus on smooth rhythm and accuracy while typing!"
      });
    }

    const contextSummary = context ? `
Current Practice Context:
- Target Language: ${context.targetLang || 'English'}
- Current Passage: "${context.targetText || ''}"
- Current WPM: ${context.wpm || 0}
- Typing Accuracy: ${context.accuracy || 100}%
` : '';

    const systemInstruction = `You are a supportive, knowledgeable AI Student Assistant and Study Tutor for the "Type & Translate" typing speed and language learning app.
Your goals:
1. Help students improve typing speed, touch typing ergonomics, accuracy, and muscle memory.
2. Explain vocabulary, grammar, and translation nuances for the current passage or user questions.
3. Keep responses engaging, concise, encouraging, and structured (use bullet points or bold text where helpful).
4. Address the student directly and keep answers focused and practical.

${contextSummary}`;

    // Map messages to Gemini API format ({ role: 'user' | 'model', parts: [{ text }] })
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const candidateModels = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let responseText: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await gemini.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction: systemInstruction,
          }
        });

        if (response.text) {
          responseText = response.text.trim();
          break;
        }
      } catch (err: any) {
        const isQuota = err.status === 429 || err.message?.includes("429") || err.message?.includes("quota");
        if (isQuota) {
          console.warn(`[Student Chat] Model ${modelName} rate limit reached. Trying next model...`);
        } else {
          console.warn(`[Student Chat] Model ${modelName} attempt failed:`, err.message || err);
        }
      }
    }

    if (!responseText) {
      return res.json({
        reply: "Great effort on your practice! Focus on posture, keep your fingers on the home row (ASDF JKL;), and don't look at the keyboard for best speed gains."
      });
    }

    res.json({ reply: responseText });
  } catch (error: any) {
    console.error("Error in /api/student-chat:", error);
    res.status(500).json({ error: error.message || "An error occurred in student chat." });
  }
});

// Global cooldown timer for Gemini rate limits / quota exhaustion
let geminiCooldownUntil = 0;

// Google Translate free public API fallback helper
async function fetchGoogleTranslate(text: string, targetLang: string) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&dt=rm&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[Google Translate API] Status ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (!Array.isArray(data) || !data[0]) {
      console.warn("[Google Translate API] Invalid response structure");
      return null;
    }

    let translation = "";
    let pronunciation = "";

    const sentences = data[0];
    if (Array.isArray(sentences)) {
      for (const item of sentences) {
        if (Array.isArray(item)) {
          if (item[0]) translation += item[0];
          if (item[2]) pronunciation += item[2];
          else if (item[3]) pronunciation += item[3];
        }
      }
    }

    translation = translation.trim();
    pronunciation = pronunciation.trim();

    // Fast index-aligned word mapping from single response
    const wordsList = text.split(/\s+/).filter(Boolean);
    const transWords = translation.split(/\s+/).filter(Boolean);
    const pronWords = (pronunciation || translation).split(/\s+/).filter(Boolean);

    const words = wordsList.map((w, i) => {
      const translatedWord = transWords[i] || transWords[transWords.length - 1] || w;
      const pronWord = pronWords[i] || pronWords[pronWords.length - 1] || translatedWord || w;
      return {
        original: w,
        translated: translatedWord,
        pronunciation: pronWord
      };
    });

    return {
      original: text,
      translation: translation || text,
      pronunciation: pronunciation || translation || text,
      words,
      provider: "GoogleTranslate"
    };
  } catch (err: any) {
    console.error("[Google Translate API Error]:", err.message || err);
    return null;
  }
}

// Translate a single small chunk (~100-150 words) with Gemini, falling back to Google Translate
async function translateSingleChunk(text: string, targetLang: string) {
  const languageName = LANGUAGE_NAMES[targetLang] || targetLang;
  const gemini = getGeminiClient();

  // Only call Gemini if configured AND not currently under rate limit / quota cooldown
  if (gemini && Date.now() >= geminiCooldownUntil) {
    const prompt = `You are an expert translation engine.
Translate the following English text chunk to ${languageName} (${targetLang}).
Provide a natural, context-aware sentence translation and phonetic pronunciation/romanization.
Also provide a word-by-word breakdown array mapping each English word in the source text in sequence.
The "words" array MUST contain exactly the same number of items as space-separated words in the input text in sequence.

Text chunk: "${text}"`;

    const candidateModels = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    for (const modelName of candidateModels) {
      try {
        const response = await gemini.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                translation: { type: Type.STRING },
                pronunciation: { type: Type.STRING },
                words: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      translated: { type: Type.STRING },
                      pronunciation: { type: Type.STRING }
                    },
                    required: ["original", "translated", "pronunciation"]
                  }
                }
              },
              required: ["translation", "pronunciation", "words"]
            }
          }
        });

        if (response.text) {
          const cleanedText = cleanJSONString(response.text);
          const parsed = JSON.parse(cleanedText);
          return {
            original: text,
            translation: parsed.translation || text,
            pronunciation: parsed.pronunciation || text,
            words: parsed.words || [],
            provider: "Gemini"
          };
        }
      } catch (err: any) {
        const isQuota = err.status === 429 || err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("RESOURCE_EXHAUSTED");
        if (isQuota) {
          geminiCooldownUntil = Date.now() + 120000; // 2 minute cooldown for Gemini
          console.warn(`[Gemini API] Quota limit reached (429). Switching to Google Translate for 2 minutes.`);
          break; // Stop trying other Gemini models for this chunk
        } else {
          console.warn(`[Single Chunk] Model ${modelName} error:`, err.message || err);
        }
      }
    }
  }

  // Google Translate fallback for chunk
  const gt = await fetchGoogleTranslate(text, targetLang);
  if (gt) return gt;

  // Local dictionary fallback for chunk
  const fallback = getFallbackTranslation(text, targetLang);
  return {
    original: text,
    translation: fallback.translation,
    pronunciation: fallback.pronunciation,
    words: fallback.words,
    provider: "Dictionary"
  };
}

// Helper to chunk long text into ~120-150 word pieces at sentence boundaries or word limits
function splitTextIntoChunks(text: string, maxWordsPerChunk: number = 120): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWordsPerChunk) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunkWords: string[] = [];

  for (const word of words) {
    currentChunkWords.push(word);
    const endsWithSentencePunctuation = /[.!?]$/.test(word);
    if (currentChunkWords.length >= maxWordsPerChunk || (currentChunkWords.length >= 80 && endsWithSentencePunctuation)) {
      chunks.push(currentChunkWords.join(" "));
      currentChunkWords = [];
    }
  }

  if (currentChunkWords.length > 0) {
    chunks.push(currentChunkWords.join(" "));
  }

  return chunks;
}

// In-memory translation cache to optimize rate limits
const translationCache = new Map<string, any>();

// Post Translate route
app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    console.log(`[/api/translate] Request received -> targetLang: ${targetLang}, text length: ${text?.length || 0} chars`);

    if (!text || !targetLang) {
      console.error("[/api/translate] Missing required parameter 'text' or 'targetLang'");
      return res.status(400).json({ error: "Missing required fields: text and targetLang are required." });
    }

    const cacheKey = `${targetLang}:${text.trim().toLowerCase()}`;
    if (translationCache.has(cacheKey)) {
      console.log(`[/api/translate] Serving cached translation for [${targetLang}] "${text.substring(0, 25)}..."`);
      return res.json(translationCache.get(cacheKey));
    }

    const chunks = splitTextIntoChunks(text, 120);
    console.log(`[/api/translate] Text split into ${chunks.length} chunk(s) for processing.`);

    if (chunks.length === 1) {
      const singleResult = await translateSingleChunk(chunks[0], targetLang);
      translationCache.set(cacheKey, singleResult);
      return res.json(singleResult);
    }

    // Process multiple chunks in parallel concurrency batches (max 3 concurrent)
    const chunkResults: any[] = new Array(chunks.length);
    const concurrencyLimit = 3;
    for (let i = 0; i < chunks.length; i += concurrencyLimit) {
      const sliceIndices = Array.from({ length: Math.min(concurrencyLimit, chunks.length - i) }, (_, k) => i + k);
      await Promise.all(
        sliceIndices.map(async (idx) => {
          chunkResults[idx] = await translateSingleChunk(chunks[idx], targetLang);
        })
      );
    }

    const mergedTranslation = chunkResults.map(r => r.translation).filter(Boolean).join(" ");
    const mergedPronunciation = chunkResults.map(r => r.pronunciation).filter(Boolean).join(" ");
    const mergedWords = chunkResults.flatMap(r => r.words || []);

    const combinedResult = {
      original: text,
      translation: mergedTranslation,
      pronunciation: mergedPronunciation,
      words: mergedWords,
      provider: chunkResults[0]?.provider || "ChunkedTranslator"
    };

    translationCache.set(cacheKey, combinedResult);
    return res.json(combinedResult);

  } catch (error: any) {
    console.error("[/api/translate] Unhandled server error:", error.message || error);
    const { text, targetLang } = req.body || {};
    if (text && targetLang) {
      const fallback = getFallbackTranslation(text, targetLang);
      return res.json({
        original: text,
        translation: fallback.translation,
        pronunciation: fallback.pronunciation,
        words: fallback.words,
        isFallback: true,
        provider: "Dictionary"
      });
    }
    res.status(500).json({ error: error.message || "An error occurred during translation." });
  }
});

// Serve static files from public directory directly
app.use(express.static(path.join(process.cwd(), "public")));

// Direct Privacy Policy endpoint for App Stores, PWA Builder, and APK Pure Consoles
app.get(["/privacy", "/privacy.html", "/privacy-policy"], (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "privacy.html"));
});

async function bootstrap() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
