-- Add welcome popup settings to settings table
ALTER TABLE public.settings 
ADD COLUMN welcome_popup_enabled BOOLEAN DEFAULT false,
ADD COLUMN welcome_popup_image_url TEXT DEFAULT NULL,
ADD COLUMN welcome_popup_link TEXT DEFAULT NULL,
ADD COLUMN welcome_popup_show_once BOOLEAN DEFAULT true;

-- Add position fields for special offers (for drag and drop)
ALTER TABLE public.special_offers 
ADD COLUMN position_x NUMERIC DEFAULT NULL,
ADD COLUMN position_y NUMERIC DEFAULT NULL;