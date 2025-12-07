-- Add setting for social media position
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS social_media_position text DEFAULT 'hero';