-- Add category row card background settings
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS category_row_bg_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS category_row_transparent boolean DEFAULT true;