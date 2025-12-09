-- Add gift icon style setting
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS gift_icon_style text DEFAULT 'pink-gold';