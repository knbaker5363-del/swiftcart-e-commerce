-- Add logo shape and site style columns
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS logo_shape TEXT DEFAULT 'square',
ADD COLUMN IF NOT EXISTS site_style TEXT DEFAULT 'classic';