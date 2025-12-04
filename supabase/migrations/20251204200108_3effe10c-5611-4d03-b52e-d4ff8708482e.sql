-- Add favicon_url column to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS favicon_url text DEFAULT NULL;