import { useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loading-styles';

const LoadingScreen = () => {
  const { loading, settings } = useSettings();
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [dataPreloaded, setDataPreloaded] = useState(false);

  // Minimum loading time of 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Preload all critical data
  useEffect(() => {
    const preloadData = async () => {
      try {
        // Preload categories, products, and brands in parallel
        const [categoriesRes, productsRes, brandsRes] = await Promise.all([
          supabase.from('categories').select('*').order('sort_order', { ascending: true }),
          supabase.from('products').select('*, categories(name)').eq('is_active', true).limit(50),
          supabase.from('brands').select('*').order('name', { ascending: true })
        ]);

        // Cache data in localStorage for faster subsequent loads
        if (categoriesRes.data) {
          localStorage.setItem('cached_categories', JSON.stringify(categoriesRes.data));
        }
        if (productsRes.data) {
          localStorage.setItem('cached_products', JSON.stringify(productsRes.data));
        }
        if (brandsRes.data) {
          localStorage.setItem('cached_brands', JSON.stringify(brandsRes.data));
        }

        setDataPreloaded(true);
      } catch (error) {
        console.error('Error preloading data:', error);
        setDataPreloaded(true); // Continue anyway
      }
    };

    preloadData();
  }, []);

  // Hide loading screen when all conditions are met
  useEffect(() => {
    if (!loading && settings && minTimeElapsed && dataPreloaded) {
      // Start fade out animation
      setFadeOut(true);
      // Remove from DOM after animation
      const timer = setTimeout(() => {
        setShow(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, settings, minTimeElapsed, dataPreloaded]);

  if (!show) return null;

  const storeNameImageUrl = (settings as any)?.store_name_image_url;
  const loadingStyle = (settings as any)?.loading_style || 'spinner';
  const loadingShowLogo = (settings as any)?.loading_show_logo !== false;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo or Store Name - Only show if loadingShowLogo is true */}
      {loadingShowLogo && (
        <>
          <div className="mb-8 animate-pulse">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Loading..."
                className="w-28 h-28 object-contain rounded-full shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="text-5xl font-bold text-primary-foreground">
                  {settings?.store_name?.charAt(0) || 'م'}
                </span>
              </div>
            )}
          </div>

          {/* Store Name Image or Text */}
          {storeNameImageUrl ? (
            <img 
              src={storeNameImageUrl} 
              alt={settings?.store_name || 'المتجر'} 
              className="max-h-12 object-contain mb-6 animate-fade-in"
            />
          ) : settings?.store_name && (
            <h1 className="text-2xl font-bold text-foreground mb-6 animate-fade-in">
              {settings.store_name}
            </h1>
          )}
        </>
      )}

      {/* Loading Animation - Based on selected style */}
      <Loader style={loadingStyle} />

      {/* Loading Text */}
      <p className="mt-6 text-muted-foreground text-sm">
        جاري تحميل المتجر...
      </p>
    </div>
  );
};

export default LoadingScreen;
