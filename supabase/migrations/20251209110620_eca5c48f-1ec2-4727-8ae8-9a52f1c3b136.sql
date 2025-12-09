-- Add background_icon_type column to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS background_icon_type text DEFAULT 'shopping';