import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Keyboard, FileText, History, Volume2, VolumeX, Sliders, Play, Square } from 'lucide-react';
import { TestState } from '../types';
import { 
  speakText, 
  cancelSpeech, 
  unlockSpeechSynthesis, 
  testDeviceVoice, 
  sanitizeSpeechText 
} from '../utils/speech';

interface TypingAreaProps {
  targetText: string;
  typedText: string;
  onTypedTextChange: (newText: string, isMistake: boolean) => void;
  testState: TestState;
  onStartTest: () => void;
  onResetTest: () => void;
  onOpenCustomModal?: () => void;
  onOpenHistoryModal?: () => void;
  onOpenSoundModal?: () => void;
  onActiveWordIndexChange?: (idx: number, words: WordItem[]) => void;
  isAudioActive?: boolean;
  isAutoReadActive?: boolean;
  speechRate?: number;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  soundPreset?: SoundPreset;
  onSoundPresetChange?: (preset: SoundPreset) => void;
  onToggleMuteSound?: () => void;
  isSixWordsFocusMode?: boolean;
  onSixWordsFocusModeChange?: (val: boolean) => void;
  isCompactMode?: boolean;
  onCompactModeChange?: (val: boolean) => void;
  isKidsMode?: boolean;
}

export interface WordChar {
  char: string;
  globalIdx: number;
}

export interface WordItem {
  wordIdx: number;
  text: string;
  chars: WordChar[];
  globalStartIdx: number;
  globalEndIdx: number;
}

// Compact Phonetic IPA Pronunciation and Translation Dictionary
const PRONUNCIATIONS: Record<string, { ipa: string; translation: string }> = {
  "the": { ipa: "/ðə/", translation: "determiner / article" },
  "be": { ipa: "/biː/", translation: "exist / occur" },
  "to": { ipa: "/tuː/", translation: "towards / direction" },
  "of": { ipa: "/ɒv/", translation: "belonging to / origin" },
  "and": { ipa: "/ænd/", translation: "along with / plus" },
  "a": { ipa: "/ə/", translation: "single / one" },
  "in": { ipa: "/ɪn/", translation: "inside / during" },
  "that": { ipa: "/ðæt/", translation: "referring to item" },
  "have": { ipa: "/hæv/", translation: "possess / hold" },
  "i": { ipa: "/aɪ/", translation: "first person pronoun" },
  "it": { ipa: "/ɪt/", translation: "third person pronoun" },
  "for": { ipa: "/fɔːr/", translation: "intended to help" },
  "not": { ipa: "/nɒt/", translation: "negation marker" },
  "on": { ipa: "/ɒn/", translation: "upon / touching" },
  "with": { ipa: "/wɪð/", translation: "together with" },
  "he": { ipa: "/hiː/", translation: "male pronoun" },
  "as": { ipa: "/æz/", translation: "in the same way" },
  "you": { ipa: "/juː/", translation: "second person" },
  "do": { ipa: "/duː/", translation: "perform action" },
  "at": { ipa: "/æt/", translation: "location / time" },
  "future": { ipa: "/ˈfjuːtʃər/", translation: "time that is to come" },
  "depends": { ipa: "/dɪˈpendz/", translation: "relies upon" },
  "what": { ipa: "/wɒt/", translation: "asking info" },
  "today": { ipa: "/təˈdeɪ/", translation: "the current day" },
  "simple": { ipa: "/ˈsɪmpl/", translation: "easy / plain" },
  "complex": { ipa: "/ˈkɒmpleks/", translation: "composed of many parts" },
  "journey": { ipa: "/ˈdʒɜːni/", translation: "act of traveling" },
  "success": { ipa: "/səkˈses/", translation: "accomplishment of aim" },
  "program": { ipa: "/ˈproʊɡræm/", translation: "set of coded instructions" },
  "science": { ipa: "/ˈsaɪəns/", translation: "systematic study" },
  "planet": { ipa: "/ˈplænɪt/", translation: "celestial body revolving" },
  "explore": { ipa: "/ɪkˈsplɔːr/", translation: "travel to learn" },
  "nature": { ipa: "/ˈneɪtʃər/", translation: "physical world" },
  "quantum": { ipa: "/ˈkwɒntəm/", translation: "discrete quantity" },
  "galaxy": { ipa: "/ˈɡæləksi/", translation: "system of millions of stars" },
  "harmony": { ipa: "/ˈhɑːməni/", translation: "agreement or concord" },
  "balance": { ipa: "/ˈbæləns/", translation: "even distribution" },
  "crystal": { ipa: "/ˈkrɪstl/", translation: "clear transparent mineral" },
  "rhythm": { ipa: "/ˈrɪðəm/", translation: "strong repeated pattern" },
  "code": { ipa: "/koʊd/", translation: "instructions for computer" },
  "humor": { ipa: "/ˈhjuːmər/", translation: "quality of being amusing" },
  "people": { ipa: "/ˈpiːpl/", translation: "human beings in general" },
  "year": { ipa: "/jɪər/", translation: "time to orbit the sun" },
  "good": { ipa: "/ɡʊd/", translation: "high quality / beneficial" },
  "some": { ipa: "/sʌm/", translation: "an unspecified amount" },
  "could": { ipa: "/kʊd/", translation: "past form of can" },
  "them": { ipa: "/ðem/", translation: "third person plural" },
  "see": { ipa: "/siː/", translation: "perceive with eyes" },
  "other": { ipa: "/ˈʌðər/", translation: "different or alternative" },
  "than": { ipa: "/ðæn/", translation: "introducing comparison" },
  "then": { ipa: "/ðen/", translation: "at that time / next" },
  "now": { ipa: "/naʊ/", translation: "at the present time" },
  "look": { ipa: "/lʊk/", translation: "direct eyes / inspect" },
  "only": { ipa: "/ˈoʊnli/", translation: "solely / single" },
  "come": { ipa: "/kʌm/", translation: "move towards / arrive" },
  "over": { ipa: "/ˈoʊvər/", translation: "above / across" },
  "think": { ipa: "/θɪŋk/", translation: "use mind to form thoughts" },
  "also": { ipa: "/ˈɔːlsoʊ/", translation: "in addition / too" }
};

