-- Add show_on_homepage field to special_offers table
ALTER TABLE public.special_offers ADD COLUMN IF NOT EXISTS show_on_homepage boolean DEFAULT false;