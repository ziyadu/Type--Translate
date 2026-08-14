import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, X, CheckCircle2, Sparkles } from 'lucide-react';

export interface ShowcaseStep {
  targetId: string;
  title: string;
  subtitle?: string;
  description: string;
  badge: string;
  emoji: string;
}

const DEFAULT_STEPS: ShowcaseStep[] = [
  {
    targetId: 'controls-options-three-dots-btn',
    title: 'Workspace Options & Themes',
    subtitle: 'Sound Presets, Themes & Timers',
    description: 'Customize mechanical keyboard sound effects (Cherry MX, Typewriter), pick visual themes, and configure test timers.',
    badge: 'Step 1 of 7',
    emoji: '⚙️'
  },
  {
    targetId: 'typing-box-container',
    title: 'Interactive Typing & Custom Text',
    subtitle: 'Speed, Accuracy & Custom Lessons',
    description: 'Type passages with real-time WPM velocity tracking, error highlighting, or click Custom Text to write & import custom practice scripts.',
    badge: 'Step 2 of 7',
    emoji: '⌨️'
  },
  {
    targetId: 'audio-sound-selector',
    title: 'Keystroke Sound Effects',
    subtitle: 'Tactile Audio Feedback',
    description: 'Enjoy realistic mechanical key sound presets (Clicky Cherry MX Blue, Thocky Brown, Vintage Typewriter, or Bubble Pop) as you type.',
    badge: 'Step 3 of 7',
    emoji: '🔊'
  },
  {
    targetId: 'visual-keyboard-container',
    title: 'Visual Keyboard & Heatmap',
    subtitle: 'Live Keystrokes & Error Analytics',
    description: 'Interactive on-screen QWERTY keyboard with real-time keystroke lighting and color-coded accuracy error heatmaps.',
    badge: 'Step 4 of 7',
    emoji: '🎹'
  },
  {
    targetId: 'translation-workspace-panel',
    title: 'Live AI Translator',
    subtitle: '50+ Languages & Phonetics',
    description: 'Translates what you type instantly into over 50 languages with native scripts, phonetic pronunciation, and audio playback.',
    badge: 'Step 5 of 7',
    emoji: '🌐'
  },
  {
    targetId: 'mode-btn-camera-ocr',
    title: 'Camera OCR Scanner',
    subtitle: 'Scan Physical Documents & Books',
    description: 'Point your camera or upload images of physical books & documents to convert them into interactive typing practice lessons.',
    badge: 'Step 6 of 7',
    emoji: '📷'
  },
  {
    targetId: 'header-kids-mode-toggle',
    title: 'Kids Learning Mode',
    subtitle: 'ABC, Pictures & Games',
    description: 'A vibrant child-friendly environment with alphabet phonetics, visual picture flashcards, and gamified typing exercises.',
    badge: 'Step 7 of 7',
    emoji: '🧒'
  }
];

export interface ShowcaseTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: ShowcaseStep[];
}

export const ShowcaseTourModal: React.FC<ShowcaseTourProps> = ({
  isOpen,
  onClose,
  steps = DEFAULT_STEPS
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];

  // Measure and track target element position
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const updateRect = () => {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const handleResize = () => updateRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    const timer = setTimeout(updateRect, 120);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      clearTimeout(timer);
    };
  }, [isOpen, currentStepIndex, currentStep]);

  if (!isOpen || !currentStep) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typesmart_showcase_seen', 'true');
    }
    onClose();
  };

  // Compute card positioning and arrow placement
  const isTargetInUpperHalf = targetRect ? targetRect.top < window.innerHeight / 2 : true;

  const getCardStyle = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const cardWidth = isMobile ? Math.min(window.innerWidth - 32, 340) : 340;
    const padding = 16;

    let top: number;
    if (isTargetInUpperHalf) {
      top = targetRect.bottom + padding;
    } else {
      top = targetRect.top - 230;
    }

    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;

    // Keep card within viewport edges
    if (left < 16) left = 16;
    if (left + cardWidth > window.innerWidth - 16) {
      left = window.innerWidth - cardWidth - 16;
    }

    top = Math.max(16, Math.min(top, window.innerHeight - 250));

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
    };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto overflow-hidden animate-in fade-in duration-200">
      
      {/* Fallback dark overlay if targetRect is not yet calculated */}
      {!targetRect && (
        <div 
          className="absolute inset-0 bg-black/70 transition-all duration-300"
        />
      )}

      {/* Transparent Backdrop around target */}
      {targetRect && (
        <div 
          className="fixed inset-0 z-[100]"
        />
      )}

      {/* Crystal Clear Cutout Spotlight (Flutter Showcase Style) */}
      {/* Uses a massive 9999px box-shadow to darken everything OUTSIDE the cutout, leaving the inside 100% sharp & un-obscured */}
      {targetRect && (
        <div
          className="fixed rounded-2xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.72),0_0_20px_rgba(255,255,255,0.9)] transition-all duration-300 pointer-events-none z-[101]"
          style={{
            top: `${Math.max(0, targetRect.top - 8)}px`,
            left: `${Math.max(0, targetRect.left - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
        />
      )}

      {/* Showcase Tooltip Card (Exact Flutter ShowcaseView Style) */}
      <div
        ref={cardRef}
        style={getCardStyle()}
        className="fixed z-[102] bg-white text-slate-900 rounded-2xl shadow-2xl p-5 border border-slate-200 transition-all duration-300 flex flex-col justify-between"
      >
        {/* Pointer Arrow */}
        {targetRect && (
          <div 
            className={`absolute w-4 h-4 bg-white rotate-45 border-slate-200 ${
              isTargetInUpperHalf 
                ? '-top-2 border-t border-l' 
                : '-bottom-2 border-b border-r'
            }`}
            style={{
              left: `${Math.min(Math.max(20, targetRect.left + targetRect.width / 2 - (parseFloat(getCardStyle().left) || 0) - 8), 300)}px`
            }}
          />
        )}

        {/* Card Header & Content */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-mono">
              {currentStep.badge}
            </span>
          </div>

          <div className="flex items-start gap-3 mt-1">
            <span className="text-2xl p-2 rounded-xl bg-slate-100 shrink-0">
              {currentStep.emoji}
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {currentStep.title}
              </h3>
              {currentStep.subtitle && (
                <p className="text-xs font-medium text-orange-600 mt-0.5">
                  {currentStep.subtitle}
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-3 font-sans leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Bottom Action Row (Next / Previous buttons only) */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          {currentStepIndex > 0 && (
            <button
              onClick={handlePrev}
              id="showcase-prev-btn"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          )}

          <button
            onClick={handleNext}
            id="showcase-next-btn"
            className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <span>{currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}</span>
            {currentStepIndex === steps.length - 1 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default ShowcaseTourModal;

