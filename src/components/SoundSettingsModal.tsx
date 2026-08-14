import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  X, 
  Play, 
  Square, 
  Sparkles, 
  Check, 
  Radio, 
  Mic2, 
  Sliders, 
  Zap,
  Info
} from 'lucide-react';
import { 
  getDeviceVoices, 
  subscribeToVoices, 
  testDeviceVoice, 
  cancelSpeech, 
  isSpeechSynthesisSupported 
} from '../utils/speech';
import { SoundPreset } from './TypingArea';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAudioActive: boolean;
  onToggleAudioActive: (active: boolean) => void;
  isAutoReadActive: boolean;
  onToggleAutoRead: (active: boolean) => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  soundPreset: SoundPreset;
  onSoundPresetChange: (preset: SoundPreset) => void;
  selectedVoiceURI?: string;
  onVoiceChange?: (voiceURI: string) => void;
}

export function SoundSettingsModal({
  isOpen,
  onClose,
  isAudioActive,
  onToggleAudioActive,
  isAutoReadActive,
  onToggleAutoRead,
  speechRate,
  onSpeechRateChange,
  soundPreset,
  onSoundPresetChange,
  selectedVoiceURI,
  onVoiceChange,
}: SoundSettingsModalProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTestingSpeech, setIsTestingSpeech] = useState(false);
  const [currentVoiceURI, setCurrentVoiceURI] = useState<string>(() => {
    return selectedVoiceURI || (typeof window !== 'undefined' ? localStorage.getItem('typewell_speech_voice') || '' : '');
  });
  const [pitch, setPitch] = useState<number>(() => {
    return typeof window !== 'undefined' ? parseFloat(localStorage.getItem('typewell_speech_pitch') || '1.0') : 1.0;
  });

  const isSupported = isSpeechSynthesisSupported();

  useEffect(() => {
    const unsubscribe = subscribeToVoices((loadedVoices) => {
      setVoices(loadedVoices);
      if (!currentVoiceURI && loadedVoices.length > 0) {
        const defaultVoice = loadedVoices.find((v) => v.default || v.lang.startsWith('en'));
        if (defaultVoice) {
          setCurrentVoiceURI(defaultVoice.voiceURI);
        }
      }
    });

    return () => {
      unsubscribe();
      cancelSpeech();
    };
  }, []);

  if (!isOpen) return null;

  const handleVoiceSelect = (uri: string) => {
    setCurrentVoiceURI(uri);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typewell_speech_voice', uri);
    }
    if (onVoiceChange) {
      onVoiceChange(uri);
    }
  };

  const handlePitchChange = (newPitch: number) => {
    setPitch(newPitch);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typewell_speech_pitch', newPitch.toString());
    }
  };

  const handleTestVoice = () => {
    if (isTestingSpeech) {
      cancelSpeech();
      setIsTestingSpeech(false);
      return;
    }

    setIsTestingSpeech(true);
    testDeviceVoice({
      rate: speechRate,
      pitch: pitch,
      voiceURI: currentVoiceURI,
      customText: "Hello! Testing your device built-in speech engine. Word read aloud is fully active and working offline.",
      onStart: () => setIsTestingSpeech(true),
      onEnd: () => setIsTestingSpeech(false),
      onError: () => setIsTestingSpeech(false),
    });
  };

  const soundPresetsList: { id: SoundPreset; name: string; desc: string; icon: string }[] = [
    { id: 'cherry_blue', name: 'Cherry MX Blue', desc: 'Tactile mechanical click', icon: '⌨️' },
    { id: 'cherry_brown', name: 'Cherry MX Brown', desc: 'Deep tactile thock', icon: '🪵' },
    { id: 'typewriter', name: 'Vintage Typewriter', desc: 'Classic mechanical carriage', icon: '📜' },
    { id: 'bubble_pop', name: 'Bubble Pop', desc: 'Satisfying crisp pop tone', icon: '🫧' },
    { id: 'off', name: 'Muted', desc: 'Silent typing without keystroke audio', icon: '🔇' },
  ];

  const rateOptions = [
    { value: 0.75, label: '0.75x', desc: 'Slow & Clear' },
    { value: 1.0, label: '1.0x', desc: 'Normal' },
    { value: 1.25, label: '1.25x', desc: 'Brisk' },
    { value: 1.5, label: '1.5x', desc: 'Fast' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={() => {
          cancelSpeech();
          onClose();
        }} 
      />

      {/* Modal Container */}
      <div 
        id="sound-settings-modal"
        className="relative bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-theme-accent/15 border border-theme-accent/30 text-theme-accent">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Sound & Word Speech Settings
              </h2>
              <p className="text-xs text-slate-400">
                100% Offline Device Web Speech & Keystroke Audio
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cancelSpeech();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close sound settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto scrollbar-thin">
          
          {/* Quick Test Voice Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-theme-accent/15 via-cyan-500/10 to-transparent border border-theme-accent/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-full ${isTestingSpeech ? 'bg-theme-accent text-slate-950 animate-pulse' : 'bg-slate-800 text-theme-accent border border-theme-accent/30'}`}>
                {isTestingSpeech ? <Volume2 className="w-4 h-4" /> : <Mic2 className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-200 block truncate">
                  Test Built-In Device Voice
                </span>
                <span className="text-[11px] text-slate-400">
                  {isTestingSpeech ? 'Speaking test phrase aloud...' : 'Verify your browser audio works offline'}
                </span>
              </div>
            </div>

            <button
              onClick={handleTestVoice}
              id="modal-test-voice-btn"
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                isTestingSpeech 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-theme-accent hover:opacity-90 text-slate-950 hover:scale-105 active:scale-95'
              }`}
            >
              {isTestingSpeech ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Speech</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test Voice 🔊</span>
                </>
              )}
            </button>
          </div>

          {/* Section 1: Word Read Aloud (Auto-TTS) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-theme-accent" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                    Word Read Aloud (Auto-TTS)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Speaks words aloud through your device when completed or clicked
                  </span>
                </div>
              </div>

              <button
                onClick={() => onToggleAutoRead(!isAutoReadActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAutoReadActive ? 'bg-theme-accent' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={isAutoReadActive}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isAutoReadActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Voice Dropdown */}
            {isSupported && voices.length > 0 && (
              <div className="space-y-1.5 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Device Built-In Voice:</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {voices.length} Voices Detected
                  </span>
                </label>
                <select
                  value={currentVoiceURI}
                  onChange={(e) => handleVoiceSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 font-medium focus:outline-none focus:border-theme-accent cursor-pointer"
                >
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang}) {v.default ? '★ Default' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Speech Rate & Pitch Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              {/* Speech Speed */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Speaking Speed:</span>
                  <span className="text-[10px] font-mono text-theme-accent font-bold">{speechRate}x</span>
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {rateOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onSpeechRateChange(opt.value)}
                      className={`py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                        speechRate === opt.value
                          ? 'bg-theme-accent/20 border-theme-accent text-theme-accent shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                      title={opt.desc}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pitch */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Voice Pitch:</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">{pitch.toFixed(1)}</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { val: 0.8, label: 'Deep' },
                    { val: 1.0, label: 'Normal' },
                    { val: 1.2, label: 'High' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => handlePitchChange(p.val)}
                      className={`py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                        pitch === p.val
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-xs font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Keystroke Sound Effects */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                    Keystroke Sound Presets
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Synthesized mechanical audio feedback when typing
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                soundPreset === 'off'
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}>
                {soundPreset === 'off' ? 'MUTED' : 'ENABLED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {soundPresetsList.map((preset) => {
                const isSelected = soundPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSoundPresetChange(preset.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base leading-none mt-0.5">{preset.icon}</span>
                      <div>
                        <span className={`text-xs font-bold block ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight block">
                          {preset.desc}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy & Zero-Cost Notice */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2 text-slate-400 text-[11px]">
            <Info className="w-4 h-4 text-theme-accent shrink-0 mt-0.5" />
            <span>
              <strong>Zero External API Cost:</strong> SpeechSynthesis runs locally on your Android, iOS, or desktop device. No audio or text is sent to third-party servers.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handleTestVoice}
            className="text-xs text-theme-accent hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isTestingSpeech ? 'Stop Voice Test' : 'Test Speech Now'}</span>
          </button>
          
          <button
            onClick={() => {
              cancelSpeech();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-theme-accent text-slate-950 font-bold text-xs hover:opacity-90 transition cursor-pointer"
          >
            Save & Done
          </button>
        </div>

      </div>
    </div>
  );
}
