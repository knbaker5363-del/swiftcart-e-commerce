-- Add header customization fields
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS show_header_logo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS store_name_image_url text;