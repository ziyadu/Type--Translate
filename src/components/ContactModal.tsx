import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, MessageSquare, HelpCircle, Sparkles, User, Globe } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'feedback' | 'bug' | 'feature' | 'language'>('feedback');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setCategory('feedback');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="contact-modal-overlay">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-lg bg-[#0d1122] border border-theme-accent/30 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-muted/20 bg-[#090d1a]">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-theme-text font-mono">Contact & Support</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-theme-muted/20 text-theme-muted hover:text-theme-text hover:bg-theme-card/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 font-sans text-xs text-theme-muted">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400 text-emerald-400">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-theme-text">Message Received!</h3>
                <p className="text-xs text-theme-muted max-w-xs mx-auto">
                  Thank you for reaching out to Type & Translate team. We appreciate your feedback and will review it promptly.
                </p>
              </div>
              <div className="pt-4 flex gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-theme-card hover:bg-theme-card/80 border border-theme-muted/30 text-theme-text font-semibold cursor-pointer transition-all"
                >
                  Send Another Message
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent/90 text-theme-bg font-bold cursor-pointer transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-theme-muted leading-relaxed">
                Have a question, feature request, translation correction, or bug report? Send us a direct message below.
              </p>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-theme-text uppercase tracking-wider font-mono">Topic</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
                    { id: 'bug', label: 'Report Bug', icon: HelpCircle },
                    { id: 'feature', label: 'Feature', icon: Sparkles },
                    { id: 'language', label: 'Language', icon: Globe },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const active = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-[11px] font-semibold ${
                          active 
                            ? 'bg-theme-accent/20 border-theme-accent text-theme-accent' 
                            : 'bg-theme-card/40 border-theme-muted/15 text-theme-muted hover:border-theme-muted/30'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Email inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-theme-text uppercase tracking-wider font-mono flex items-center gap-1">
                    <User className="w-3 h-3 text-theme-muted" />
                    <span>Your Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-3 py-2 rounded-xl bg-theme-bg/80 border border-theme-muted/20 text-theme-text focus:outline-none focus:border-theme-accent text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-theme-text uppercase tracking-wider font-mono flex items-center gap-1">
                    <Mail className="w-3 h-3 text-theme-muted" />
                    <span>Email (Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-theme-bg/80 border border-theme-muted/20 text-theme-text focus:outline-none focus:border-theme-accent text-xs"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-theme-text uppercase tracking-wider font-mono">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                  placeholder="Share your thoughts or let us know how we can improve..."
                  className="w-full p-3 rounded-xl bg-theme-bg/80 border border-theme-muted/20 text-theme-text focus:outline-none focus:border-theme-accent text-xs resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-theme-muted/20 text-theme-muted hover:text-theme-text transition-all cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                >
                  {isSending ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
