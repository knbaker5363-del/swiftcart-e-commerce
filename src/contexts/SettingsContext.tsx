import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Settings {
  id: string;
  store_name: string;
  theme: string;
  logo_url: string | null;
  location: string | null;
  banner_images: string[];
  animation_effect: string | null;
  accent_color: string | null;
  store_name_black: boolean;
  category_display_style: 'grid' | 'list' | 'icon-list';
  show_brands_button: boolean;
  // New appearance options
  background_style: 'solid' | 'gradient' | 'pattern' | 'image';
  background_pattern: 'dots' | 'lines' | 'bubbles' | null;
  background_image_url: string | null;
  cart_button_style: 'default' | 'rounded' | 'pill' | 'square';
  header_layout: 'logo-right-social-below' | 'logo-center-social-below' | 'logo-right-social-left';
  show_image_border: boolean;
  logo_shape: 'square' | 'circle';
  site_style: 'classic' | 'modern' | 'minimal';
  header_logo_position: 'right' | 'center';
  hide_header_store_info: boolean;
  social_media_position: 'hero' | 'footer';
  // New display settings
  cart_icon_style: string;
  cart_button_text: string;
  font_family: string;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  updateSettings: (storeName: string, theme: string, logoUrl?: string | null, location?: string | null) => Promise<void>;
  applyTheme: (theme: string) => void;
  applyAccentColor: (accentColor: string | null) => void;
  refreshSettings: () => Promise<void>;
}

// Accent color definitions
const accentColors: Record<string, { primary: string; accent: string; ring: string }> = {
  'default': { primary: '', accent: '', ring: '' }, // Use theme defaults
  'blue': { primary: '210 100% 50%', accent: '220 100% 55%', ring: '210 100% 50%' },
  'red': { primary: '0 85% 55%', accent: '350 85% 50%', ring: '0 85% 55%' },
  'green': { primary: '145 80% 42%', accent: '160 80% 45%', ring: '145 80% 42%' },
  'purple': { primary: '270 70% 55%', accent: '280 75% 50%', ring: '270 70% 55%' },
  'orange': { primary: '25 95% 53%', accent: '35 95% 55%', ring: '25 95% 53%' },
  'pink': { primary: '330 85% 60%', accent: '340 85% 55%', ring: '330 85% 60%' },
  'teal': { primary: '175 75% 40%', accent: '185 75% 45%', ring: '175 75% 40%' },
  'yellow': { primary: '45 95% 50%', accent: '50 95% 55%', ring: '45 95% 50%' },
  'indigo': { primary: '245 70% 55%', accent: '255 75% 50%', ring: '245 70% 55%' },
  'rose': { primary: '350 90% 60%', accent: '355 90% 55%', ring: '350 90% 60%' },
  'cyan': { primary: '190 90% 45%', accent: '195 90% 50%', ring: '190 90% 45%' },
  'amber': { primary: '38 92% 50%', accent: '43 96% 56%', ring: '38 92% 50%' },
  'lime': { primary: '84 80% 45%', accent: '78 80% 50%', ring: '84 80% 45%' },
  'emerald': { primary: '158 64% 42%', accent: '160 84% 39%', ring: '158 64% 42%' },
  'black': { primary: '0 0% 15%', accent: '0 0% 25%', ring: '0 0% 15%' },
};

const SETTINGS_CACHE_KEY = 'store_settings_cache';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Get cached settings from localStorage
const getCachedSettings = (): Settings | null => {
  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Error reading cached settings:', e);
  }
  return null;
};

