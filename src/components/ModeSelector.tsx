import React, { useState } from 'react';
import { Type, AlignLeft, Calendar, Hourglass, Check, Camera, Timer } from 'lucide-react';
import { TestMode, TimerPreset } from '../types';

interface ModeSelectorProps {
  currentMode: TestMode;
  onModeChange: (mode: TestMode) => void;
  currentTimePreset: TimerPreset;
  onTimePresetChange: (preset: TimerPreset, customVal?: number) => void;
  customSecondsValue: number;
  testState: 'idle' | 'running' | 'completed';
  onOpenCustomModal: () => void;
  onOpenCameraModal: () => void;
}

const MODES = [
  { id: 'words', name: 'Words', icon: Type, desc: 'Practice typing randomized common words.' },
  { id: 'sentence', name: 'Sentences', icon: AlignLeft, desc: 'Practice typing full complete sentences.' },
  { id: 'paragraph', name: 'Paragraphs', icon: Calendar, desc: 'Type continuous literary and technical paragraphs.' },
  { id: 'time_challenge', name: 'Challenge', icon: Hourglass, desc: 'Engage in complex, punctuation-heavy passages.' },
] as const;

const TIME_PRESETS = [
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '120s', value: 120 },
  { label: '300s', value: 300 },
  { label: 'custom', value: 'custom' }
] as const;

export default function ModeSelector({
  currentMode,
  onModeChange,
  currentTimePreset,
  onTimePresetChange,
  customSecondsValue,
  testState,
  onOpenCustomModal,
  onOpenCameraModal,
}: ModeSelectorProps) {
  const [customVal, setCustomVal] = useState<string>(customSecondsValue.toString());
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  const isDisabled = testState !== 'idle';

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseInt(customVal);
    if (!isNaN(numeric) && numeric >= 5 && numeric <= 3600) {
      onTimePresetChange('custom', numeric);
      setIsEditingCustom(false);
    } else {
      setCustomVal(customSecondsValue.toString());
      setIsEditingCustom(false);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 bg-theme-card/30 border border-theme-muted/10 rounded-2xl p-4" id="mode-selector-panel">
      {/* Test Modes Pills */}
      <div className="flex flex-wrap items-center gap-1.5" id="mode-pills-list">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              id={`mode-btn-${mode.id}`}
              disabled={isDisabled}
              onClick={() => onModeChange(mode.id as TestMode)}
              title={mode.desc}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isActive
                  ? 'bg-theme-accent text-theme-bg font-bold shadow-[0_4px_12px_-4px_rgba(var(--color-accent),0.2)]'
                  : 'text-theme-text/70 hover:text-theme-text hover:bg-theme-muted/10 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{mode.name}</span>
            </button>
          );
        })}

        {/* Camera / OCR Scanner Quick Launch Button */}
        <button
          id="mode-btn-camera-ocr"
          disabled={isDisabled}
          onClick={onOpenCameraModal}
          title="Snap a picture or upload an image to extract text for typing practice"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all bg-theme-accent/10 border border-theme-accent/20 text-theme-accent hover:bg-theme-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Photo (OCR)</span>
        </button>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-8 bg-theme-muted/20" />

      {/* Timer Controls */}
      <div className="flex flex-wrap items-center gap-2 max-w-full" id="time-pills-list">
        <span className="text-[10px] font-bold tracking-wider uppercase text-theme-accent flex items-center gap-1 font-mono">
          <Timer className="w-3.5 h-3.5 text-theme-accent" />
          <span>Timer:</span>
        </span>
        <div className="flex flex-wrap items-center gap-1 bg-theme-bg/60 p-1 rounded-xl border border-theme-muted/10 max-w-full">
          {TIME_PRESETS.map((preset) => {
            const isActive = currentTimePreset === preset.value;
            return (
              <div key={preset.label} className="relative">
                {preset.value === 'custom' && isEditingCustom ? (
                  <form onSubmit={handleCustomSubmit} className="absolute right-0 bottom-full mb-1 bg-theme-card border border-theme-muted/30 p-2 rounded-lg shadow-xl flex items-center gap-1 z-30 animate-in slide-in-from-bottom-2 duration-100">
                    <input
                      type="number"
                      autoFocus
                      value={customVal}
                      onChange={(e) => setCustomVal(e.target.value)}
                      min={5}
                      max={3600}
                      className="w-16 bg-theme-bg border border-theme-muted/20 rounded px-1.5 py-0.5 text-xs text-theme-correct focus:outline-none focus:border-theme-accent"
                    />
                    <button type="submit" className="bg-theme-accent text-theme-bg p-1 rounded hover:bg-theme-accent-hover text-[10px] font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : null}

                <button
                  id={`time-preset-btn-${preset.label}`}
                  disabled={isDisabled}
                  onClick={() => {
                    if (preset.value === 'custom') {
                      setIsEditingCustom(true);
                    } else {
                      onTimePresetChange(preset.value);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all ${
                    isActive
                      ? 'bg-theme-muted/20 text-theme-accent border border-theme-accent/20'
                      : 'text-theme-muted hover:text-theme-text disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {preset.value === 'custom'
                    ? `${customSecondsValue}s (custom)`
                    : preset.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
