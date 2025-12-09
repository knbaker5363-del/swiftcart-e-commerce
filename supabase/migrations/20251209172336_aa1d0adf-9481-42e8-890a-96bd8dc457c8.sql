-- Add social media icon style setting
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS social_icon_style text DEFAULT 'rounded';