-- Add header logo position column
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS header_logo_position TEXT DEFAULT 'right';