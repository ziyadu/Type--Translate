import React from 'react';
import { X, Scale, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="terms-modal-overlay">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-[#0d1122] border border-theme-accent/30 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-muted/20 bg-[#090d1a]">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-theme-text font-mono">Terms of Service</h2>
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
          
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-300 text-sm">Terms Summary</h3>
              <p className="mt-1 text-amber-200/80">
                By using Type & Translate, you agree to these standard terms of service. Our platform is provided for educational, typing practice, and language learning purposes.
              </p>
            </div>
          </div>

          <div className="space-y-4 divide-y divide-theme-muted/10">
            <section className="pt-3 space-y-2">
              <h4 className="font-bold text-theme-text text-sm flex items-center gap-2">
                1. Acceptance of Terms
              </h4>
              <p>
                By accessing or using Type & Translate, you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of the platform.
              </p>
            </section>

            <section className="pt-4 space-y-2">
              <h4 className="font-bold text-theme-text text-sm flex items-center gap-2">
                2. Acceptable Use
              </h4>
              <p>
                You agree to use Type & Translate solely for lawful purposes. You must not attempt to upload malicious scripts through custom text inputs or bypass browser rate limits on real-time translation services.
              </p>
            </section>

            <section className="pt-4 space-y-2">
              <h4 className="font-bold text-theme-text text-sm flex items-center gap-2">
                3. Intellectual Property
              </h4>
              <p>
                All software algorithms, user interface designs, custom themes, sound synthesis modules, and original logo branding are the intellectual property of Type & Translate. User-uploaded custom drill texts remain the property of their respective creators.
              </p>
            </section>

            <section className="pt-4 space-y-2">
              <h4 className="font-bold text-theme-text text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                4. Disclaimer of Warranties
              </h4>
              <p>
                The service is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for 100% translation accuracy and phonetics, translations are machine-assisted and provided for educational assistance.
              </p>
            </section>

            <section className="pt-4 space-y-2">
              <h4 className="font-bold text-theme-text text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-theme-accent" />
                5. Modifications to Service
              </h4>
              <p>
                We reserve the right to modify or update features, keyboard layouts, and supported translation dictionaries at any time without prior notice to improve platform performance.
              </p>
            </section>
          </div>

          <div className="pt-4 text-[11px] text-theme-muted border-t border-theme-muted/10 font-mono text-center">
            Effective Date: July 31, 2026 • Type & Translate
          </div>

        </div>
      </div>
    </div>
  );
}
