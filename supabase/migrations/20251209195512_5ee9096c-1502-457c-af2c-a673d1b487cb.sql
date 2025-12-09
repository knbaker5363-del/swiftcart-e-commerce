-- Add new columns to special_offers table for bundle offers
ALTER TABLE public.special_offers 
ADD COLUMN IF NOT EXISTS offer_type text DEFAULT 'bundle',
ADD COLUMN IF NOT EXISTS required_quantity integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS bundle_price numeric,
ADD COLUMN IF NOT EXISTS background_color text DEFAULT '#7c3aed',
ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#ffffff';