const getWordDetails = (word: string) => {
  if (!word) return null;
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleanWord) return null;
  
  if (PRONUNCIATIONS[cleanWord]) {
    return PRONUNCIATIONS[cleanWord];
  }
  
  // Dynamic phonetic fallback algorithm
  let ipa = `/${cleanWord}/`;
  if (cleanWord.endsWith('ing')) ipa = `/${cleanWord.slice(0, -3)}ɪŋ/`;
  else if (cleanWord.endsWith('ed')) ipa = `/${cleanWord.slice(0, -2)}t/`;
  else if (cleanWord.endsWith('ly')) ipa = `/${cleanWord.slice(0, -2)}li/`;
  else if (cleanWord.length > 5) ipa = `/${cleanWord.slice(0, 3)}·${cleanWord.slice(3)}/`;

  // Dynamic dictionary translation fallback
  let translation = `practice word: "${cleanWord}"`;
  if (cleanWord.length <= 3) translation = "short helper particle";
  else if (cleanWord.length > 7) translation = "multisyllable practice term";

  return { ipa, translation };
};

export type SoundPreset = 'cherry_blue' | 'cherry_brown' | 'typewriter' | 'bubble_pop' | 'off';

export interface SoundPresetOption {
  id: SoundPreset;
  name: string;
  icon: string;
}

export const SOUND_PRESETS: SoundPresetOption[] = [
  { id: 'cherry_blue', name: 'Cherry MX Blue (Clicky)', icon: '⌨️' },
  { id: 'cherry_brown', name: 'Cherry MX Brown (Thocky)', icon: '🪵' },
  { id: 'typewriter', name: 'Vintage Typewriter', icon: '📜' },
  { id: 'bubble_pop', name: 'Bubble Pop', icon: '🫧' },
  { id: 'off', name: 'Mute Sounds', icon: '🔇' },
];

let globalAudioCtx: AudioContext | null = null;