// Save settings to localStorage cache
const cacheSettings = (settings: Settings) => {
  try {
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error caching settings:', e);
  }
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with cached settings to avoid flash of default content
  const [settings, setSettings] = useState<Settings | null>(() => getCachedSettings());
  const [loading, setLoading] = useState(!getCachedSettings()); // Only show loading if no cache
  const { toast } = useToast();

  const applyTheme = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  const applyAccentColor = (accentColor: string | null) => {
    const root = document.documentElement;
    
    if (!accentColor || accentColor === 'default') {
      // Remove custom accent colors, use theme defaults
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--ring');
      return;
    }
    
    const colors = accentColors[accentColor];
    if (colors && colors.primary) {
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--accent', colors.accent);
      root.style.setProperty('--ring', colors.ring);
    }
  };

  const updateDocumentTitle = (storeName: string) => {
    document.title = `${storeName} - تسوق أفضل المنتجات`;
  };

  const applyFontFamily = (fontFamily: string) => {
    const fontMap: Record<string, string> = {
      'tajawal': 'Tajawal, sans-serif',
      'cairo': 'Cairo, sans-serif',
      'almarai': 'Almarai, sans-serif',
      'noto-kufi': '"Noto Kufi Arabic", sans-serif',
      'ibm-plex': '"IBM Plex Sans Arabic", sans-serif',
    };
    document.body.style.fontFamily = fontMap[fontFamily] || fontMap['tajawal'];
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;
      
      const parsedSettings = {
        ...data,
        banner_images: Array.isArray(data.banner_images) ? data.banner_images : [],
        animation_effect: data.animation_effect || null,
        accent_color: data.accent_color || null,
        store_name_black: data.store_name_black || false,
        category_display_style: data.category_display_style || 'grid',
        show_brands_button: data.show_brands_button !== false,
        // New appearance options
        background_style: data.background_style || 'solid',
        background_pattern: data.background_pattern || null,
        background_image_url: data.background_image_url || null,
        cart_button_style: data.cart_button_style || 'default',
        header_layout: data.header_layout || 'logo-right-social-below',
        show_image_border: data.show_image_border !== false,
        logo_shape: data.logo_shape || 'circle',
        site_style: data.site_style || 'classic',
        header_logo_position: data.header_logo_position || 'right',
        hide_header_store_info: data.hide_header_store_info || false,
        social_media_position: data.social_media_position || 'hero',
        // New display settings
        cart_icon_style: data.cart_icon_style || 'cart',
        cart_button_text: data.cart_button_text || 'إضافة للسلة',
        font_family: data.font_family || 'tajawal'
      };
      
      setSettings(parsedSettings as Settings);
      cacheSettings(parsedSettings as Settings); // Cache the settings
      
      // Apply font family to body
      applyFontFamily(parsedSettings.font_family);
      
      if (data?.theme) {
        applyTheme(data.theme);
      }
      if (data?.accent_color) {
        applyAccentColor(data.accent_color);
      }
      if (data?.store_name) {
        updateDocumentTitle(data.store_name);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply cached settings immediately on mount
  useEffect(() => {
    const cached = getCachedSettings();
    if (cached) {
      if (cached.theme) applyTheme(cached.theme);
      if (cached.accent_color) applyAccentColor(cached.accent_color);
      if (cached.store_name) updateDocumentTitle(cached.store_name);
      if (cached.font_family) applyFontFamily(cached.font_family);
    }
    // Always fetch fresh settings from database
    fetchSettings();
  }, []);

  const updateSettings = async (storeName: string, theme: string, logoUrl?: string | null, location?: string | null) => {
    try {
      if (!settings) return;

      const updateData: any = { 
        store_name: storeName, 
        theme 
      };
      
      if (logoUrl !== undefined) {
        updateData.logo_url = logoUrl;
      }
      
      if (location !== undefined) {
        updateData.location = location;
      }

      const { error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ 
        ...settings, 
        store_name: storeName, 
        theme,
        logo_url: logoUrl !== undefined ? logoUrl : settings.logo_url,
        location: location !== undefined ? location : settings.location
      });
      applyTheme(theme);
      updateDocumentTitle(storeName);
      
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث الإعدادات بنجاح',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحديث الإعدادات',
        variant: 'destructive',
      });
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, applyTheme, applyAccentColor, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export { accentColors };
