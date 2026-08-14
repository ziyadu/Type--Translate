import React, { useState, useEffect, useRef } from 'react';
import { Target, Trophy, Flame, CheckCircle2, RotateCcw, Zap, ChevronDown } from 'lucide-react';

interface DailyGoalProgressProps {
  // Can pass latest test stats when a test finishes
  lastCompletedWords?: number;
  lastCompletedWpm?: number;
}

export interface DailyGoalData {
  date: string;
  wordsTyped: number;
  peakWpm: number;
  targetWords: number;
  targetWpm: number;
}

export const DailyGoalProgress: React.FC<DailyGoalProgressProps> = ({
  lastCompletedWords = 0,
  lastCompletedWpm = 0,
}) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [dailyData, setDailyData] = useState<DailyGoalData>(() => {
    const todayStr = getTodayString();
    const defaultData: DailyGoalData = {
      date: todayStr,
      wordsTyped: 0,
      peakWpm: 0,
      targetWords: 500,
      targetWpm: 60,
    };

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('typewell_daily_goal_stats');
        if (saved) {
          const parsed: DailyGoalData = JSON.parse(saved);
          // Automatic Midnight Reset Check
          if (parsed.date === todayStr) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load daily goal data', e);
      }
    }
    return defaultData;
  });

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typewell_daily_goal_stats', JSON.stringify(dailyData));
    }
  }, [dailyData]);

  // Midnight reset watchdog timer
  useEffect(() => {
    const checkMidnight = () => {
      const todayStr = getTodayString();
      setDailyData((prev) => {
        if (prev.date !== todayStr) {
          return {
            ...prev,
            date: todayStr,
            wordsTyped: 0,
            peakWpm: 0,
          };
        }
        return prev;
      });
    };

    const interval = setInterval(checkMidnight, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Update stats whenever new words/WPM are reported from completed test
  useEffect(() => {
    if (lastCompletedWords > 0 || lastCompletedWpm > 0) {
      const todayStr = getTodayString();
      setDailyData((prev) => {
        const isNewDay = prev.date !== todayStr;
        const currentWords = isNewDay ? 0 : prev.wordsTyped;
        const currentPeak = isNewDay ? 0 : prev.peakWpm;

        return {
          ...prev,
          date: todayStr,
          wordsTyped: currentWords + lastCompletedWords,
          peakWpm: Math.max(currentPeak, lastCompletedWpm),
        };
      });
    }
  }, [lastCompletedWords, lastCompletedWpm]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Progress Calculations
  const wordProgress = Math.min(100, Math.round((dailyData.wordsTyped / dailyData.targetWords) * 100));
  const isGoalAchieved = wordProgress >= 100;

  // Radial Circle Math
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (wordProgress / 100) * circumference;

  const handleUpdateTargetWords = (newTarget: number) => {
    setDailyData((prev) => ({ ...prev, targetWords: newTarget }));
  };

  const handleUpdateTargetWpm = (newTargetWpm: number) => {
    setDailyData((prev) => ({ ...prev, targetWpm: newTargetWpm }));
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Header Button Progress Widget */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        id="header-daily-goal-btn"
        className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm select-none transform hover:scale-105 ${
          isGoalAchieved
            ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 ring-2 ring-emerald-400/30'
            : 'bg-slate-900/80 hover:bg-slate-800 border-cyan-500/30 text-cyan-300'
        }`}
        title={`Daily Goal Progress: ${dailyData.wordsTyped} / ${dailyData.targetWords} words (${wordProgress}%) - Resets at midnight`}
      >
        {/* SVG Radial Indicator */}
        <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 32 32">
            {/* Background ring */}
            <circle
              cx="16"
              cy="16"
              r={radius}
              className="stroke-slate-800"
              strokeWidth="3.5"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="16"
              cy="16"
              r={radius}
              className={isGoalAchieved ? "stroke-emerald-400 transition-all duration-500" : "stroke-cyan-400 transition-all duration-500"}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          {isGoalAchieved ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 absolute" />
          ) : (
            <Target className="w-3 h-3 text-cyan-300 absolute" />
          )}
        </div>

        {/* Compact Label */}
        <div className="flex flex-col text-left leading-tight hidden xs:flex">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            {isGoalAchieved ? 'Goal Met! 🎉' : 'Daily Goal'}
          </span>
          <span className="text-[11px] font-mono font-bold text-white">
            {dailyData.wordsTyped}/{dailyData.targetWords} <span className="text-cyan-400 text-[10px]">({wordProgress}%)</span>
          </span>
        </div>

        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 hidden sm:block ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#090d1e] border border-cyan-500/40 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-slate-200">
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isGoalAchieved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-sans">Daily Typing Goal</h4>
                <p className="text-[10px] text-slate-400 font-mono">Resets automatically at midnight 🌙</p>
              </div>
            </div>
            {isGoalAchieved && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold font-mono animate-pulse">
                COMPLETE!
              </span>
            )}
          </div>

          {/* Progress Bar & Details */}
          <div className="py-3 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400">Words Typed Today</span>
                <span className="text-cyan-300 font-bold">
                  {dailyData.wordsTyped} / {dailyData.targetWords} words
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isGoalAchieved
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-300 shadow-[0_0_12px_#10b981]'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_#22d3ee]'
                  }`}
                  style={{ width: `${wordProgress}%` }}
                />
              </div>
            </div>

            {/* Peak WPM achieved today */}
            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Peak WPM Today</span>
                <span className="text-sm font-black text-cyan-300 font-mono">
                  {dailyData.peakWpm > 0 ? `${dailyData.peakWpm} WPM` : '--'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Progress Goal</span>
                <span className={`text-sm font-black font-mono ${isGoalAchieved ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {wordProgress}%
                </span>
              </div>
            </div>

            {/* Target Words Selector */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 font-sans block">Change Daily Word Target</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[250, 500, 1000, 2000].map((target) => (
                  <button
                    key={target}
                    onClick={() => handleUpdateTargetWords(target)}
                    className={`py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      dailyData.targetWords === target
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {target}
                  </button>
                ))}
              </div>
            </div>

            {/* Target WPM Goal Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 font-sans block">Target WPM Speed Goal</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[40, 60, 80, 100].map((wpm) => (
                  <button
                    key={wpm}
                    onClick={() => handleUpdateTargetWpm(wpm)}
                    className={`py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      dailyData.targetWpm === wpm
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {wpm} WPM
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Note */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>🔥 Goal resets every 24h</span>
            <button
              onClick={() => {
                const todayStr = getTodayString();
                setDailyData({
                  date: todayStr,
                  wordsTyped: 0,
                  peakWpm: 0,
                  targetWords: dailyData.targetWords,
                  targetWpm: dailyData.targetWpm,
                });
              }}
              className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              title="Reset today's counter"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