export const playKeystrokeSound = (preset: SoundPreset, key: string) => {
  if (preset === 'off' || typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!globalAudioCtx) {
      globalAudioCtx = new AudioContextClass();
    }
    
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }

    const ctx = globalAudioCtx;
    const now = ctx.currentTime;

    const isSpace = key === ' ';
    const isBackspace = key === 'Backspace' || key === 'Delete';

    if (preset === 'cherry_blue') {
      // High-pitched clicky switch
      // 1. Transient click
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'triangle';
      if (isSpace) {
        click.frequency.setValueAtTime(300, now);
        click.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        clickGain.gain.setValueAtTime(0.15, now);
        clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      } else if (isBackspace) {
        click.frequency.setValueAtTime(600, now);
        click.frequency.exponentialRampToValueAtTime(250, now + 0.05);
        clickGain.gain.setValueAtTime(0.12, now);
        clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      } else {
        const pitch = 950 + Math.random() * 200 - 100;
        click.frequency.setValueAtTime(pitch, now);
        click.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.015);
        clickGain.gain.setValueAtTime(0.1, now);
        clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.025);
      }
      click.connect(clickGain);
      clickGain.connect(ctx.destination);
      click.start(now);
      click.stop(now + 0.12);

      // 2. High frequency noise bandpass click
      const bufferSize = ctx.sampleRate * 0.03;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      if (isSpace) {
        noiseFilter.frequency.setValueAtTime(800, now);
        noiseFilter.Q.setValueAtTime(4, now);
      } else {
        noiseFilter.frequency.setValueAtTime(2500, now);
        noiseFilter.Q.setValueAtTime(3, now);
      }

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(isSpace ? 0.05 : 0.04, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.035);

      // 3. Cabinet wooden resonance
      const resonance = ctx.createOscillator();
      const resonanceGain = ctx.createGain();
      resonance.type = 'sine';
      if (isSpace) {
        resonance.frequency.setValueAtTime(140, now);
        resonanceGain.gain.setValueAtTime(0.12, now);
        resonanceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      } else {
        const pitch = 320 + Math.random() * 60 - 30;
        resonance.frequency.setValueAtTime(pitch, now);
        resonanceGain.gain.setValueAtTime(0.04, now);
        resonanceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      }
      resonance.connect(resonanceGain);
      resonanceGain.connect(ctx.destination);
      resonance.start(now);
      resonance.stop(now + 0.1);

    } else if (preset === 'cherry_brown') {
      // Warm, tactile thocky sound with less clicky high-frequency
      // 1. Deeper resonant wave
      const thock = ctx.createOscillator();
      const thockGain = ctx.createGain();
      thock.type = 'sine';
      
      if (isSpace) {
        thock.frequency.setValueAtTime(110, now);
        thock.frequency.exponentialRampToValueAtTime(85, now + 0.08);
        thockGain.gain.setValueAtTime(0.18, now);
        thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      } else if (isBackspace) {
        thock.frequency.setValueAtTime(160, now);
        thock.frequency.exponentialRampToValueAtTime(120, now + 0.06);
        thockGain.gain.setValueAtTime(0.14, now);
        thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      } else {
        const pitch = 220 + Math.random() * 40 - 20;
        thock.frequency.setValueAtTime(pitch, now);
        thock.frequency.exponentialRampToValueAtTime(pitch * 0.8, now + 0.04);
        thockGain.gain.setValueAtTime(0.08, now);
        thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      }
      thock.connect(thockGain);
      thockGain.connect(ctx.destination);
      thock.start(now);
      thock.stop(now + 0.15);

      // 2. Soft friction noise
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(isSpace ? 400 : 700, now);
      noiseFilter.Q.setValueAtTime(2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(isSpace ? 0.04 : 0.025, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.045);

    } else if (preset === 'typewriter') {
      // Vintage mechanical typewriter: crisp metal strike + noise + bell chime on Spacebar!
      // 1. Sharp strike
      const strike = ctx.createOscillator();
      const strikeGain = ctx.createGain();
      strike.type = 'sawtooth';
      
      const pitch = isSpace ? 250 : (1200 + Math.random() * 400 - 200);
      strike.frequency.setValueAtTime(pitch, now);
      strike.frequency.exponentialRampToValueAtTime(isSpace ? 100 : 300, now + 0.03);
      
      strikeGain.gain.setValueAtTime(isSpace ? 0.1 : 0.12, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.08 : 0.04));
      
      strike.connect(strikeGain);
      strikeGain.connect(ctx.destination);
      strike.start(now);
      strike.stop(now + 0.1);

      // 2. Loud metallic friction noise
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(isSpace ? 600 : 1500, now);
      noiseFilter.Q.setValueAtTime(1, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.07, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.05);

      // 3. Return Carriage Bell on Spacebar (simulate delightful retro chime)
      if (isSpace) {
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(2048, now); // classic clear chime
        
        bellGain.gain.setValueAtTime(0.06, now);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35); // longer ringing tail!
        
        bell.connect(bellGain);
        bellGain.connect(ctx.destination);
        bell.start(now);
        bell.stop(now + 0.4);
      }

    } else if (preset === 'bubble_pop') {
      // Playful Bubble Pop
      const pop = ctx.createOscillator();
      const popGain = ctx.createGain();
      pop.type = 'sine';

      const startPitch = isSpace ? 300 : (600 + Math.random() * 300);
      pop.frequency.setValueAtTime(startPitch, now);
      pop.frequency.exponentialRampToValueAtTime(startPitch * 2.2, now + 0.015);

      popGain.gain.setValueAtTime(0.12, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      pop.connect(popGain);
      popGain.connect(ctx.destination);
      pop.start(now);
      pop.stop(now + 0.03);
    }
  } catch (err) {
    console.warn("Web Audio keystroke error:", err);
  }
};

