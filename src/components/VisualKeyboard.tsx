import React, { useState, useEffect } from 'react';
import { Keyboard as KeyboardIcon, Flame, RefreshCw, Eye, EyeOff, Info, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export interface KeyStat {
  attempts: number;
  misses: number;
}

export type KeyHeatmapData = Record<string, KeyStat>;

interface VisualKeyboardProps {
  typedText: string;
  targetText: string;
  testState: 'idle' | 'running' | 'completed';
  heatmapData: KeyHeatmapData;
  onResetHeatmap: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

// QWERTY Key Rows layout definition
const KEYBOARD_ROWS = [
  [
    { code: 'Backquote', display: '`', altDisplay: '~' },
    { code: 'Digit1', display: '1', altDisplay: '!' },
    { code: 'Digit2', display: '2', altDisplay: '@' },
    { code: 'Digit3', display: '3', altDisplay: '#' },
    { code: 'Digit4', display: '4', altDisplay: '$' },
    { code: 'Digit5', display: '5', altDisplay: '%' },
    { code: 'Digit6', display: '6', altDisplay: '^' },
    { code: 'Digit7', display: '7', altDisplay: '&' },
    { code: 'Digit8', display: '8', altDisplay: '*' },
    { code: 'Digit9', display: '9', altDisplay: '(' },
    { code: 'Digit0', display: '0', altDisplay: ')' },
    { code: 'Minus', display: '-', altDisplay: '_' },
    { code: 'Equal', display: '=', altDisplay: '+' },
    { code: 'Backspace', display: 'Backspace', width: 'w-16 sm:w-20' },
  ],
  [
    { code: 'Tab', display: 'Tab', width: 'w-12 sm:w-16' },
    { code: 'KeyQ', display: 'q' },
    { code: 'KeyW', display: 'w' },
    { code: 'KeyE', display: 'e' },
    { code: 'KeyR', display: 'r' },
    { code: 'KeyT', display: 't' },
    { code: 'KeyY', display: 'y' },
    { code: 'KeyU', display: 'u' },
    { code: 'KeyI', display: 'i' },
    { code: 'KeyO', display: 'o' },
    { code: 'KeyP', display: 'p' },
    { code: 'BracketLeft', display: '[', altDisplay: '{' },
    { code: 'BracketRight', display: ']', altDisplay: '}' },
    { code: 'Backslash', display: '\\', altDisplay: '|', width: 'w-10 sm:w-14' },
  ],
  [
    { code: 'CapsLock', display: 'Caps', width: 'w-14 sm:w-20' },
    { code: 'KeyA', display: 'a' },
    { code: 'KeyS', display: 's' },
    { code: 'KeyD', display: 'd' },
    { code: 'KeyF', display: 'f' },
    { code: 'KeyG', display: 'g' },
    { code: 'KeyH', display: 'h' },
    { code: 'KeyJ', display: 'j' },
    { code: 'KeyK', display: 'k' },
    { code: 'KeyL', display: 'l' },
    { code: 'Semicolon', display: ';', altDisplay: ':' },
    { code: 'Quote', display: "'", altDisplay: '"' },
    { code: 'Enter', display: 'Enter', width: 'w-16 sm:w-24' },
  ],
  [
    { code: 'ShiftLeft', display: 'Shift', width: 'w-18 sm:w-24' },
    { code: 'KeyZ', display: 'z' },
    { code: 'KeyX', display: 'x' },
    { code: 'KeyC', display: 'c' },
    { code: 'KeyV', display: 'v' },
    { code: 'KeyB', display: 'b' },
    { code: 'KeyN', display: 'n' },
    { code: 'KeyM', display: 'm' },
    { code: 'Comma', display: ',', altDisplay: '<' },
    { code: 'Period', display: '.', altDisplay: '>' },
    { code: 'Slash', display: '/', altDisplay: '?' },
    { code: 'ShiftRight', display: 'Shift', width: 'w-18 sm:w-24' },
  ],
  [
    { code: 'ControlLeft', display: 'Ctrl', width: 'w-12 sm:w-16' },
    { code: 'AltLeft', display: 'Alt', width: 'w-12 sm:w-16' },
    { code: 'Space', display: 'Space', keyChar: ' ', width: 'flex-1 max-w-xs sm:max-w-md' },
    { code: 'AltRight', display: 'Alt', width: 'w-12 sm:w-16' },
    { code: 'ControlRight', display: 'Ctrl', width: 'w-12 sm:w-16' },
  ]
];

export const VisualKeyboard: React.FC<VisualKeyboardProps> = ({
  typedText,
  targetText,
  testState,
  heatmapData,
  onResetHeatmap,
  isVisible = true,
  onToggleVisibility,
}) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [showHeatmapLegend, setShowHeatmapLegend] = useState(true);

  // Track physical keypresses for real-time visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Normalize key codes or lowercased key chars
      const keyChar = e.key === ' ' ? ' ' : e.key.toLowerCase();
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        next.add(keyChar);
        return next;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyChar = e.key === ' ' ? ' ' : e.key.toLowerCase();
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        next.delete(keyChar);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Determine next expected key in target text
  const nextTargetChar = targetText && typedText.length < targetText.length
    ? targetText[typedText.length].toLowerCase()
    : null;

  // Calculate top missed keys
  const sortedMissedKeys = (Object.entries(heatmapData) as [string, KeyStat][])
    .filter(([_, stat]) => stat.misses > 0 && stat.attempts > 0)
    .map(([keyChar, stat]) => ({
      keyChar,
      misses: stat.misses,
      attempts: stat.attempts,
      rate: Math.round((stat.misses / stat.attempts) * 100),
    }))
    .sort((a, b) => b.misses - a.misses || b.rate - a.rate)
    .slice(0, 5);

  const getKeyHeatmapStyle = (keyChar?: string) => {
    if (!keyChar) return '';
    const normKey = keyChar === ' ' ? ' ' : keyChar.toLowerCase();
    const stat = heatmapData[normKey];

    if (!stat || stat.attempts === 0) {
      return 'bg-theme-card/60 border-theme-muted/20 text-theme-muted hover:border-theme-muted/40';
    }

    const rate = stat.misses / stat.attempts;
    if (stat.misses === 0) {
      return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
    }
    if (rate <= 0.15 || stat.misses <= 2) {
      return 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    }
    if (rate <= 0.35 || stat.misses <= 5) {
      return 'bg-orange-500/25 border-orange-500/60 text-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.3)] font-semibold';
    }
    // High Misses (Red Alert)
    return 'bg-rose-600/30 border-rose-500 text-rose-200 shadow-[0_0_14px_rgba(244,63,94,0.45)] font-bold animate-pulse';
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-[#080b16]/90 border border-theme-muted/20 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4 font-sans backdrop-blur-md" id="visual-keyboard-container">
      {/* Keyboard Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme-muted/15 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-theme-accent/15 text-theme-accent border border-theme-accent/30">
            <KeyboardIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-theme-text flex items-center gap-2 font-mono">
              <span>On-Screen Visual Keyboard</span>
              <span className="text-[10px] bg-theme-accent/20 text-theme-accent border border-theme-accent/30 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                Live Heatmap
              </span>
            </h3>
            <p className="text-[11px] text-theme-muted">
              Real-time key highlighting & persistent mistake frequency tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={onResetHeatmap}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-theme-card hover:bg-theme-card/80 border border-theme-muted/20 text-theme-muted hover:text-theme-text transition-all cursor-pointer text-[11px]"
            title="Clear persistent key error data"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Heatmap</span>
          </button>

          {onToggleVisibility && (
            <button
              onClick={onToggleVisibility}
              className="p-1.5 rounded-xl bg-theme-card hover:bg-theme-card/80 border border-theme-muted/20 text-theme-muted hover:text-theme-text transition-all cursor-pointer"
              title="Hide visual keyboard"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Keyboard Keys Layout Container */}
      <div className="w-full overflow-x-auto pb-1">
        <div className="min-w-[620px] flex flex-col items-center gap-1.5 select-none">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
              {row.map((k) => {
                const keyChar = k.keyChar || k.display.toLowerCase();
                const isPressed = activeKeys.has(k.code) || activeKeys.has(keyChar);
                const isNextTarget = nextTargetChar !== null && (nextTargetChar === keyChar || (nextTargetChar === ' ' && k.code === 'Space'));
                const heatmapClass = getKeyHeatmapStyle(keyChar);

                return (
                  <div
                    key={k.code}
                    className={`
                      relative flex flex-col items-center justify-center
                      h-9 sm:h-11 rounded-lg border text-xs sm:text-sm font-mono font-medium transition-all duration-75
                      ${k.width || 'w-9 sm:w-11'}
                      ${isPressed
                        ? 'bg-theme-accent text-theme-bg border-theme-accent shadow-lg scale-95 font-bold z-10'
                        : isNextTarget
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.5)] font-bold animate-pulse'
                        : heatmapClass
                      }
                    `}
                  >
                    {/* Alt Symbol / Shift display */}
                    {k.altDisplay && (
                      <span className="text-[9px] text-theme-muted/70 absolute top-0.5 right-1">
                        {k.altDisplay}
                      </span>
                    )}

                    {/* Main Key Display */}
                    <span className={k.altDisplay ? 'mt-1' : ''}>
                      {k.display}
                    </span>

                    {/* Next Target Indicator Badge */}
                    {isNextTarget && (
                      <span className="absolute -top-2 bg-cyan-400 text-slate-950 font-sans font-black text-[8px] px-1 rounded-full uppercase shadow-sm">
                        NEXT
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Legend & Top Missed Keys Analytics */}
      <div className="pt-2 border-t border-theme-muted/15 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Heatmap Color Scale Legend */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-[11px]">
          <span className="text-theme-muted font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Heatmap Scale:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-theme-card border border-theme-muted/20 text-theme-muted">
              <span>Neutral</span>
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>0% Errors</span>
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200">
              <span>1-15% Misses</span>
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/25 border border-orange-500/50 text-orange-200">
              <span>15-35%</span>
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-600/30 border border-rose-500 text-rose-200 font-bold">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>&gt;35% High Misses</span>
            </span>
          </div>
        </div>

        {/* Top Missed Keys Pills */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
          <span className="text-theme-muted font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Most Missed Keys:</span>
          </span>
          {sortedMissedKeys.length === 0 ? (
            <span className="text-theme-correct/80 bg-theme-correct/10 border border-theme-correct/20 px-2 py-0.5 rounded-full text-[10px]">
              No key errors recorded yet!
            </span>
          ) : (
            sortedMissedKeys.map((item) => (
              <span
                key={item.keyChar}
                className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-1 font-bold"
              >
                <span className="uppercase font-mono font-black">{item.keyChar === ' ' ? 'Space' : item.keyChar}</span>
                <span className="text-[10px] text-rose-200 font-normal">({item.misses} misses / {item.rate}%)</span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
