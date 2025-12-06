import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate or get visitor ID from localStorage
const getVisitorId = (): string => {
  const key = 'visitor_id';
  let visitorId = localStorage.getItem(key);
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(key, visitorId);
  }
  return visitorId;
};

/**
 * Track page view - call this on page load
 */
export const usePageView = (pagePath: string) => {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const trackView = async () => {
      try {
        const visitorId = getVisitorId();
        await supabase.from('page_views').insert({
          page_path: pagePath,
          visitor_id: visitorId,
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackView();
  }, [pagePath]);
};

/**
 * Track product view - call when user views a product
 */
export const trackProductView = async (productId: string) => {
  try {
    const visitorId = getVisitorId();
    await supabase.from('product_views').insert({
      product_id: productId,
      visitor_id: visitorId,
    });
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
};
