-- Add logo and location fields to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS location text DEFAULT 'الرياض، المملكة العربية السعودية';