import React from 'react';
import { Timer, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface StatsPanelProps {
  wpm: number;
  cpm: number;
  accuracy: number;
  totalMistakes: number;
  correctChars: number;
  wrongChars: number;
  elapsedTime: number;
  totalTime: number;
}

export default function StatsPanel({
  wpm,
  cpm,
  accuracy,
  totalMistakes,
  correctChars,
  wrongChars,
  elapsedTime,
  totalTime,
}: StatsPanelProps) {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const remainingTime = Math.max(0, totalTime - elapsedTime);

  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-4 border border-theme-muted/15 rounded-2xl bg-[#090c15]/80 backdrop-blur-md overflow-hidden text-xs font-mono select-none divide-y sm:divide-y-0 sm:divide-x divide-theme-muted/15 shadow-lg" 
      id="stats-panel-horizontal-row"
    >
      {/* WPM column */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between" id="stat-col-wpm">
        <span className="text-theme-muted font-bold tracking-wider font-sans text-[11px] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-theme-accent" />
          <span>WPM</span>
        </span>
        <span className="text-2xl sm:text-3xl font-bold text-theme-accent font-mono transition-all duration-300">
          {Math.round(wpm)}
        </span>
      </div>

      {/* Accuracy column */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between" id="stat-col-accuracy">
        <span className="text-theme-muted font-bold tracking-wider font-sans text-[11px] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-theme-correct" />
          <span>ACCURACY</span>
        </span>
        <span className="text-2xl sm:text-3xl font-bold text-theme-correct font-mono transition-all duration-300">
          {accuracy.toFixed(0)}%
        </span>
      </div>

      {/* Mistakes column */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between" id="stat-col-mistakes">
        <span className="text-theme-muted font-bold tracking-wider font-sans text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-theme-wrong" />
          <span>MISTAKES</span>
        </span>
        <span className="text-2xl sm:text-3xl font-bold text-theme-wrong font-mono transition-all duration-300">
          {totalMistakes}
        </span>
      </div>

      {/* Time column - Highlighted bottom timer display */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between bg-theme-accent/5 border-l-2 sm:border-l-0 border-theme-accent/30" id="stat-col-time">
        <span className="text-theme-accent font-bold tracking-wider font-sans text-[11px] flex items-center gap-1.5">
          <Timer className="w-4 h-4 text-theme-accent animate-pulse" />
          <span>TIMER</span>
        </span>
        <div className="flex flex-col items-end">
          <span className="text-xl sm:text-2xl font-black text-theme-text font-mono tracking-tighter flex items-center gap-1">
            {formatTime(remainingTime > 0 ? remainingTime : elapsedTime)}
            <span className="text-xs text-theme-muted font-normal font-sans">
              {remainingTime > 0 ? 'left' : 'sec'}
            </span>
          </span>
          <span className="text-[10px] text-theme-muted font-mono">
            {formatTime(elapsedTime)} / {formatTime(totalTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
