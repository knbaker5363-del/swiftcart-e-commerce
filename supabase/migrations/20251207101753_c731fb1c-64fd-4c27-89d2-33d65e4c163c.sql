-- Add new appearance customization fields
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS background_style text DEFAULT 'solid',
ADD COLUMN IF NOT EXISTS background_pattern text DEFAULT null,
ADD COLUMN IF NOT EXISTS background_image_url text DEFAULT null,
ADD COLUMN IF NOT EXISTS cart_button_style text DEFAULT 'default',
ADD COLUMN IF NOT EXISTS header_layout text DEFAULT 'logo-right-social-below',
ADD COLUMN IF NOT EXISTS show_image_border boolean DEFAULT true;

-- background_style: 'solid', 'gradient', 'pattern', 'image'
-- background_pattern: 'dots', 'lines', 'bubbles', null
-- cart_button_style: 'default', 'rounded', 'pill', 'square'
-- header_layout: 'logo-right-social-below', 'logo-center-social-below', 'logo-right-social-left'