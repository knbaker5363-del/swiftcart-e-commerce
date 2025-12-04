import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAdminRequest {
  email: string;
  password: string;
  fullName?: string;
  creationCode: string;
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { attempts: number; lastAttempt: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour block after max attempts

function getRateLimitKey(req: Request): string {
  // Use X-Forwarded-For header or fall back to a generic key
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `rate_limit:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remainingAttempts: number; retryAfterMs?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Clean up old entries
  if (record && now - record.lastAttempt > WINDOW_MS) {
    rateLimitMap.delete(key);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if blocked
  if (record && record.blockedUntil > now) {
    return { 
      allowed: false, 
      remainingAttempts: 0, 
      retryAfterMs: record.blockedUntil - now 
    };
  }

  // Check attempts in window
  if (record && record.attempts >= MAX_ATTEMPTS) {
    // Block the IP
    record.blockedUntil = now + BLOCK_DURATION_MS;
    rateLimitMap.set(key, record);
    return { 
      allowed: false, 
      remainingAttempts: 0, 
      retryAfterMs: BLOCK_DURATION_MS 
    };
  }

  return { 
    allowed: true, 
    remainingAttempts: MAX_ATTEMPTS - (record?.attempts || 0) 
  };
}

function recordAttempt(key: string, success: boolean): void {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { attempts: 0, lastAttempt: now, blockedUntil: 0 };
  
  if (success) {
    // Reset on successful attempt
    rateLimitMap.delete(key);
  } else {
    record.attempts++;
    record.lastAttempt = now;
    rateLimitMap.set(key, record);
  }
}

// Add artificial delay to slow down brute force
async function addDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const rateLimitKey = getRateLimitKey(req);

  try {
    // Check rate limit first
    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      const retryAfterSeconds = Math.ceil((rateCheck.retryAfterMs || BLOCK_DURATION_MS) / 1000);
      console.warn(`Rate limit exceeded for key: ${rateLimitKey}`);
      return new Response(
        JSON.stringify({ 
          error: 'تم تجاوز الحد المسموح من المحاولات. حاول مرة أخرى لاحقاً.',
          retryAfterSeconds 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSeconds)
          } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const adminCreationCode = Deno.env.get('ADMIN_CREATION_CODE');

    if (!supabaseUrl || !supabaseServiceKey || !adminCreationCode) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, password, fullName, creationCode } = await req.json() as CreateAdminRequest;

    console.log('Received admin creation request for email:', email);

    // Add a small delay to slow down automated attacks (500ms)
    await addDelay(500);

    // Verify creation code
    if (creationCode !== adminCreationCode) {
      // Record failed attempt
      recordAttempt(rateLimitKey, false);
      const remaining = checkRateLimit(rateLimitKey).remainingAttempts;
      
      console.warn(`Invalid creation code provided. Remaining attempts: ${remaining}`);
      return new Response(
        JSON.stringify({ 
          error: 'كود الإنشاء غير صحيح',
          remainingAttempts: remaining
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Step 1: Create the user
    console.log('Creating user account...');
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || '',
      },
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return new Response(
        JSON.stringify({ error: createUserError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userData.user) {
      console.error('User creation failed - no user data returned');
      return new Response(
        JSON.stringify({ error: 'فشل إنشاء المستخدم' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log('User created successfully with ID:', userId);

    // Step 2: Ensure profile exists (trigger should create it, but verify)
    console.log('Checking profile...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking profile:', profileError);
    }

    if (!profileData) {
      console.log('Profile not found, creating manually...');
      const { error: insertProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: fullName || '',
        });

      if (insertProfileError) {
        console.error('Error creating profile:', insertProfileError);
      }
    }

    // Step 3: Add admin role
    console.log('Adding admin role...');
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin',
      });

    if (roleError) {
      console.error('Error adding admin role:', roleError);
      // Try to clean up the created user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: 'فشل تعيين صلاحيات المسؤول: ' + roleError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record successful attempt (resets rate limit for this IP)
    recordAttempt(rateLimitKey, true);
    
    console.log('Admin user created successfully:', userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم إنشاء حساب المسؤول بنجاح',
        userId: userId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
