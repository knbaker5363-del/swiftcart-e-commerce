
-- Add store layout settings columns
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS store_layout_style text DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS layout_products_per_category_row integer DEFAULT 6,
ADD COLUMN IF NOT EXISTS layout_category_row_scrollable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS layout_show_category_view_all boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS layout_featured_product_id uuid DEFAULT NULL,
ADD COLUMN IF NOT EXISTS layout_enable_3d_effect boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS layout_3d_effect_type text DEFAULT 'rotate';

-- Add comment for documentation
COMMENT ON COLUMN public.settings.store_layout_style IS 'Store layout: classic, category-rows, premium';
COMMENT ON COLUMN public.settings.layout_3d_effect_type IS '3D effect type: rotate, hover, parallax';
