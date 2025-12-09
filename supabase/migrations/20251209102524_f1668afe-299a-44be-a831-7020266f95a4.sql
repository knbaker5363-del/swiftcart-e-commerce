-- Add loading_style column to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS loading_style TEXT DEFAULT 'spinner';