-- Drop the restrictive policy
DROP POLICY IF EXISTS "Allow first admin creation when none exists" ON public.user_roles;

-- Create a more flexible policy that allows:
-- 1. First admin when none exists
-- 2. Existing admins to add roles
-- 3. User adding admin role to themselves during setup
CREATE POLICY "Allow admin creation during setup" ON public.user_roles
FOR INSERT
WITH CHECK (
  (role = 'admin' AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'))
  OR has_role(auth.uid(), 'admin')
  OR (auth.uid() = user_id AND role = 'admin')
);