import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { getStoredConfig } from '@/lib/supabase-runtime';

let supabaseInstance: SupabaseClient<Database> | null = null;

// Check if environment variables are set (for Lovable Cloud / development)
const hasEnvConfig = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return !!url && !!key && url !== '' && key !== '';
};

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (supabaseInstance) return supabaseInstance;
  
  // Try localStorage FIRST (allows overriding env vars for external hosting)
  const config = getStoredConfig();
  if (config?.supabaseUrl && config?.supabaseAnonKey && config?.isConfigured) {
    supabaseInstance = createClient<Database>(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { 
        storage: localStorage, 
        persistSession: true, 
        autoRefreshToken: true 
      }
    });
    return supabaseInstance;
  }
  
  // Fallback to environment variables (Lovable Cloud)
  if (hasEnvConfig()) {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    supabaseInstance = createClient<Database>(envUrl, envKey, {
      auth: { 
        storage: localStorage, 
        persistSession: true, 
        autoRefreshToken: true 
      }
    });
    return supabaseInstance;
  }
  
  return null; // Not configured yet
};

// Function to reinitialize after setup
export const reinitializeSupabase = (url?: string, anonKey?: string): SupabaseClient<Database> | null => {
  // Clear the existing instance
  supabaseInstance = null;
  
  // Clear any existing auth session from the old instance
  try {
    // Find and remove all Supabase auth tokens
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.includes('auth-token')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.error('Error clearing auth tokens:', e);
  }
  
  // If explicit credentials provided, use them
  if (url && anonKey) {
    supabaseInstance = createClient<Database>(url, anonKey, {
      auth: { 
        storage: localStorage, 
        persistSession: true, 
        autoRefreshToken: true 
      }
    });
    return supabaseInstance;
  }
  
  return getSupabaseClient();
};

// Check if Supabase is configured (localStorage takes priority over env)
export const isSupabaseConfigured = (): boolean => {
  const config = getStoredConfig();
  if (config?.supabaseUrl && config?.supabaseAnonKey && config?.isConfigured) return true;
  if (hasEnvConfig()) return true;
  return false;
};

// Get current Supabase URL (localStorage takes priority)
export const getSupabaseUrl = (): string | null => {
  const config = getStoredConfig();
  if (config?.supabaseUrl && config?.isConfigured) {
    return config.supabaseUrl;
  }
  if (hasEnvConfig()) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  return null;
};
