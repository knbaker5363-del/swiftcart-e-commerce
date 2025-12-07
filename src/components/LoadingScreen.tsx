import { useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

const LoadingScreen = () => {
  const { loading, settings } = useSettings();
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!loading && settings) {
      // Start fade out animation
      setFadeOut(true);
      // Remove from DOM after animation
      const timer = setTimeout(() => {
        setShow(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, settings]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo or Store Name */}
      <div className="mb-8">
        {settings?.logo_url ? (
          <img
            src={settings.logo_url}
            alt="Loading..."
            className="w-24 h-24 object-contain rounded-full animate-pulse"
          />
        ) : (
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center animate-pulse">
            <span className="text-4xl font-bold text-primary-foreground">
              {settings?.store_name?.charAt(0) || 'م'}
            </span>
          </div>
        )}
      </div>

      {/* Loading Spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>

      {/* Loading Text */}
      <p className="mt-6 text-muted-foreground text-sm animate-pulse">
        جاري التحميل...
      </p>
    </div>
  );
};

export default LoadingScreen;
