import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Settings {
  id: string;
  store_name: string;
  theme: string;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  updateSettings: (storeName: string, theme: string) => Promise<void>;
  applyTheme: (theme: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const applyTheme = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;
      
      setSettings(data);
      if (data?.theme) {
        applyTheme(data.theme);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (storeName: string, theme: string) => {
    try {
      if (!settings) return;

      const { error } = await supabase
        .from('settings')
        .update({ store_name: storeName, theme })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, store_name: storeName, theme });
      applyTheme(theme);
      
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

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, applyTheme }}>
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