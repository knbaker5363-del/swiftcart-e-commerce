-- Add banner_images column to settings table
ALTER TABLE public.settings 
ADD COLUMN banner_images jsonb DEFAULT '[]'::jsonb;