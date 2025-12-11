// Re-export supabase client from wrapper to support both Lovable Cloud and self-hosted
import { getSupabaseClient, reinitializeSupabase, isSupabaseConfigured, getSupabaseUrl } from '@/lib/supabase-wrapper';
import type { Database } from './types';
import { SupabaseClient } from '@supabase/supabase-js';

// Get the supabase client - will be null if not configured
const client = getSupabaseClient();

// Export supabase client
// Note: This may be null on first load in self-hosted mode before setup is complete
export const supabase = client as SupabaseClient<Database>;

// Re-export helper functions for components that need them
export { getSupabaseClient, reinitializeSupabase, isSupabaseConfigured, getSupabaseUrl };
