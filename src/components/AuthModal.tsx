import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  LogIn, 
  UserPlus, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Trophy,
  Flame,
  KeyRound
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogin: (updatedUser: UserProfile) => void;
  onLogout: () => void;
}

const AVATAR_PRESETS = [
  '⚡', '🚀', '🎯', '🔥', '⌨️', '🌐', '🦊', '🦁', '🦉', '💎'
];

export default function AuthModal({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout,
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('⚡');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleQuickDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const demoUser: UserProfile = {
        id: 'usr_demo_88',
        name: 'Alex Rivera',
        email: 'alex.rivera@typist.io',
        avatar: '⚡',
        joinedDate: 'July 2026',
        isLoggedIn: true,
        bestWpm: 94,
        testsCompleted: 42,
      };
      onLogin(demoUser);
      setIsSubmitting(false);
      setMessage({ type: 'success', text: 'Welcome back, Alex!' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 700);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (tab === 'signup' && !name.trim()) {
      setMessage({ type: 'error', text: 'Please enter your display name.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    setTimeout(() => {
      const loggedInUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: tab === 'signup' ? name.trim() : email.split('@')[0] || 'Speed Typist',
        email: email.trim(),
        avatar: selectedAvatar,
        joinedDate: user.joinedDate || 'July 2026',
        isLoggedIn: true,
        bestWpm: user.bestWpm || 0,
        testsCompleted: user.testsCompleted || 0,
      };

      onLogin(loggedInUser);
      setIsSubmitting(false);
      setMessage({ 
        type: 'success', 
        text: tab === 'signup' ? 'Account created successfully!' : 'Signed in successfully!' 
      });

      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 800);
    }, 500);
  };

  const handleLogoutClick = () => {
    onLogout();
    setMessage({ type: 'success', text: 'You have been logged out.' });
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="auth-modal-overlay">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-[#0d1122] border border-theme-accent/30 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-muted/20 bg-[#090d1a]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-theme-accent/20 border border-theme-accent/40 flex items-center justify-center text-theme-accent">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-theme-text font-mono">
                {user.isLoggedIn ? 'Account Profile' : 'Sign In / Register'}
              </h2>
              <p className="text-[10px] text-theme-muted font-mono">
                {user.isLoggedIn ? 'Manage session & typing stats' : 'Sync typing history across devices'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-theme-muted/20 text-theme-muted hover:text-theme-text hover:bg-theme-card/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 font-sans text-xs">
          
          {/* Status Toast */}
          {message && (
            <div className={`mb-4 p-3 rounded-2xl border text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200 ${
              message.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          {/* LOGGED IN VIEW */}
          {user.isLoggedIn ? (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="p-5 bg-gradient-to-br from-theme-card/80 to-[#12182d] rounded-2xl border border-theme-accent/25 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-theme-accent/30 to-cyan-500/30 border-2 border-theme-accent/50 flex items-center justify-center text-3xl shadow-lg shrink-0">
                    {user.avatar || '⚡'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-theme-text truncate">{user.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-theme-muted truncate">{user.email}</p>
                    <p className="text-[10px] text-theme-muted/70 font-mono mt-0.5">Member since {user.joinedDate}</p>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-theme-muted/15">
                  <div className="p-2.5 rounded-xl bg-theme-bg/60 border border-theme-muted/15 flex items-center gap-2.5">
                    <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-theme-muted uppercase font-mono block">Best WPM</span>
                      <span className="text-sm font-bold text-theme-text font-mono">{user.bestWpm || 0} WPM</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-theme-bg/60 border border-theme-muted/15 flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-theme-muted uppercase font-mono block">Tests Done</span>
                      <span className="text-sm font-bold text-theme-text font-mono">{user.testsCompleted || 0} Tests</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Option */}
              <div className="pt-2 border-t border-theme-muted/15 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-theme-muted/20 text-theme-muted hover:text-theme-text transition-all cursor-pointer font-semibold"
                >
                  Close Window
                </button>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="px-5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* LOGGED OUT VIEW: SIGN IN / SIGN UP */
            <div className="space-y-5">
              
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-theme-bg/80 rounded-2xl border border-theme-muted/15">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setMessage(null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    tab === 'login'
                      ? 'bg-theme-accent text-theme-bg shadow-md'
                      : 'text-theme-muted hover:text-theme-text'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setMessage(null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    tab === 'signup'
                      ? 'bg-theme-accent text-theme-bg shadow-md'
                      : 'text-theme-muted hover:text-theme-text'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>

              {/* Instant Demo Account Button */}
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-emerald-500/40 text-theme-text font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-98"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>One-Click Instant Demo Login</span>
              </button>

              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-theme-muted/20" />
                <span className="text-[10px] text-theme-muted font-mono uppercase">or email authentication</span>
                <div className="flex-1 h-px bg-theme-muted/20" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {tab === 'signup' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-theme-text uppercase font-mono flex items-center gap-1">
                        <User className="w-3 h-3 text-theme-muted" />
                        <span>Display Name</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. SpeedRacer"
                        className="w-full px-3 py-2 rounded-xl bg-theme-bg/80 border border-theme-muted/20 text-theme-text focus:outline-none focus:border-theme-accent text-xs"
                      />
                    </div>

                    {/* Avatar Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-theme-text uppercase font-mono">
                        Choose Avatar Icon
                      </label>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {AVATAR_PRESETS.map((av) => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setSelectedAvatar(av)}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center text-base cursor-pointer shrink-0 transition-all ${
                              selectedAvatar === av
                                ? 'bg-theme-accent/30 border-theme-accent scale-110 shadow-sm'
                                : 'bg-theme-card/40 border-theme-muted/20 hover:border-theme-muted/40'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-theme-text uppercase font-mono flex items-center gap-1">
                    <Mail className="w-3 h-3 text-theme-muted" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="typist@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-theme-bg/80 border border-theme-muted/20 text-theme-text focus:outline-none focus:border-theme-accent text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-theme-text uppercase font-mono flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-theme-muted" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 pr-9 rounded-xl bg-theme-bg/80 border border-theme-muted/20 text-theme-text focus:outline-none focus:border-theme-accent text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-theme-muted hover:text-theme-text cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98 mt-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{tab === 'login' ? 'Sign In to Account' : 'Create Free Account'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
