import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { getSupabaseClient, reinitializeSupabase, isSupabaseConfigured } from '@/lib/supabase-wrapper';

interface SupabaseContextType {
  supabase: SupabaseClient<Database> | null;
  isConnected: boolean;
  isConfigured: boolean;
  reconnect: (url?: string, anonKey?: string) => void;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(() => getSupabaseClient());
  const [isConfigured, setIsConfigured] = useState(() => isSupabaseConfigured());

  useEffect(() => {
    // Check configuration on mount
    setIsConfigured(isSupabaseConfigured());
    setClient(getSupabaseClient());
  }, []);

  const reconnect = (url?: string, anonKey?: string) => {
    const newClient = reinitializeSupabase(url, anonKey);
    setClient(newClient);
    setIsConfigured(isSupabaseConfigured());
  };

  return (
    <SupabaseContext.Provider value={{ 
      supabase: client, 
      isConnected: !!client,
      isConfigured,
      reconnect 
    }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseContext = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseContext must be used within SupabaseProvider');
  }
  return context;
};
