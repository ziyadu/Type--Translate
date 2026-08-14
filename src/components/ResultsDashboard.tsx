import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Award, CheckCircle, AlertTriangle, Calendar, Clock, BarChart3, Trash2, Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';
import { TestResult, TestMode } from '../types';
import { speakText, cancelSpeech, unlockSpeechSynthesis, sanitizeSpeechText } from '../utils/speech';

interface ResultsDashboardProps {
  wpm: number;
  cpm: number;
  accuracy: number;
  totalMistakes: number;
  correctChars: number;
  wrongChars: number;
  duration: number;
  mode: TestMode;
  passageSnippet: string;
  onRestart: () => void;
  isAutoReadActive?: boolean;
  speechRate?: number;
}

export default function ResultsDashboard({
  wpm,
  cpm,
  accuracy,
  totalMistakes,
  correctChars,
  wrongChars,
  duration,
  mode,
  passageSnippet,
  onRestart,
  isAutoReadActive = true,
  speechRate = 1.0,
}: ResultsDashboardProps) {
  const [history, setHistory] = useState<TestResult[]>([]);

  // Speech synthesis audio playback state for completed typing text
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingWordIdx, setSpeakingWordIdx] = useState<number | null>(null);
  const [rate, setRate] = useState<number>(speechRate || 1.0);

  const words = passageSnippet ? passageSnippet.trim().split(/\s+/) : [];

  const handleStopSpeech = () => {
    cancelSpeech();
    setIsSpeaking(false);
    setSpeakingWordIdx(null);
  };

  const handlePlaySpeech = () => {
    if (!passageSnippet) return;
    unlockSpeechSynthesis();

    setIsSpeaking(true);
    speakText(passageSnippet, {
      rate: rate,
      lang: 'en-US',
      cancelPrevious: true,
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        setSpeakingWordIdx(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeakingWordIdx(null);
      },
    });
  };

  const handleSpeakSingleWord = (word: string, index: number) => {
    unlockSpeechSynthesis();
    setSpeakingWordIdx(index);
    setIsSpeaking(true);

    const clean = sanitizeSpeechText(word);
    speakText(clean || word, {
      rate: rate,
      lang: 'en-US',
      cancelPrevious: true,
      onEnd: () => {
        setIsSpeaking(false);
        setSpeakingWordIdx(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeakingWordIdx(null);
      },
    });
  };

  // Auto-read finished passage when dashboard mounts if auto read is enabled
  useEffect(() => {
    if (isAutoReadActive && passageSnippet) {
      const timer = setTimeout(() => {
        handlePlaySpeech();
      }, 400);
      return () => {
        clearTimeout(timer);
        handleStopSpeech();
      };
    }
    return () => {
      handleStopSpeech();
    };
  }, [passageSnippet, isAutoReadActive]);

  // Qualitative Performance Assessment
  const getRating = (speed: number, acc: number) => {
    if (speed >= 80 && acc >= 96) {
      return {
        title: 'Legendary Typist!',
        desc: 'Incredible speed and accuracy! You write with the velocity of a seasoned software developer or professional transcriber.',
        color: 'text-theme-accent',
        bg: 'bg-theme-accent/10 border-theme-accent/30',
      };
    } else if (speed >= 60 && acc >= 92) {
      return {
        title: 'Professional Grade!',
        desc: 'Exceptional typing speed. You are comfortably above the average typing benchmark and demonstrate excellent tactile coordination.',
        color: 'text-theme-accent',
        bg: 'bg-theme-accent/10 border-theme-accent/30',
      };
    } else if (speed >= 40 && acc >= 85) {
      return {
        title: 'Competent Wordsmith!',
        desc: 'Solid intermediate skills. With a bit of deliberate practice, you will break into the professional tiers in no time.',
        color: 'text-theme-correct',
        bg: 'bg-theme-muted/10 border-theme-muted/20',
      };
    } else {
      return {
        title: 'Rising Champion!',
        desc: 'A promising start! Focus on hitting the correct keys slowly first to build muscle memory; pure speed will follow naturally.',
        color: 'text-theme-muted',
        bg: 'bg-theme-muted/5 border-theme-muted/10',
      };
    }
  };

  const rating = getRating(wpm, accuracy);

  // Save current result to history on mount
  useEffect(() => {
    const uniqueId = `res_${Date.now()}`;
    const newResult: TestResult = {
      id: uniqueId,
      wpm: Math.round(wpm),
      cpm,
      accuracy,
      totalMistakes,
      correctChars,
      wrongChars,
      duration,
      mode,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      passageSnippet: passageSnippet.length > 40 ? passageSnippet.substring(0, 40) + '...' : passageSnippet,
    };

    const saved = localStorage.getItem('typing-test-history');
    let updatedHistory: TestResult[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TestResult[];
        // Filter out any duplicates that could happen on double render
        if (!parsed.some(r => r.passageSnippet === newResult.passageSnippet && r.wpm === newResult.wpm && Math.abs(Date.now() - parseInt(r.id.split('_')[1])) < 2000)) {
          updatedHistory = [newResult, ...parsed];
        } else {
          updatedHistory = parsed;
        }
      } catch (e) {
        updatedHistory = [newResult];
      }
    } else {
      updatedHistory = [newResult];
    }

    // Keep history capped at 10 results
    updatedHistory = updatedHistory.slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('typing-test-history', JSON.stringify(updatedHistory));
  }, [wpm, cpm, accuracy, totalMistakes, correctChars, wrongChars, duration, mode, passageSnippet]);

  const clearHistory = () => {
    localStorage.removeItem('typing-test-history');
    setHistory([]);
  };

  const getFriendlyModeName = (m: TestMode) => {
    switch (m) {
      case 'words': return 'Random Words';
      case 'sentence': return 'Sentences';
      case 'paragraph': return 'Paragraphs';
      case 'time_challenge': return 'Time Challenge';
      case 'custom': return 'Custom Text';
      default: return m;
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-300" id="results-dashboard-root">
      
      {/* Visual Trophy Award & Feedback */}
      <div className={`p-6 rounded-2xl border ${rating.bg} flex flex-col md:flex-row items-center gap-6`} id="rating-jumbotron">
        <div className="flex-shrink-0 bg-theme-card p-4 rounded-full border border-theme-muted/20">
          <Award className="w-12 h-12 text-theme-accent" />
        </div>
        <div className="text-center md:text-left flex-1 space-y-1">
          <span className="text-[10px] font-bold tracking-widest uppercase text-theme-accent">Performance Appraisal</span>
          <h2 className={`text-2xl font-bold ${rating.color}`}>{rating.title}</h2>
          <p className="text-theme-text/80 text-sm max-w-xl leading-relaxed">{rating.desc}</p>
        </div>
        <button
          onClick={onRestart}
          id="results-top-restart-btn"
          className="flex-shrink-0 bg-theme-accent hover:bg-theme-accent-hover text-theme-bg px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Test Again</span>
        </button>
      </div>

      {/* Main Grid of Final Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="results-metric-grid">
        {/* WPM */}
        <div className="bg-theme-card/40 border border-theme-muted/20 p-5 rounded-2xl text-center space-y-2">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Words Per Minute</p>
          <p className="text-5xl font-mono font-bold text-theme-accent" id="result-wpm">
            {Math.round(wpm)}
          </p>
          <p className="text-xs text-theme-muted">Standard 5-char words</p>
        </div>

        {/* Accuracy */}
        <div className="bg-theme-card/40 border border-theme-muted/20 p-5 rounded-2xl text-center space-y-2">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Accuracy</p>
          <p className="text-5xl font-mono font-bold text-theme-correct" id="result-accuracy">
            {accuracy.toFixed(1)}%
          </p>
          <p className="text-xs text-theme-muted">With {totalMistakes} typo triggers</p>
        </div>

        {/* Characters Typed */}
        <div className="bg-theme-card/40 border border-theme-muted/20 p-5 rounded-2xl text-center space-y-2">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Total Keys Pressed</p>
          <p className="text-4xl font-mono font-bold text-theme-text mt-1" id="result-keys">
            {correctChars + wrongChars}
          </p>
          <p className="text-xs text-theme-muted">
            <span className="text-theme-correct font-semibold">{correctChars} ok</span>
            {' • '}
            <span className="text-theme-wrong font-semibold">{wrongChars} wrong</span>
          </p>
        </div>

        {/* Duration */}
        <div className="bg-theme-card/40 border border-theme-muted/20 p-5 rounded-2xl text-center space-y-2">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Time Taken</p>
          <p className="text-4xl font-mono font-bold text-theme-text mt-1" id="result-duration">
            {Math.round(duration)}s
          </p>
          <p className="text-xs text-theme-muted font-mono">{cpm} characters/min</p>
        </div>
      </div>

      {/* History panel & breakdown section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="history-container-grid">
        {/* Test Info Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-theme-card/20 border border-theme-muted/15 p-5 rounded-2xl space-y-4">
            <h3 className="font-semibold text-theme-correct flex items-center gap-2 text-sm uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-theme-accent" />
              Test Summary
            </h3>
            <div className="space-y-3.5 text-xs text-theme-text/80 font-mono">
              <div className="flex justify-between py-1 border-b border-theme-muted/10">
                <span className="text-theme-muted font-sans">Practice Mode:</span>
                <span className="font-semibold">{getFriendlyModeName(mode)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-muted/10">
                <span className="text-theme-muted font-sans">Test Duration:</span>
                <span className="font-semibold">{duration} seconds</span>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-muted/10">
                <span className="text-theme-muted font-sans">Keys typed successfully:</span>
                <span className="text-theme-correct font-semibold">{correctChars}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-muted/10">
                <span className="text-theme-muted font-sans">Correct keys ratio:</span>
                <span className="font-semibold">
                  {((correctChars / (correctChars + wrongChars || 1)) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="text-xs bg-theme-bg/30 p-3 rounded-lg border border-theme-muted/20">
              <span className="block text-[10px] font-bold uppercase text-theme-muted mb-1 font-mono">Passage snippet practiced</span>
              <p className="italic text-theme-text/70 line-clamp-3 leading-relaxed">
                "{passageSnippet}"
              </p>
            </div>
          </div>
        </div>

        {/* History table */}
        <div className="lg:col-span-2">
          <div className="bg-theme-card/20 border border-theme-muted/15 p-5 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-theme-correct flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-theme-accent" />
                  Recent Scores History
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    id="clear-history-btn"
                    className="text-xs text-theme-muted hover:text-theme-wrong flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear logs</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 text-theme-muted text-sm border border-dashed border-theme-muted/10 rounded-xl bg-theme-bg/10">
                  Save tests to compile persistent metric history!
                </div>
              ) : (
                <div className="overflow-x-auto" id="history-table-container">
                  <table className="w-full text-left border-collapse font-sans text-xs">
                    <thead>
                      <tr className="border-b border-theme-muted/15 text-theme-muted uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3 text-right">WPM</th>
                        <th className="py-2.5 px-3 text-right">Accuracy</th>
                        <th className="py-2.5 px-3">Passage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-muted/10 text-theme-text/80 font-mono">
                      {history.map((item, idx) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-theme-card/30 transition-all ${
                            idx === 0 ? 'bg-theme-accent/5 font-semibold text-theme-correct' : ''
                          }`}
                        >
                          <td className="py-3 px-3 flex items-center gap-1.5 text-theme-muted">
                            <Calendar className="w-3 h-3 text-theme-muted" />
                            {item.date}
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-theme-card px-2 py-0.5 rounded border border-theme-muted/20 text-[10px] text-theme-text">
                              {getFriendlyModeName(item.mode)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-theme-accent font-bold">
                            {item.wpm}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold">
                            {item.accuracy.toFixed(0)}%
                          </td>
                          <td className="py-3 px-3 max-w-[140px] truncate italic text-theme-muted font-sans">
                            {item.passageSnippet}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-[10px] text-theme-muted mt-4 font-mono text-center lg:text-left">
              * Scores are stored in your secure client local storage context.
            </p>
          </div>
        </div>
      </div>

      {/* Words Read Aloud Voice Playback Section (Positioned at the very end) */}
      <div className="bg-theme-card/30 border border-theme-accent/20 rounded-2xl p-5 space-y-4" id="words-read-aloud-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-theme-accent/10 rounded-xl border border-theme-accent/20 text-theme-accent">
              <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-text flex items-center gap-2 font-mono">
                Words Read Out Loud
                {isSpeaking && (
                  <span className="text-[10px] bg-theme-accent/20 text-theme-accent px-2 py-0.5 rounded-full uppercase tracking-wider font-sans font-semibold">
                    Reading...
                  </span>
                )}
              </h3>
              <p className="text-xs text-theme-muted">
                Listen to all completed words read aloud or click any word to pronounce individually.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Rate selector */}
            <div className="flex items-center gap-1 bg-theme-bg/50 p-1 rounded-xl border border-theme-muted/15 text-xs font-mono">
              {[0.8, 1.0, 1.2, 1.5].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRate(r);
                    if (isSpeaking) {
                      handleStopSpeech();
                    }
                  }}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    rate === r
                      ? 'bg-theme-accent text-theme-bg font-bold shadow-sm'
                      : 'text-theme-muted hover:text-theme-text'
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>

            {/* Play / Stop Button */}
            {isSpeaking ? (
              <button
                onClick={handleStopSpeech}
                className="bg-theme-wrong/20 hover:bg-theme-wrong/30 text-theme-wrong border border-theme-wrong/30 px-3 py-1.5 rounded-xl text-xs font-medium font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </button>
            ) : (
              <button
                onClick={handlePlaySpeech}
                className="bg-theme-accent hover:bg-theme-accent-hover text-theme-bg px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Read All Words</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Word Chips display */}
        <div className="flex flex-wrap gap-1.5 p-3.5 bg-theme-bg/40 rounded-xl border border-theme-muted/10 font-mono text-sm leading-relaxed max-h-48 overflow-y-auto">
          {words.map((word, idx) => {
            const isHighlighted = speakingWordIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSpeakSingleWord(word, idx)}
                className={`px-2 py-1 rounded-lg border transition-all duration-150 cursor-pointer text-xs ${
                  isHighlighted
                    ? 'bg-theme-accent text-theme-bg border-theme-accent font-bold scale-110 shadow-lg z-10'
                    : 'bg-theme-card/50 border-theme-muted/15 text-theme-text/85 hover:border-theme-accent/40 hover:text-theme-accent'
                }`}
                title={`Click to read "${word}" out loud`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
