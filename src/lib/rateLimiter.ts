import { supabase } from '@/integrations/supabase/client';

const RATE_LIMIT_WINDOW_MINUTES = 30;
const MAX_ORDERS_PER_WINDOW = 5;

interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  waitMinutes?: number;
}

export const checkOrderRateLimit = async (phoneNumber: string): Promise<RateLimitResult> => {
  try {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    // Count recent orders from this phone number
    const { count, error } = await supabase
      .from('order_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('phone_number', phoneNumber)
      .gte('created_at', windowStart);
    
    if (error) {
      console.error('Rate limit check error:', error);
      // Allow on error to not block legitimate orders
      return { allowed: true, remainingAttempts: MAX_ORDERS_PER_WINDOW };
    }
    
    const orderCount = count || 0;
    const remainingAttempts = Math.max(0, MAX_ORDERS_PER_WINDOW - orderCount);
    
    if (orderCount >= MAX_ORDERS_PER_WINDOW) {
      return {
        allowed: false,
        remainingAttempts: 0,
        waitMinutes: RATE_LIMIT_WINDOW_MINUTES
      };
    }
    
    return {
      allowed: true,
      remainingAttempts
    };
  } catch (error) {
    console.error('Rate limit check exception:', error);
    return { allowed: true, remainingAttempts: MAX_ORDERS_PER_WINDOW };
  }
};

export const recordOrderAttempt = async (phoneNumber: string): Promise<void> => {
  try {
    // Get IP address (simplified - in production use a server-side approach)
    const ipAddress = 'client';
    
    await supabase
      .from('order_rate_limits')
      .insert({
        phone_number: phoneNumber,
        ip_address: ipAddress
      });
  } catch (error) {
    console.error('Failed to record order attempt:', error);
  }
};

// Clean old rate limit records (can be called periodically)
export const cleanOldRateLimitRecords = async (): Promise<void> => {
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24 hours ago
    
    await supabase
      .from('order_rate_limits')
      .delete()
      .lt('created_at', cutoffTime);
  } catch (error) {
    console.error('Failed to clean rate limit records:', error);
  }
};
