-- Add header background color and stock visibility settings
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS header_bg_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS show_stock_to_customers boolean DEFAULT true;