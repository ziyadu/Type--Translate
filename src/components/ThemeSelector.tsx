import { useEffect, useState } from 'react';
import { Paintbrush, Check } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  bg: string;
  card: string;
  accent: string;
  text: string;
}

const THEMES: Theme[] = [
  { id: 'typewell', name: 'Typewell (Default)', bg: '#070913', card: '#0f1322', accent: '#38bdf8', text: '#e2e8f0' },
  { id: 'monochrome-dark', name: 'Black & White (Dark)', bg: '#000000', card: '#121212', accent: '#ffffff', text: '#ffffff' },
  { id: 'monochrome-light', name: 'Black & White (Light)', bg: '#ffffff', card: '#f4f4f5', accent: '#000000', text: '#000000' },
  { id: 'carbon', name: 'Carbon (Dark)', bg: '#0e0e11', card: '#18181b', accent: '#eab308', text: '#e4e4e7' },
  { id: 'nord', name: 'Nordic Frost', bg: '#2e3440', card: '#3b4252', accent: '#88c0d0', text: '#d8dee9' },
  { id: 'sakura', name: 'Sakura Petal', bg: '#fff1f2', card: '#ffe4e6', accent: '#db2777', text: '#4c0519' },
  { id: 'retro', name: 'Retro Amber', bg: '#0c0a09', card: '#1c1917', accent: '#d97706', text: '#f59e0b' },
  { id: 'serene', name: 'Serene Minimal', bg: '#fcfbf7', card: '#f3f0e8', accent: '#16a34a', text: '#1c1917' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', bg: '#13001c', card: '#240033', accent: '#00f0ff', text: '#e2f013' }
];

export default function ThemeSelector({ inline = false }: { inline?: boolean }) {
  const [currentTheme, setCurrentTheme] = useState<string>('typewell');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('typing-theme') || 'typewell';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem('typing-theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  if (inline) {
    return (
      <div id="theme-selector-container" className="space-y-2 w-full">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] uppercase font-bold text-theme-accent tracking-wider font-mono flex items-center gap-1.5">
            <Paintbrush className="w-3.5 h-3.5 text-theme-accent" />
            <span>Theme & Color Scheme</span>
          </span>
          <span className="text-[10px] font-mono text-theme-accent font-bold bg-theme-accent/10 px-2 py-0.5 rounded-full border border-theme-accent/20 truncate max-w-[120px] shrink-0">
            {activeThemeObj.name}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {THEMES.map((theme) => {
            const isActive = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                id={isActive ? 'theme-toggle-button' : `theme-btn-${theme.id}`}
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-theme-accent/20 border border-theme-accent/40 text-theme-accent font-bold shadow-xs'
                    : 'bg-theme-card/50 hover:bg-theme-card text-theme-muted hover:text-theme-text border border-theme-muted/15'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-4 w-9 overflow-hidden rounded-md border border-theme-muted/30 shrink-0 shadow-xs">
                    <span className="w-1/3" style={{ backgroundColor: theme.bg }} />
                    <span className="w-1/3" style={{ backgroundColor: theme.card }} />
                    <span className="w-1/3" style={{ backgroundColor: theme.accent }} />
                  </div>
                  <span className="font-sans text-[11px]">{theme.name}</span>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 text-theme-accent shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" id="theme-selector-container">
      <button
        id="theme-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-muted/30 bg-theme-card/60 hover:bg-theme-card hover:border-theme-accent/50 text-theme-text/80 hover:text-theme-text transition-all text-sm font-medium"
        title="Change UI Theme"
      >
        <Paintbrush className="w-4 h-4 text-theme-accent" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="theme-dropdown-menu"
            className="absolute right-0 mt-2 w-56 rounded-xl border border-theme-muted/30 bg-theme-card p-2 shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="px-2 py-1.5 text-xs font-semibold text-theme-muted tracking-wider uppercase">
              Select Color Palette
            </div>
            <div className="h-px bg-theme-muted/20 my-1" />
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {THEMES.map((theme) => {
                const isActive = currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    id={`theme-btn-${theme.id}`}
                    onClick={() => {
                      handleThemeChange(theme.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${
                      isActive
                        ? 'bg-theme-muted/20 text-theme-correct font-semibold'
                        : 'text-theme-text/80 hover:bg-theme-muted/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Theme colors indicators */}
                      <div className="flex h-4 w-10 overflow-hidden rounded border border-theme-muted/20">
                        <span className="w-1/3" style={{ backgroundColor: theme.bg }} />
                        <span className="w-1/3" style={{ backgroundColor: theme.card }} />
                        <span className="w-1/3" style={{ backgroundColor: theme.accent }} />
                      </div>
                      <span className="font-sans">{theme.name}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-theme-accent" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
