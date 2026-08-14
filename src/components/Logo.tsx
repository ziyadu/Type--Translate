import React from 'react';

const logoIconAsset = new URL('../assets/images/type_translate_app_icon_1786134915771.jpg', import.meta.url).href;

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  onClick?: () => void;
}

export default function Logo({
  className = '',
  size = 'md',
  showSubtitle = false,
  onClick,
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-2xl',
    lg: 'text-2xl sm:text-4xl',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
    lg: 'w-10 h-10 sm:w-12 sm:h-12',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
    >
      {/* App Icon Image Badge */}
      <div className={`relative flex items-center justify-center rounded-xl overflow-hidden shadow-md shadow-cyan-500/20 shrink-0 border border-cyan-500/30 ${iconSizes[size]}`}>
        <img 
          src={logoIconAsset || "/app-icon.jpg"} 
          alt="Type & Translate App Icon" 
          className="w-full h-full object-cover rounded-xl"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to public asset if module resolution ever fails
            const target = e.currentTarget;
            if (target.src !== window.location.origin + '/app-icon.jpg') {
              target.src = '/app-icon.jpg';
            }
          }}
        />
      </div>

      <div className="flex flex-col">
        <h1 className={`font-black tracking-tight text-theme-correct flex items-center gap-0.5 ${sizeClasses[size]}`}>
          <span>TYPE & TRANSLATE</span>
          <span className="text-theme-accent">.</span>
        </h1>
        {showSubtitle && (
          <span className="text-[11px] text-theme-muted font-mono tracking-wide">
            Multilingual Speed Typing & Practice Platform
          </span>
        )}
      </div>
    </div>
  );
}
