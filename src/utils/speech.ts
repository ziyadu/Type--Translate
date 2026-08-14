/**
 * Browser & Device Built-In Web Speech API (SpeechSynthesis) Manager
 * 
 * - 100% Offline, client-side only
 * - ZERO external API calls, ZERO AI services (no Gemini, OpenAI, Google Cloud TTS, ElevenLabs)
 * - Optimized for Android Chrome, Android WebView, iOS Safari, and desktop browsers
 * - Handles asynchronous voice loading (onvoiceschanged), audio unlocking, GC retention,
 *   speech cancellation, and error recovery.
 */

// Retain active utterances globally to prevent V8 / Android garbage collection bug
const activeUtterances = new Set<SpeechSynthesisUtterance>();

let isAudioUnlocked = false;

/**
 * Check if the browser supports SpeechSynthesis Web Speech API
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Get cached or loaded voices from device
 */
export function getDeviceVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  try {
    const voices = window.speechSynthesis.getVoices();
    return Array.isArray(voices) ? voices : [];
  } catch (err) {
    console.warn('[WebSpeech] Error querying getVoices:', err);
    return [];
  }
}

/**
 * Subscribe to voice changes (handles Android Chrome / WebView async loading)
 */
export function subscribeToVoices(callback: (voices: SpeechSynthesisVoice[]) => void): () => void {
  if (!isSpeechSynthesisSupported()) {
    callback([]);
    return () => {};
  }

  const handleVoicesChanged = () => {
    const voices = getDeviceVoices();
    callback(voices);
  };

  // Immediate check
  const initialVoices = getDeviceVoices();
  if (initialVoices.length > 0) {
    callback(initialVoices);
  }

  // Listen to standard onvoiceschanged event
  if (typeof window.speechSynthesis.addEventListener === 'function') {
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
  } else {
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
  }

  // Backup interval for Android WebViews where onvoiceschanged might not fire reliably
  const timer1 = setTimeout(handleVoicesChanged, 250);
  const timer2 = setTimeout(handleVoicesChanged, 1000);

  return () => {
    clearTimeout(timer1);
    clearTimeout(timer2);
    if (typeof window.speechSynthesis.removeEventListener === 'function') {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    }
  };
}

/**
 * Unlocks audio context / SpeechSynthesis on mobile devices (Android Chrome/WebView & iOS Safari)
 * Call this on any user gesture (touch, click, keydown)
 */
export function unlockSpeechSynthesis(): void {
  if (isAudioUnlocked || !isSpeechSynthesisSupported()) return;
  try {
    // Resume if paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    // Speak a micro-silent utterance to unlock the mobile audio gate
    const dummy = new SpeechSynthesisUtterance('');
    dummy.volume = 0;
    dummy.rate = 2.0;
    window.speechSynthesis.speak(dummy);
    isAudioUnlocked = true;
  } catch (err) {
    // Ignore unlock failure
  }
}

/**
 * Clean text for high-accuracy speech synthesis
 */
export function sanitizeSpeechText(text: string): string {
  if (!text) return '';
  // Preserve alphabets, digits, hyphens, and apostrophes (e.g., "don't", "it's", "high-tech")
  // Replace symbols like underscores, bullet points, brackets with spaces
  return text
    .replace(/[•_~`*#<>[\]{}|\\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find the best matching voice for a language code or user preference
 */
export function findBestVoice(
  voices: SpeechSynthesisVoice[],
  targetLang: string = 'en',
  preferredVoiceURI?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Check preferred voice URI
  if (preferredVoiceURI) {
    const found = voices.find((v) => v.voiceURI === preferredVoiceURI);
    if (found) return found;
  }

  const langCode = targetLang.toLowerCase();
  
  // 2. Exact match on language (e.g., 'en-US' or 'en-GB')
  const exactMatch = voices.find((v) => v.lang.toLowerCase() === langCode);
  if (exactMatch) return exactMatch;

  // 3. Prefix match (e.g., 'en' matches 'en-US', 'en-GB', etc.)
  const prefix = langCode.split(/[-_]/)[0];
  const prefixMatch = voices.find(
    (v) => v.lang.toLowerCase().startsWith(prefix) && (v.default || v.localService)
  ) || voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  
  if (prefixMatch) return prefixMatch;

  // 4. Default voice
  const defaultVoice = voices.find((v) => v.default);
  if (defaultVoice) return defaultVoice;

  // 5. Fallback to first voice
  return voices[0] || null;
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voiceURI?: string;
  cancelPrevious?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Speak text using the device's built-in Web Speech API
 */
export function speakText(text: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSynthesisSupported()) return false;

  const cleanText = sanitizeSpeechText(text);
  if (!cleanText) return false;

  try {
    const {
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      lang = 'en-US',
      voiceURI,
      cancelPrevious = true,
      onStart,
      onEnd,
      onError,
    } = options;

    // Mobile check & recovery
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    if (cancelPrevious) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));
    utterance.volume = Math.max(0.1, Math.min(1.0, volume));
    utterance.lang = lang;

    // Assign voice
    const voices = getDeviceVoices();
    const voiceToUse = findBestVoice(voices, lang, voiceURI || localStorage.getItem('typewell_speech_voice') || undefined);
    if (voiceToUse) {
      utterance.voice = voiceToUse;
    }

    // Keep reference in Set to prevent Android garbage collection bug
    activeUtterances.add(utterance);

    const cleanup = () => {
      activeUtterances.delete(utterance);
    };

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      cleanup();
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      cleanup();
      // On some Android browsers, manual cancel produces 'canceled' or 'interrupted' error
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.warn('[WebSpeech] Utterance error:', event.error);
        if (onError) onError(event);
      } else {
        if (onEnd) onEnd();
      }
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('[WebSpeech] speakText failed:', err);
    return false;
  }
}

/**
 * Stop any ongoing speech playback
 */
export function cancelSpeech(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
    activeUtterances.clear();
  } catch (err) {
    // Ignore
  }
}

/**
 * Test the device built-in voice with a clear voice test sentence
 */
export function testDeviceVoice(
  options: {
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    customText?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
): boolean {
  const phrase = options.customText || "Testing device speech. Word read aloud is active and ready!";
  return speakText(phrase, {
    rate: options.rate || 1.0,
    pitch: options.pitch || 1.0,
    volume: 1.0,
    lang: 'en-US',
    voiceURI: options.voiceURI,
    cancelPrevious: true,
    onStart: options.onStart,
    onEnd: options.onEnd,
    onError: options.onError,
  });
}
