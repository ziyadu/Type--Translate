import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Server, FileText } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="privacy-modal-overlay">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-[#0d1122] border border-theme-accent/30 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-muted/20 bg-[#090d1a]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-theme-text font-mono">Privacy Policy</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-theme-muted/20 text-theme-muted hover:text-theme-text hover:bg-theme-card/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-sans text-xs text-theme-muted leading-relaxed">
          
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-300 text-sm">Client-First Data Privacy Guarantee</h3>
              <p className="mt-1 text-emerald-200/80">
                Type & Translate respects your privacy. Typing performance telemetry, custom uploaded texts, and history logs are processed locally in your browser storage.
              </p>
            </div>
          </div>

          <div className="space-y-4 divide-y divide-theme-muted/10">
            <section className="pt-3 space-y-2">
              <h4 className="font-bold text-theme-text text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-theme-accent" />
                1. Information We Collect
              </h4>
              <p>
                We collect anonymous typing performance metrics (such as Words Per Minute, Accuracy %, and duration) stored locally on your device via browser <code className="text-theme-accent font-mono bg-theme-bg px-1 py-0.5 rounded">localStorage</code> to render your progress charts and session history.
              </p>
            </section>

            <section className="pt-4 space-y-2">
              <h4 className="font-bold text-theme-text text-sm flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-theme-accent" />
                2. No Keystroke Logging
              </h4>
              <p>
                We do NOT store or transmit your raw keystroke sequences, passwords, or personal identity onto external marketing databases. All typing evaluations happen client-side in memory.
              </p>
            </section>

            <section className="pt-4 space-y-2">
              <h4 className="font-bold text-theme-text text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-theme-accent" />
                3. Camera OCR & Audio Processing
              </h4>
              <p>
                Camera document scanning and Speech-to-Text audio features run strictly on-demand. Camera streams are processed locally and discarded immediately after text extraction.
              </p>
            </section>

            <section className="pt-4 space-y-2">
              <h4 className="font-bold text-theme-text text-sm">4. Third-Party Services</h4>
              <p>
                We utilize minimal Google Translation API proxies solely for real-time word translations. No personally identifiable information (PII) is shared during translation requests.
              </p>
            </section>

            <section className="pt-4 space-y-2">
              <h4 className="font-bold text-theme-text text-sm">5. Your Control & Data Clearing</h4>
              <p>
                You can clear your stored test history, custom saved drills, and sound preferences at any time by clearing your browser cache or clicking "Clear History" inside the Scores Log panel.
              </p>
            </section>
          </div>

          <div className="pt-4 text-[11px] text-theme-muted border-t border-theme-muted/10 font-mono text-center flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Last Updated: August 8, 2026 • Type & Translate Legal Team</span>
            <a 
              href="/privacy.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
            >
              Open Direct URL
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
