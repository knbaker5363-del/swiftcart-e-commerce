import { useSettings } from '@/contexts/SettingsContext';

const BackgroundPattern = () => {
  const { settings } = useSettings();
  
  const backgroundStyle = (settings as any)?.background_style || 'solid';
  const backgroundPattern = (settings as any)?.background_pattern || null;
  const backgroundImageUrl = (settings as any)?.background_image_url || null;

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
          <div 
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 30px)',
            }}
          />
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