-- Add delivery pricing settings
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS delivery_west_bank numeric DEFAULT 20,
ADD COLUMN IF NOT EXISTS delivery_jerusalem numeric DEFAULT 50,
ADD COLUMN IF NOT EXISTS delivery_inside numeric DEFAULT 70;