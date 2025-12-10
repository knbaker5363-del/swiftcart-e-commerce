-- Add setup_locked column to settings table
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS setup_locked BOOLEAN DEFAULT false;