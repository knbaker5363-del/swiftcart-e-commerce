import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export const useDocumentTitle = () => {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.store_name) {
      document.title = `${settings.store_name} - تسوق أفضل المنتجات`;
    }
  }, [settings?.store_name]);
};
