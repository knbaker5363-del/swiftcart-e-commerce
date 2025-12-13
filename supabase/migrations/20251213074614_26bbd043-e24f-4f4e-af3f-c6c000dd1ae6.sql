-- Step 1: Update handle_new_user trigger to NOT add role automatically
-- The role will be handled in the application code during setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- لا نضيف role هنا - سيتم التعامل معه في Setup.tsx
  RETURN NEW;
END;
$$;

-- Step 2: Add RLS policy to allow first admin creation when no admin exists
-- This solves the chicken-and-egg problem during initial setup
CREATE POLICY "Allow first admin creation when none exists" 
ON public.user_roles
FOR INSERT
WITH CHECK (
  -- السماح بإنشاء أول أدمن فقط عندما لا يوجد أي أدمن
  (NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') AND role = 'admin')
  OR
  -- أو إذا كان المستخدم الحالي أدمن بالفعل
  has_role(auth.uid(), 'admin')
);