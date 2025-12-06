-- Add new settings columns for category display style and brands visibility
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS category_display_style text DEFAULT 'grid',
ADD COLUMN IF NOT EXISTS show_brands_button boolean DEFAULT true;

COMMENT ON COLUMN public.settings.category_display_style IS 'Category display style: grid (images), list (text only), icon-list (icon with name)';
COMMENT ON COLUMN public.settings.show_brands_button IS 'Whether to show the brands button on home page';