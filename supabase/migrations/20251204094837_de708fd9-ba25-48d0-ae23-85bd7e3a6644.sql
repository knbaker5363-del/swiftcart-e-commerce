-- Add social media columns to settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS social_whatsapp TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS social_instagram TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS social_facebook TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS social_snapchat TEXT DEFAULT NULL;