import React from 'react';

interface GiftIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  glowColor?: string;
}

export const GiftIcon: React.FC<GiftIconProps> = ({ 
  className = '', 
  size = 'md',
  animated = true,
  glowColor = '#EC4899'
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      {/* Glow effect behind */}
      <div 
        className={`absolute inset-0 rounded-full blur-xl opacity-50 ${animated ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: glowColor }}
      />
      
      {/* Main Gift SVG */}
      <svg 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 w-full h-full ${animated ? 'animate-gift-float' : ''}`}
        style={{ 
          filter: `drop-shadow(0 0 12px ${glowColor}80)`
        }}
      >
        {/* Box base - gradient */}
        <defs>
          <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899"/>
            <stop offset="50%" stopColor="#F472B6"/>
            <stop offset="100%" stopColor="#BE185D"/>
          </linearGradient>
          <linearGradient id="lidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6"/>
            <stop offset="100%" stopColor="#EC4899"/>
          </linearGradient>
          <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24"/>
            <stop offset="50%" stopColor="#F59E0B"/>
            <stop offset="100%" stopColor="#D97706"/>
          </linearGradient>
          <linearGradient id="bowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D"/>
            <stop offset="100%" stopColor="#F59E0B"/>
          </linearGradient>
        </defs>
        
        {/* Gift box body */}
        <rect 
          x="10" y="28" 
          width="44" height="30" 
          rx="4" 
          fill="url(#boxGradient)"
          stroke="#BE185D"
          strokeWidth="2"
        />
        
        {/* Gift box lid */}
        <rect 
          x="6" y="20" 
          width="52" height="12" 
          rx="3" 
          fill="url(#lidGradient)"
          stroke="#DB2777"
          strokeWidth="2"
        />
        
        {/* Vertical ribbon */}
        <rect 
          x="28" y="20" 
          width="8" height="38" 
          fill="url(#ribbonGradient)"
        />
        
        {/* Ribbon bow - left loop */}
        <ellipse 
          cx="22" cy="16" 
          rx="10" ry="8" 
          fill="url(#bowGradient)"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        
        {/* Ribbon bow - right loop */}
        <ellipse 
          cx="42" cy="16" 
          rx="10" ry="8" 
          fill="url(#bowGradient)"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        
        {/* Bow center knot */}
        <circle 
          cx="32" cy="16" 
          r="5" 
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth="1.5"
        />
        
        {/* Sparkle effects */}
        <circle cx="12" cy="12" r="2" fill="#FCD34D" className={animated ? 'animate-twinkle' : ''} />
        <circle cx="52" cy="10" r="1.5" fill="#FCD34D" className={animated ? 'animate-twinkle' : ''} style={{ animationDelay: '0.3s' }} />
        <circle cx="56" cy="24" r="1.5" fill="#FBBF24" className={animated ? 'animate-twinkle' : ''} style={{ animationDelay: '0.6s' }} />
        <circle cx="8" cy="32" r="1" fill="#FCD34D" className={animated ? 'animate-twinkle' : ''} style={{ animationDelay: '0.9s' }} />
        
        {/* Star sparkles */}
        <path d="M58 14 L59 16 L61 16 L59.5 17.5 L60 20 L58 18.5 L56 20 L56.5 17.5 L55 16 L57 16 Z" fill="#FCD34D" className={animated ? 'animate-twinkle' : ''} style={{ animationDelay: '0.2s' }} />
        <path d="M6 18 L7 20 L9 20 L7.5 21.5 L8 24 L6 22.5 L4 24 L4.5 21.5 L3 20 L5 20 Z" fill="#FBBF24" className={animated ? 'animate-twinkle' : ''} style={{ animationDelay: '0.5s' }} />
      </svg>
    </div>
  );
};

export default GiftIcon;
