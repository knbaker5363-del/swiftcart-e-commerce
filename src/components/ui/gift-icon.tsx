import React from 'react';

export type GiftIconStyleType = 'pink-gold' | 'purple-silver' | 'red-green' | 'blue-white' | 'gold-luxury' | 'rainbow';

interface GiftIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  glowColor?: string;
  style?: GiftIconStyleType;
}

const styleConfigs: Record<GiftIconStyleType, {
  boxGradient: string[];
  lidGradient: string[];
  ribbonGradient: string[];
  bowGradient: string[];
  boxStroke: string;
  lidStroke: string;
  ribbonStroke: string;
  sparkleColors: string[];
}> = {
  'pink-gold': {
    boxGradient: ['#EC4899', '#F472B6', '#BE185D'],
    lidGradient: ['#F472B6', '#EC4899'],
    ribbonGradient: ['#FBBF24', '#F59E0B', '#D97706'],
    bowGradient: ['#FCD34D', '#F59E0B'],
    boxStroke: '#BE185D',
    lidStroke: '#DB2777',
    ribbonStroke: '#D97706',
    sparkleColors: ['#FCD34D', '#FBBF24'],
  },
  'purple-silver': {
    boxGradient: ['#8B5CF6', '#A78BFA', '#6D28D9'],
    lidGradient: ['#A78BFA', '#8B5CF6'],
    ribbonGradient: ['#E5E7EB', '#D1D5DB', '#9CA3AF'],
    bowGradient: ['#F3F4F6', '#D1D5DB'],
    boxStroke: '#6D28D9',
    lidStroke: '#7C3AED',
    ribbonStroke: '#9CA3AF',
    sparkleColors: ['#F3F4F6', '#E5E7EB'],
  },
  'red-green': {
    boxGradient: ['#EF4444', '#F87171', '#DC2626'],
    lidGradient: ['#F87171', '#EF4444'],
    ribbonGradient: ['#22C55E', '#16A34A', '#15803D'],
    bowGradient: ['#4ADE80', '#22C55E'],
    boxStroke: '#DC2626',
    lidStroke: '#EF4444',
    ribbonStroke: '#15803D',
    sparkleColors: ['#4ADE80', '#FEF08A'],
  },
  'blue-white': {
    boxGradient: ['#3B82F6', '#60A5FA', '#2563EB'],
    lidGradient: ['#60A5FA', '#3B82F6'],
    ribbonGradient: ['#FFFFFF', '#F1F5F9', '#E2E8F0'],
    bowGradient: ['#FFFFFF', '#F1F5F9'],
    boxStroke: '#2563EB',
    lidStroke: '#3B82F6',
    ribbonStroke: '#CBD5E1',
    sparkleColors: ['#FFFFFF', '#BFDBFE'],
  },
  'gold-luxury': {
    boxGradient: ['#B45309', '#D97706', '#92400E'],
    lidGradient: ['#D97706', '#B45309'],
    ribbonGradient: ['#FDE68A', '#FCD34D', '#FBBF24'],
    bowGradient: ['#FEF3C7', '#FDE68A'],
    boxStroke: '#92400E',
    lidStroke: '#B45309',
    ribbonStroke: '#D97706',
    sparkleColors: ['#FEF3C7', '#FDE68A'],
  },
  'rainbow': {
    boxGradient: ['#F43F5E', '#EC4899', '#D946EF'],
    lidGradient: ['#8B5CF6', '#6366F1'],
    ribbonGradient: ['#22D3EE', '#14B8A6', '#10B981'],
    bowGradient: ['#FBBF24', '#F59E0B'],
    boxStroke: '#BE185D',
    lidStroke: '#7C3AED',
    ribbonStroke: '#0D9488',
    sparkleColors: ['#FDE68A', '#A5F3FC', '#FCA5A5'],
  },
};

