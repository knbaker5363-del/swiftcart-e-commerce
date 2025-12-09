-- Add background_selected_icons column to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS background_selected_icons jsonb DEFAULT '["ShoppingBag", "Heart", "Star"]'::jsonb;