// Hook that detects when a word is completed (Space, Enter, or final character match)
// and triggers speech synthesis ONLY for that specific word using device built-in Web Speech API,
// ensuring it doesn't read future words or repeat words until re-typed.
export function useWordCompletionSpeech({
  typedText,
  targetText,
  wordsList,
  isAutoReadActive = true,
  speechRate = 1.0,
  testState,
}: {
  typedText: string;
  targetText: string;
  wordsList: WordItem[];
  isAutoReadActive?: boolean;
  speechRate?: number;
  testState: TestState;
}) {
  const spokenIndicesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (testState === 'idle' || typedText.length === 0) {
      spokenIndicesRef.current.clear();
      cancelSpeech();
      return;
    }

    if (!isAutoReadActive || wordsList.length === 0) return;

    // Reset spoken status for words that have been backspaced past
    spokenIndicesRef.current.forEach((idx) => {
      const word = wordsList[idx];
      if (word && typedText.length < word.globalStartIdx + 1) {
        spokenIndicesRef.current.delete(idx);
      }
    });

    // Detect completed words
    for (let i = 0; i < wordsList.length; i++) {
      const word = wordsList[i];
      if (!word) continue;

      if (spokenIndicesRef.current.has(i)) continue;

      const userReachedWordEnd = typedText.length >= word.globalEndIdx + 1;

      if (userReachedWordEnd) {
        const wordTypedSlice = typedText.slice(word.globalStartIdx, word.globalEndIdx + 1);
        const wordTargetSlice = targetText.slice(word.globalStartIdx, word.globalEndIdx + 1);

        const isMatch =
          wordTypedSlice === wordTargetSlice ||
          wordTypedSlice.trim() === wordTargetSlice.trim();

        if (isMatch) {
          spokenIndicesRef.current.add(i);

          const wordToSpeak = sanitizeSpeechText(word.text);
          if (wordToSpeak) {
            speakText(wordToSpeak, {
              rate: speechRate || 1.0,
              lang: 'en-US',
              cancelPrevious: true,
            });
          }
          break;
        }
      }
    }
  }, [typedText, targetText, wordsList, isAutoReadActive, speechRate, testState]);
}

