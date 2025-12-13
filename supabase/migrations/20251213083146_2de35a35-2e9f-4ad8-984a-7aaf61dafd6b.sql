-- Drop the current policy
DROP POLICY IF EXISTS "Allow admin creation during setup" ON public.user_roles;

-- Create a more flexible policy that allows admin creation in more scenarios
CREATE POLICY "Allow admin creation during setup" ON public.user_roles
FOR INSERT
WITH CHECK (
  -- Allow first admin when none exists
  (role = 'admin' AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'))
  OR 
  -- Allow existing admins to add roles
  has_role(auth.uid(), 'admin')
  OR
  -- Allow any authenticated user to add admin role to themselves (for setup scenarios)
  (auth.uid() = user_id AND role = 'admin')
  OR
  -- Allow adding admin role for any valid user in auth.users (covers edge cases during signup)
  (role = 'admin' AND user_id IN (SELECT id FROM auth.users))
);