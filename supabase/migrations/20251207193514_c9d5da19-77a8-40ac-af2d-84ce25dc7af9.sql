-- Add new settings columns for cart button, font family, and categories slider
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS cart_icon_style text DEFAULT 'cart',
ADD COLUMN IF NOT EXISTS cart_button_text text DEFAULT 'إضافة للسلة',
ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'tajawal';

-- Update existing rows with defaults
UPDATE public.settings 
SET 
  cart_icon_style = COALESCE(cart_icon_style, 'cart'),
  cart_button_text = COALESCE(cart_button_text, 'إضافة للسلة'),
  font_family = COALESCE(font_family, 'tajawal')
WHERE cart_icon_style IS NULL OR cart_button_text IS NULL OR font_family IS NULL;