-- Add show_offer_badges column to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS show_offer_badges boolean DEFAULT true;