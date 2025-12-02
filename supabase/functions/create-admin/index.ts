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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Verify creation code
    if (creationCode !== adminCreationCode) {
      console.warn('Invalid creation code provided');
      return new Response(
        JSON.stringify({ error: 'كود الإنشاء غير صحيح' }),
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
