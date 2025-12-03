import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  RuntimeConfig, 
  getStoredConfig, 
  saveConfig as saveStoredConfig, 
  isStoreConfigured 
} from '@/lib/supabase-runtime';

interface ConfigContextType {
  config: RuntimeConfig | null;
  isConfigured: boolean;
  loading: boolean;
  saveConfig: (config: RuntimeConfig) => void;
  refreshConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshConfig = () => {
    const storedConfig = getStoredConfig();
    setConfig(storedConfig);
    setIsConfigured(isStoreConfigured());
    setLoading(false);
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const handleSaveConfig = (newConfig: RuntimeConfig) => {
    saveStoredConfig(newConfig);
    setConfig(newConfig);
    setIsConfigured(newConfig.isConfigured);
  };

  return (
    <ConfigContext.Provider value={{ 
      config, 
      isConfigured, 
      loading, 
      saveConfig: handleSaveConfig,
      refreshConfig 
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
