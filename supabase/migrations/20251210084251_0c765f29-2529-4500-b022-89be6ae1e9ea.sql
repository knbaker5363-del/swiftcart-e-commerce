-- Drop existing policy and create more explicit policies
DROP POLICY IF EXISTS "Only admins can access sensitive settings" ON public.sensitive_settings;

-- Create explicit policies for each operation
CREATE POLICY "Admins can view sensitive settings"
  ON public.sensitive_settings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sensitive settings"
  ON public.sensitive_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sensitive settings"
  ON public.sensitive_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sensitive settings"
  ON public.sensitive_settings
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));