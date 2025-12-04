import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

const FaviconManager = () => {
  const { settings } = useSettings();

  useEffect(() => {
    const faviconUrl = (settings as any)?.favicon_url;
    if (faviconUrl) {
      // Update favicon
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [(settings as any)?.favicon_url]);

  return null;
};

export default FaviconManager;
