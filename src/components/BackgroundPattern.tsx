import { useSettings } from '@/contexts/SettingsContext';
import { useMemo } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  Gift, 
  Sparkles, 
  Crown, 
  Gem, 
  Package,
  ShoppingCart,
  Percent,
  Tag,
  Zap
} from 'lucide-react';

const ICONS = [ShoppingBag, Heart, Star, Gift, Sparkles, Crown, Gem, Package, ShoppingCart, Percent, Tag, Zap];

const BackgroundPattern = () => {
  const { settings } = useSettings();
  
  const backgroundStyle = (settings as any)?.background_style || 'solid';
  const backgroundPattern = (settings as any)?.background_pattern || null;
  const backgroundImageUrl = (settings as any)?.background_image_url || null;

  // Generate random icons positions (memoized to prevent re-rendering)
  const randomIcons = useMemo(() => {
    return [...Array(30)].map((_, i) => ({
      Icon: ICONS[Math.floor(Math.random() * ICONS.length)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 16 + Math.random() * 24,
      rotation: Math.random() * 360,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
    }));
  }, []);

  // Don't render anything for solid background
  if (backgroundStyle === 'solid') return null;

  // Pattern styles
  if (backgroundStyle === 'pattern' && backgroundPattern) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {backgroundPattern === 'dots' && (
          <div 
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        )}
        {backgroundPattern === 'lines' && (
          <div className="absolute inset-0">
            {randomIcons.map((item, i) => {
              const IconComponent = item.Icon;
              return (
                <div
                  key={i}
                  className="absolute text-primary/[0.06] animate-pulse"
                  style={{
                    left: `${item.left}%`,
                    top: `${item.top}%`,
                    transform: `rotate(${item.rotation}deg)`,
                    animationDelay: `${item.delay}s`,
                    animationDuration: `${item.duration}s`,
                  }}
                >
                  <IconComponent size={item.size} strokeWidth={1.5} />
                </div>
              );
            })}
          </div>
        )}
        {backgroundPattern === 'bubbles' && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-primary/5 animate-pulse"
                style={{
                  width: `${30 + Math.random() * 60}px`,
                  height: `${30 + Math.random() * 60}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Background image
  if (backgroundStyle === 'image' && backgroundImageUrl) {
    return (
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
        }}
      />
    );
  }

  return null;
};

export default BackgroundPattern;