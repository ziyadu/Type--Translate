import React from 'react';
import { X, Info, Globe, Zap, Languages, Award, Sparkles, BookOpen, Heart } from 'lucide-react';
import Logo from './Logo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="about-modal-overlay">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-[#0d1122] border border-theme-accent/30 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-muted/20 bg-[#090d1a]">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-theme-accent" />
            <h2 className="text-lg font-bold text-theme-text font-mono">About Type & Translate</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-theme-muted/20 text-theme-muted hover:text-theme-text hover:bg-theme-card/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-sans text-sm text-theme-muted leading-relaxed">
          
          <div className="flex flex-col items-center text-center py-4 bg-theme-accent/5 rounded-2xl border border-theme-accent/20 p-6">
            <Logo size="lg" showSubtitle />
            <p className="mt-4 text-theme-text text-base font-medium max-w-lg">
              The modern interactive platform bridging high-speed touch typing with real-time multilingual language acquisition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-theme-card/50 rounded-2xl border border-theme-muted/15 space-y-2">
              <div className="flex items-center gap-2 text-theme-accent font-bold font-mono text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 text-theme-accent" />
                <span>Precision Telemetry</span>
              </div>
              <p className="text-xs text-theme-muted">
                Calculates exact Net Words Per Minute (WPM), Raw CPM, accuracy percentages, keystroke rhythm, and mistype logs in real time.
              </p>
            </div>

            <div className="p-4 bg-theme-card/50 rounded-2xl border border-theme-muted/15 space-y-2">
              <div className="flex items-center gap-2 text-theme-correct font-bold font-mono text-xs uppercase tracking-wider">
                <Languages className="w-4 h-4 text-theme-correct" />
                <span>50+ Live Languages</span>
              </div>
              <p className="text-xs text-theme-muted">
                Dual-pane synchronized translation system with phonetic IPA pronunciated guides, sentence alignments, and vocabulary builders.
              </p>
            </div>

            <div className="p-4 bg-theme-card/50 rounded-2xl border border-theme-muted/15 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Kid-Friendly Arcade</span>
              </div>
              <p className="text-xs text-theme-muted">
                Gamified mode featuring cartoon visual cards, native sound effects, bird/animal mini-quizzes, and positive mascot feedback.
              </p>
            </div>

            <div className="p-4 bg-theme-card/50 rounded-2xl border border-theme-muted/15 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>AI OCR Scanner</span>
              </div>
              <p className="text-xs text-theme-muted">
                Scan physical book pages or handwritten text with camera/upload to generate custom typing drills on the fly.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#080b18] rounded-2xl border border-theme-muted/20 space-y-3">
            <h3 className="font-bold text-theme-text text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-theme-accent" />
              <span>Our Mission</span>
            </h3>
            <p className="text-xs text-theme-muted">
              We believe speed typing should be more than repetitive key mashing. By embedding real-time translation and phonetics directly under every word typed, users turn typing practice into an effortless global language learning routine.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-theme-muted border-t border-theme-muted/10 font-mono">
            <span>Version 2.4.0 (Stable)</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for global typists
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
