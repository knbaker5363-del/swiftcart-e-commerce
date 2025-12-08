-- Add hero banner color column to settings
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS hero_banner_color text DEFAULT '#000000';