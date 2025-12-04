-- Add TikTok column to settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS social_tiktok TEXT DEFAULT NULL;