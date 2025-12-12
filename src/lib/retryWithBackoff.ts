/**
 * Retry utility with exponential backoff
 * Used for network requests that may fail temporarily
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error: any) => {
    // Retry on network errors or 5xx server errors
    if (!error) return false;
    
    const message = error.message?.toLowerCase() || '';
    const status = error.status || error.statusCode;
    
    // Network errors
    if (message.includes('network') || 
        message.includes('fetch') ||
        message.includes('timeout') ||
        message.includes('connection')) {
      return true;
    }
    
    // Server errors (5xx)
    if (status && status >= 500 && status < 600) {
      return true;
    }
    
    // Rate limiting
    if (status === 429) {
      return true;
    }
    
    return false;
  }
};

/**
 * Execute a function with automatic retry and exponential backoff
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === config.maxRetries) {
        break;
      }
      
      // Check if we should retry this error
      if (!config.shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffFactor, attempt),
        config.maxDelay
      );
      
      console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Wrapper for Supabase connection testing with retry
 */
export async function retrySupabaseConnection(
  testFn: () => Promise<boolean>,
  maxRetries: number = 3
): Promise<boolean> {
  return retryWithBackoff(
    async () => {
      const result = await testFn();
      if (!result) {
        throw new Error('Connection test returned false');
      }
      return result;
    },
    {
      maxRetries,
      initialDelay: 1000,
      shouldRetry: () => true // Always retry for connection tests
    }
  );
}