export function KeystrokeSoundSelector({
  soundPreset,
  setSoundPreset,
}: {
  soundPreset: SoundPreset;
  setSoundPreset: (preset: SoundPreset) => void;
}) {
  return (
    <div 
      id="audio-sound-selector" 
      className="p-3 rounded-xl bg-theme-card/30 border border-theme-muted/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-theme-muted mt-2"
    >
      <div className="flex items-center gap-2">
        {soundPreset === 'off' ? (
          <VolumeX className="w-4 h-4 text-red-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-theme-accent animate-pulse" />
        )}
        <span className="font-semibold text-theme-text">Keystroke Sounds:</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
          soundPreset === 'off' 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
        }`}>
          {soundPreset === 'off' ? 'Muted' : soundPreset.replace('_', ' ')}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {SOUND_PRESETS.map((preset) => {
          const isSelected = soundPreset === preset.id;
          const isOff = preset.id === 'off';
          return (
            <button
              key={preset.id}
              onClick={() => {
                setSoundPreset(preset.id);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('typing_sound_preset', preset.id);
                }
                playKeystrokeSound(preset.id, ' ');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all duration-200 cursor-pointer ${
                isSelected
                  ? isOff
                    ? 'bg-red-500/20 border-red-500/40 text-red-400 font-bold scale-105 shadow-sm'
                    : 'bg-theme-accent/15 border-theme-accent/30 text-theme-accent font-bold scale-105 shadow-sm'
                  : 'border-theme-muted/10 text-theme-muted hover:border-theme-muted/30 hover:text-theme-text'
              }`}
              title={isOff ? 'Mute all keystroke audio' : `Select ${preset.name} feedback`}
            >
              <span className="text-sm select-none">{preset.icon}</span>
              <span>{preset.name.split(' (')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TypingArea({
  targetText,
  typedText,
  onTypedTextChange,
  testState,
  onStartTest,
  onResetTest,
  onOpenCustomModal,
  onOpenHistoryModal,
  onOpenSoundModal,
  onActiveWordIndexChange,
  isAudioActive = true,
  isAutoReadActive = true,
  speechRate = 1.0,
  fontSize = 'xl',
  soundPreset: externalSoundPreset,
  onSoundPresetChange,
  onToggleMuteSound,
  isSixWordsFocusMode: externalSixWordsFocusMode,
  onSixWordsFocusModeChange,
  isCompactMode: externalCompactMode,
  onCompactModeChange,
  isKidsMode = false,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Parse words and map global character indexes
  const [wordsList, setWordsList] = useState<WordItem[]>([]);
  const [activeWordIdx, setActiveWordIdx] = useState(0);

  const [internalCompactMode, setInternalCompactMode] = useState(false);
  const isCompactMode = externalCompactMode !== undefined ? externalCompactMode : internalCompactMode;
  const setIsCompactMode = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isCompactMode) : val;
    if (onCompactModeChange) onCompactModeChange(nextVal);
    else setInternalCompactMode(nextVal);
  };

  const [internalSixWordsFocusMode, setInternalSixWordsFocusMode] = useState(true);
  const isSixWordsFocusMode = externalSixWordsFocusMode !== undefined ? externalSixWordsFocusMode : internalSixWordsFocusMode;
  const setIsSixWordsFocusMode = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isSixWordsFocusMode) : val;
    if (onSixWordsFocusModeChange) onSixWordsFocusModeChange(nextVal);
    else setInternalSixWordsFocusMode(nextVal);
  };

  // Sound effects preset state
  const [internalSoundPreset, setInternalSoundPreset] = useState<SoundPreset>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typing_sound_preset');
      if (saved) return saved as SoundPreset;
    }
    return 'cherry_blue';
  });

  const soundPreset = externalSoundPreset !== undefined ? externalSoundPreset : internalSoundPreset;
  const setSoundPreset = (preset: SoundPreset) => {
    if (onSoundPresetChange) {
      onSoundPresetChange(preset);
    } else {
      setInternalSoundPreset(preset);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('typing_sound_preset', preset);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typing_sound_preset', soundPreset);
    }
  }, [soundPreset]);

  // Auto-detect mobile devices or narrow screens on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsCompactMode(window.innerWidth < 768);
    }
  }, []);

  // Render sliding 12-word window matching the translation section
  const isCompactWindow = isSixWordsFocusMode || isCompactMode;
  const visibleWords = wordsList.slice(activeWordIdx, activeWordIdx + 12);

  const activeWordItem = wordsList[activeWordIdx];
  const activeWordText = activeWordItem ? activeWordItem.text.trim() : '';
  const activeWordDetails = getWordDetails(activeWordText);

  // Notify parent component about index changes for real-time translation tracking
  useEffect(() => {
    if (onActiveWordIndexChange) {
      onActiveWordIndexChange(activeWordIdx, wordsList);
    }
  }, [activeWordIdx, wordsList, onActiveWordIndexChange]);

  // Voice Speech Synthesis (Text-To-Speech)
  const speakActiveWord = (textToSpeak?: string) => {
    const text = textToSpeak || activeWordText;
    if (!text) return;
    speakText(text, {
      rate: speechRate || 1.0,
      lang: 'en-US',
      cancelPrevious: true,
    });
  };

  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Automatically read finished words upon completion using custom hook
  useWordCompletionSpeech({
    typedText,
    targetText,
    wordsList,
    isAutoReadActive,
    speechRate,
    testState,
  });

  useEffect(() => {
    if (!targetText) return;

    const words = targetText.split(' ');
    let runningIdx = 0;
    const items: WordItem[] = words.map((w, idx) => {
      const isLast = idx === words.length - 1;
      const wordText = w + (isLast ? '' : ' ');
      const chars: WordChar[] = [];

      const startIdx = runningIdx;
      for (let i = 0; i < wordText.length; i++) {
        chars.push({
          char: wordText[i],
          globalIdx: runningIdx++,
        });
      }

      return {
        wordIdx: idx,
        text: wordText,
        chars,
        globalStartIdx: startIdx,
        globalEndIdx: runningIdx - 1,
      };
    });

    setWordsList(items);
  }, [targetText]);

  // Determine active word index based on typed length
  useEffect(() => {
    if (wordsList.length === 0) return;

    const typedLength = typedText.length;
    let foundActive = 0;

    for (let i = 0; i < wordsList.length; i++) {
      if (typedLength >= wordsList[i].globalStartIdx && typedLength <= wordsList[i].globalEndIdx) {
        foundActive = i;
        break;
      }
    }
    // If we've typed beyond the last character, clamp to the last word
    if (typedLength >= targetText.length) {
      foundActive = wordsList.length - 1;
    }

    setActiveWordIdx(foundActive);
  }, [typedText, wordsList, targetText]);

  // Handle active word automatic scroll centering to keep active word centered
  const activeWordRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Never automatically scroll while the user is typing
    if (testState === 'running') return;
    if (activeWordRef.current && containerRef.current) {
      const activeElem = activeWordRef.current;
      const containerElem = containerRef.current;

      const activeTop = activeElem.offsetTop;
      const activeHeight = activeElem.offsetHeight;
      const containerHeight = containerElem.clientHeight;

      const targetScrollTop = Math.max(0, activeTop - (containerHeight / 2) + (activeHeight / 2));

      containerElem.scrollTop = targetScrollTop;
    }
  }, [activeWordIdx, testState]);

  // Refocus input whenever container is clicked or key is pressed
  const focusInput = () => {
    unlockSpeechSynthesis();
    if (testState !== 'completed' && inputRef.current && document.activeElement !== inputRef.current) {
      try {
        inputRef.current.focus({ preventScroll: true });
      } catch {
        inputRef.current.focus();
      }
    }
  };

  useEffect(() => {
    focusInput();
  }, [testState, targetText]);

  // Global window key listener to ensure focus is immediately restored when user starts typing
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in another input/textarea/select
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'select' || (targetTag === 'textarea' && e.target !== inputRef.current)) {
        return;
      }
      unlockSpeechSynthesis();
      if (testState !== 'completed' && inputRef.current && document.activeElement !== inputRef.current) {
        try {
          inputRef.current.focus({ preventScroll: true });
        } catch {
          inputRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [testState]);

  // Handle key input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (testState === 'completed') return;

    unlockSpeechSynthesis();
    const val = e.target.value;
    // Don't let users type past target length
    if (val.length > targetText.length) return;

    if (testState === 'idle' && val.length > 0) {
      onStartTest();
    }

    // Check if user made a mistake in this keystroke
    let isMistake = false;
    if (val.length > typedText.length) {
      const addedChar = val[val.length - 1];
      const targetChar = targetText[val.length - 1];
      if (addedChar !== targetChar) {
        isMistake = true;
      }
    }

    onTypedTextChange(val, isMistake);
  };

  // Keyboard shortcut actions (e.g. Ctrl+Backspace to delete last word, Escape to restart)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Play high-fidelity synthesized mechanical click sound on standard keystroke
    const isClickableKey = e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter' || e.key === 'Delete';
    if (isClickableKey && isAudioActive) {
      playKeystrokeSound(soundPreset, e.key);
    }

    if (e.key === 'Escape') {
      onResetTest();
      e.preventDefault();
      return;
    }

    // Capture Ctrl + Backspace to erase previous word cleanly
    if (e.key === 'Backspace' && e.ctrlKey) {
      e.preventDefault();
      if (typedText.length === 0) return;

      // Find the last space position before current length
      const lastSpaceIdx = typedText.trimEnd().lastIndexOf(' ');
      if (lastSpaceIdx === -1) {
        onTypedTextChange('', false);
      } else {
        onTypedTextChange(typedText.substring(0, lastSpaceIdx + 1), false);
      }
    }
  };

  return (
    <div className="w-full relative" id="typing-area-wrapper">
      {/* Typing Test Column */}
      <div className="space-y-4 w-full" id="typing-test-column">
          <div className="relative w-full rounded-xl overflow-hidden" id="typing-interactive-zone">
            {/* Invisible Input Field for system keyboard capture */}
            <textarea
              ref={inputRef}
              id="typing-hidden-input"
              value={typedText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-none -z-10 border-0 p-0 m-0 overflow-hidden resize-none"
              tabIndex={0}
              disabled={testState === 'completed'}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
            />

            {/* Typing Container */}
            <div
              onClick={focusInput}
              id="typing-box-container"
              className={`w-full rounded-xl bg-theme-card/30 border transition-all duration-300 relative overflow-hidden select-none cursor-text ${
                isCompactWindow ? 'p-3 sm:p-4' : 'p-4 sm:p-6'
              } ${
                isCompactWindow ? 'min-h-[105px] sm:min-h-[125px]' : 'min-h-[135px] sm:min-h-[160px]'
              } ${
                isFocused ? 'border-theme-accent/30 shadow-[0_0_15px_-3px_rgba(var(--color-accent),0.1)]' : 'border-theme-muted/10'
              }`}
            >
              <div
                ref={containerRef}
                id="typing-scroller"
                className={`h-full overflow-y-auto scrollbar-none pr-1 flex flex-wrap font-mono leading-relaxed gap-1.5 sm:gap-2 ${
                  isCompactWindow 
                    ? 'text-base sm:text-xl items-center justify-start py-0.5 max-h-[100px] sm:max-h-[120px]' 
                    : (
                      fontSize === 'sm' ? 'text-sm' :
                      fontSize === 'base' ? 'text-base' :
                      fontSize === 'lg' ? 'text-lg sm:text-xl' :
                      fontSize === 'xl' ? 'text-xl sm:text-2xl' :
                      fontSize === '2xl' ? 'text-2xl sm:text-3xl' :
                      fontSize === '3xl' ? 'text-3xl sm:text-4xl' :
                      'text-xl md:text-2xl'
                    ) + ' content-start gap-x-2'
                }`}
              >
                {visibleWords.map((wordItem) => {
                  const wIdx = wordItem.wordIdx;
                  const isActiveWord = activeWordIdx === wIdx;
                  
                  return (
                    <div
                      key={wIdx}
                      ref={isActiveWord ? activeWordRef : null}
                      onClick={(e) => {
                        e.stopPropagation();
                        focusInput();
                        speakActiveWord(wordItem.text);
                      }}
                      className={`relative flex flex-col items-start rounded-lg border transition-all duration-200 py-1 px-2.5 cursor-pointer group shadow-xs ${
                        isActiveWord 
                          ? 'bg-theme-accent/20 border-theme-accent text-theme-accent scale-[1.03] shadow-md' 
                          : 'bg-theme-card/40 border-theme-muted/15 opacity-90 hover:opacity-100 hover:bg-theme-card/70 hover:border-theme-muted/30'
                      }`}
                      id={`typing-word-${wIdx}`}
                    >
                      {/* The characters row */}
                      <div className="flex flex-row leading-none">
                        {wordItem.chars.map((charItem, cIdx) => {
                          const { char, globalIdx } = charItem;
                          const hasBeenTyped = globalIdx < typedText.length;
                          const isCorrect = hasBeenTyped && typedText[globalIdx] === char;
                          const isActiveChar = globalIdx === typedText.length;

                          let charClass = 'text-theme-muted';

                          if (hasBeenTyped) {
                            if (isCorrect) {
                              charClass = 'text-theme-correct font-semibold';
                            } else {
                              charClass = 'text-theme-wrong font-bold bg-theme-bg-wrong rounded-sm border-b border-theme-wrong';
                            }
                          }

                          return (
                            <span
                              key={cIdx}
                              className={`relative font-mono transition-colors duration-100 ${charClass}`}
                              id={`typing-char-${globalIdx}`}
                            >
                              {/* Interactive Cursor (Caret) */}
                              {isActiveChar && isFocused && (
                                <span
                                  id="typing-caret"
                                  className="absolute -left-[1px] top-[10%] bottom-[10%] w-[2.5px] bg-theme-cursor rounded-full animate-caret-blink"
                                />
                              )}
                              
                              {/* Special rendering for spaces so they are visible if wrong */}
                              {char === ' ' ? (hasBeenTyped && !isCorrect ? '•' : ' ') : char}

                              {/* Caret helper for the absolute end of the complete passage */}
                              {globalIdx === targetText.length - 1 && typedText.length === targetText.length && isFocused && (
                                <span
                                  id="typing-caret-end"
                                  className="absolute -right-[1.5px] top-[10%] bottom-[10%] w-[2.5px] bg-theme-cursor rounded-full animate-caret-blink"
                                />
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Restart & Typing Toolbar */}
          <div className={`flex flex-wrap items-center gap-2 ${isKidsMode ? 'justify-center py-2' : 'justify-end text-xs text-theme-muted font-mono pt-0.5'}`} id="typing-toolbar">
            {!isKidsMode && (
              <>
                {/* Device Voice Test Button */}
                <button
                  onClick={() => {
                    unlockSpeechSynthesis();
                    if (isTestingVoice) {
                      cancelSpeech();
                      setIsTestingVoice(false);
                      return;
                    }
                    setIsTestingVoice(true);
                    testDeviceVoice({
                      rate: speechRate || 1.0,
                      customText: "Device voice active! Word read aloud is ready.",
                      onStart: () => setIsTestingVoice(true),
                      onEnd: () => setIsTestingVoice(false),
                      onError: () => setIsTestingVoice(false),
                    });
                  }}
                  id="toolbar-test-voice-btn"
                  className={`flex items-center gap-1.5 px-2.5 py-1 transition-all duration-300 rounded-lg border cursor-pointer text-[11px] ${
                    isTestingVoice
                      ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 font-bold animate-pulse'
                      : 'border-theme-muted/15 text-theme-muted hover:text-theme-accent hover:border-theme-accent/30 hover:bg-theme-accent/5'
                  }`}
                  title="Test device built-in Web Speech API voice (100% offline)"
                >
                  {isTestingVoice ? (
                    <>
                      <Square className="w-3 h-3 fill-current text-cyan-300" />
                      <span className="text-cyan-300 font-mono">Speaking...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-theme-accent fill-current" />
                      <span>Test Voice</span>
                    </>
                  )}
                </button>

                {/* Sound & Voice Settings / Mute Button */}
                <button
                  onClick={() => {
                    if (onOpenSoundModal) {
                      onOpenSoundModal();
                    } else if (onToggleMuteSound) {
                      onToggleMuteSound();
                    } else {
                      setSoundPreset(soundPreset === 'off' ? 'cherry_blue' : 'off');
                    }
                  }}
                  id="toolbar-sound-mute-btn"
                  className={`flex items-center gap-1.5 px-2.5 py-1 transition-all duration-300 rounded-lg border cursor-pointer text-[11px] ${
                    soundPreset === 'off'
                      ? 'border-red-500/40 bg-red-500/15 text-red-400 font-bold'
                      : 'border-theme-muted/15 text-theme-muted hover:text-theme-accent hover:border-theme-accent/30 hover:bg-theme-accent/5'
                  }`}
                  title={soundPreset === 'off' ? 'Open Sound & Voice Settings (Currently Muted)' : `Open Sound & Voice Settings (Keystrokes: ${(soundPreset || 'cherry_blue').replace('_', ' ')})`}
                >
                  {soundPreset === 'off' ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="text-red-400 font-mono">Muted</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                      <span>Sound & Speech</span>
                    </>
                  )}
                </button>
              </>
            )}

            {!isKidsMode && onOpenCustomModal && (
              <button
                onClick={onOpenCustomModal}
                id="mode-btn-custom-toolbar"
                className="flex items-center gap-1.5 px-2.5 py-1 hover:text-theme-accent hover:border-theme-accent/30 hover:bg-theme-accent/5 transition-all duration-300 text-theme-muted rounded-lg border border-theme-muted/15 cursor-pointer text-[11px]"
                title="Paste or save custom text for typing practice"
              >
                <FileText className="w-3.5 h-3.5 text-theme-accent" />
                <span>Custom Text</span>
              </button>
            )}

            {isKidsMode ? (
              <button
                onClick={onResetTest}
                id="typing-restart-btn"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-sm transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Words 🌟</span>
              </button>
            ) : (
              <button
                onClick={onResetTest}
                id="typing-restart-btn"
                className="flex items-center gap-1.5 px-2.5 py-1 hover:text-theme-accent hover:border-theme-accent/30 hover:bg-theme-card/60 transition-all duration-300 text-theme-muted rounded-lg border border-theme-muted/15 cursor-pointer text-[11px]"
                title="Restart Test (or press Esc)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart (Esc)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
