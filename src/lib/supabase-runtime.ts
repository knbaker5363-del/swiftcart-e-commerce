import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export interface RuntimeConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
}

const CONFIG_KEY = 'store_config';

// Check if environment variables are set (for Lovable Cloud / development)
const hasEnvConfig = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return !!url && !!key && url !== '' && key !== '';
};

export const getStoredConfig = (): RuntimeConfig | null => {
  // FIRST: Check localStorage (user-configured in setup wizard - takes priority!)
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      if (config.isConfigured && config.supabaseUrl && config.supabaseAnonKey) {
        return config;
      }
    }
  } catch (e) {
    console.error('Error reading config from localStorage:', e);
  }
  
  // FALLBACK: Use env variables (Lovable Cloud environment)
  if (hasEnvConfig()) {
    return {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      isConfigured: true,
    };
  }
  
  return null;
};

export const saveConfig = (config: RuntimeConfig): void => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config to localStorage:', e);
  }
};

export const clearConfig = (): void => {
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch (e) {
    console.error('Error clearing config from localStorage:', e);
  }
};

export const isStoreConfigured = (): boolean => {
  // FIRST: Check localStorage (takes priority!)
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      if (config?.isConfigured && config.supabaseUrl && config.supabaseAnonKey) {
        return true;
      }
    }
  } catch (e) {}
  
  // FALLBACK: Check env variables
  if (hasEnvConfig()) {
    return true;
  }
  
  return false;
};

export const createRuntimeSupabaseClient = (url: string, anonKey: string): SupabaseClient<Database> => {
  return createClient<Database>(url, anonKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

export const testSupabaseConnection = async (url: string, anonKey: string): Promise<boolean> => {
  try {
    const client = createRuntimeSupabaseClient(url, anonKey);
    // Try a simple query to test connection
    const { error } = await client.from('settings').select('id').limit(1);
    // If table doesn't exist, that's expected on first setup
    if (error && !error.message.includes('does not exist')) {
      console.error('Connection test error:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Connection test failed:', e);
    return false;
  }
};

// Clear all Supabase-related data from localStorage
export const clearAllSupabaseData = (): void => {
  try {
    const keysToRemove: string[] = [];
    
    // Find all Supabase auth tokens (pattern: sb-*-auth-token)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key);
      }
    }
    
    // Add other store-related keys
    const storeKeys = [
      CONFIG_KEY,
      'store_settings_cache',
      'store_settings',
      'storeSettings',
      'store_categories', 
      'store_products',
      'store_brands',
      'cart',
      'my_orders',
      'favorites_guest',
      'favorites',
      'welcome_popup_shown',
      'visitor_id'
    ];
    
    keysToRemove.push(...storeKeys);
    
    // Remove all identified keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Error removing key ${key}:`, e);
      }
    });
    
    console.log('Cleared all Supabase data from localStorage');
  } catch (e) {
    console.error('Error clearing Supabase data:', e);
  }
};
