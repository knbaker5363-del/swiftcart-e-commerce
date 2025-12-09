import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export const useDocumentTitle = (customTitle?: string) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (customTitle) {
      document.title = `${customTitle} - ${settings?.store_name || 'متجري'}`;
    } else if (settings?.store_name) {
      document.title = `${settings.store_name} - تسوق أفضل المنتجات`;
    }
  }, [settings?.store_name, customTitle]);
};
