import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface SEOManagerProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export const SEOManager = ({ title, description, image, type = 'website' }: SEOManagerProps) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    const seoSettings = settings as any;
    
    // Update title
    const pageTitle = title || seoSettings.seo_title || `${settings.store_name} - تسوق أفضل المنتجات`;
    document.title = pageTitle;
    
    // Update meta description
    const pageDescription = description || seoSettings.seo_description || 'اكتشف مجموعة واسعة من المنتجات عالية الجودة بأسعار تنافسية';
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', pageDescription);
    }
    
    // Update keywords
    if (seoSettings.seo_keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', seoSettings.seo_keywords);
      }
    }
    
    // Update OG tags
    const ogImage = image || seoSettings.og_image_url || seoSettings.logo_url || 'https://lovable.dev/opengraph-image-p98pqg.png';
    
    const updateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      }
    };
    
    updateMeta('og:title', pageTitle);
    updateMeta('og:description', pageDescription);
    updateMeta('og:image', ogImage);
    updateMeta('og:type', type);
    
    // Update Twitter tags
    let twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', ogImage);
    }
    
  }, [settings, title, description, image, type]);

  return null;
};

export default SEOManager;