export const GiftIcon: React.FC<GiftIconProps> = ({ 
  className = '', 
  size = 'md',
  animated = true,
  glowColor,
  style = 'pink-gold'
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const config = styleConfigs[style];
  const defaultGlowColor = glowColor || config.boxGradient[0];

  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      {/* Glow effect behind */}
      <div 
        className={`absolute inset-0 rounded-full blur-xl opacity-50 ${animated ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: defaultGlowColor }}
      />
      
      {/* Main Gift SVG */}
      <svg 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 w-full h-full ${animated ? 'animate-gift-float' : ''}`}
        style={{ 
          filter: `drop-shadow(0 0 12px ${defaultGlowColor}80)`
        }}
      >
        {/* Gradients */}
        <defs>
          <linearGradient id={`boxGradient-${style}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.boxGradient[0]}/>
            <stop offset="50%" stopColor={config.boxGradient[1]}/>
            <stop offset="100%" stopColor={config.boxGradient[2]}/>
          </linearGradient>
          <linearGradient id={`lidGradient-${style}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.lidGradient[0]}/>
            <stop offset="100%" stopColor={config.lidGradient[1]}/>
          </linearGradient>
          <linearGradient id={`ribbonGradient-${style}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.ribbonGradient[0]}/>
            <stop offset="50%" stopColor={config.ribbonGradient[1]}/>
            <stop offset="100%" stopColor={config.ribbonGradient[2]}/>
          </linearGradient>
          <linearGradient id={`bowGradient-${style}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.bowGradient[0]}/>
            <stop offset="100%" stopColor={config.bowGradient[1]}/>
          </linearGradient>
        </defs>
        
        {/* Gift box body */}
        <rect 
          x="10" y="28" 
          width="44" height="30" 
          rx="4" 
          fill={`url(#boxGradient-${style})`}
          stroke={config.boxStroke}
          strokeWidth="2"
        />
        
        {/* Gift box lid */}
        <rect 
          x="6" y="20" 
          width="52" height="12" 
          rx="3" 
          fill={`url(#lidGradient-${style})`}
          stroke={config.lidStroke}
          strokeWidth="2"
        />
        
        {/* Vertical ribbon */}
        <rect 
          x="28" y="20" 
          width="8" height="38" 
          fill={`url(#ribbonGradient-${style})`}
        />
        
        {/* Ribbon bow - left loop */}
        <ellipse 
          cx="22" cy="16" 
          rx="10" ry="8" 
          fill={`url(#bowGradient-${style})`}
          stroke={config.ribbonStroke}
          strokeWidth="1.5"
        />
        
        {/* Ribbon bow - right loop */}
        <ellipse 
          cx="42" cy="16" 
          rx="10" ry="8" 
          fill={`url(#bowGradient-${style})`}
          stroke={config.ribbonStroke}
          strokeWidth="1.5"
        />
        
        {/* Bow center knot */}
        <circle 
          cx="32" cy="16" 
          r="5" 
          fill={config.ribbonGradient[1]}
          stroke={config.ribbonStroke}
          strokeWidth="1.5"
        />
        
        {/* Sparkle effects */}
        <circle cx="12" cy="12" r="2" fill={config.sparkleColors[0]} className={animated ? 'animate-twinkle' : ''} />
        <circle cx="52" cy="10" r="1.5" fill={config.sparkleColors[0]} className={animated ? 'animate-twinkle' : ''} style={{ animationDelay: '0.3s' }} />
        <circle cx="56" cy="24" r="1.5" fill={config.sparkleColors[1]} className={animated ? 'animate-twinkle' : ''} style={{ animationDelay: '0.6s' }} />
        <circle cx="8" cy="32" r="1" fill={config.sparkleColors[0]} className={animated ? 'animate-twinkle' : ''} style={{ animationDelay: '0.9s' }} />
        
        {/* Star sparkles */}
        <path d="M58 14 L59 16 L61 16 L59.5 17.5 L60 20 L58 18.5 L56 20 L56.5 17.5 L55 16 L57 16 Z" fill={config.sparkleColors[0]} className={animated ? 'animate-twinkle' : ''} style={{ animationDelay: '0.2s' }} />
        <path d="M6 18 L7 20 L9 20 L7.5 21.5 L8 24 L6 22.5 L4 24 L4.5 21.5 L3 20 L5 20 Z" fill={config.sparkleColors[1]} className={animated ? 'animate-twinkle' : ''} style={{ animationDelay: '0.5s' }} />
      </svg>
    </div>
  );
};

// Gift icon style options for admin panel
export const giftIconStyleOptions: { id: GiftIconStyleType; name: string; description: string }[] = [
  { id: 'pink-gold', name: 'وردي وذهبي', description: 'كلاسيكي أنيق' },
  { id: 'purple-silver', name: 'بنفسجي وفضي', description: 'عصري فاخر' },
  { id: 'red-green', name: 'أحمر وأخضر', description: 'احتفالي' },
  { id: 'blue-white', name: 'أزرق وأبيض', description: 'هادئ ونظيف' },
  { id: 'gold-luxury', name: 'ذهبي فاخر', description: 'VIP' },
  { id: 'rainbow', name: 'ألوان متعددة', description: 'مرح ومميز' },
];

export default GiftIcon;
