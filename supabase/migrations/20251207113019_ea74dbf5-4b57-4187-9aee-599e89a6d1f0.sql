-- Add setting to hide store info box in header
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hide_header_store_info boolean DEFAULT false;