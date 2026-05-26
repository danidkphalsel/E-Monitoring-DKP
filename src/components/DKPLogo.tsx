import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DKPLogo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true, 
  textColor = 'text-slate-800', 
  size = 'md' 
}) => {
  const [loadError, setLoadError] = useState(false);

  const sizeMap = {
    sm: { img: 'w-8 h-10', text: 'text-[10px] leading-3' },
    md: { img: 'w-14 h-16', text: 'text-xs' },
    lg: { img: 'w-20 h-24', text: 'text-sm' }
  };

  const currentSize = sizeMap[size];

  // Official Halmahera Selatan Regency Logo URL (Saruma Emblem)
  const officialLogoUrl = 'https://lh3.googleusercontent.com/d/1rMfQw7qOU_zoyCgna1bJjoYYcUr95-Jl';

  return (
    <div className={`flex items-center gap-2.5 ${className}`} id="dkp-logo-wrapper">
      {/* High-fidelity official logo image or robust SVG fallback */}
      {!loadError ? (
        <img 
          id="dkp-logo-emblem"
          src={officialLogoUrl} 
          alt="Lambang Kabupaten Halmahera Selatan" 
          className={`${currentSize.img} object-contain shrink-0 filter drop-shadow-md select-none`}
          referrerPolicy="no-referrer"
          onError={() => setLoadError(true)}
        />
      ) : (
        <svg 
          id="dkp-logo-emblem-fallback"
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className={`${size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14'} shrink-0 filter drop-shadow-sm`}
        >
          {/* Fallback Shield Logo representation of Halmahera Selatan */}
          <path d="M50 5 L85 20 C85 60, 50 95, 50 95 C 50 95, 15 60, 15 20 Z" fill="#024B94" stroke="#FFFFFF" strokeWidth="2"/>
          <path d="M50 10 L80 23 C80 57, 50 88, 50 88 C 50 88, 20 57, 20 23 Z" fill="#0B3C5D" />
          <circle cx="50" cy="45" r="22" fill="#328CC1" stroke="#FFFFFF" strokeWidth="1"/>
          {/* Yacht / boat */}
          <path d="M38 52 L62 52 L57 58 L43 58 Z" fill="#FFFFFF" />
          <polygon points="50,15 53,22 61,22 55,26 57,33 50,29 43,33 45,26 39,22 47,22" fill="#FBBF24" />
          {/* Saruma Ribbon */}
          <rect x="25" y="68" width="50" height="8" rx="2" fill="#FFFFFF" />
          <text x="50" y="74" fill="#000000" fontSize="5" fontWeight="black" textAnchor="middle">SARUMA</text>
        </svg>
      )}

      {showText && (
        <div className={`flex flex-col font-sans ${textColor}`} id="dkp-logo-text-section">
          <span className="font-bold uppercase tracking-wide text-xs md:text-sm">
            Dinas Kelautan dan Perikanan
          </span>
          <span className="font-semibold text-[11px] md:text-xs text-emerald-600 tracking-wider">
            KABUPATEN HALMAHERA SELATAN
          </span>
          <span className="text-[9px] md:text-[10px] text-slate-500 font-mono tracking-tighter">
            MALUKU UTARA • REPUBLIK INDONESIA
          </span>
        </div>
      )}
    </div>
  );
};
