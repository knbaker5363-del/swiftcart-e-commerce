-- Add new settings for brands slider, deals/offers buttons customization
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS show_brands_slider boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_deals_button boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS deals_button_name text DEFAULT 'كافة الخصومات',
ADD COLUMN IF NOT EXISTS deals_button_icon text DEFAULT 'Percent',
ADD COLUMN IF NOT EXISTS show_offers_button boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS offers_button_name text DEFAULT 'العروض الخاصة بنا',
ADD COLUMN IF NOT EXISTS offers_button_icon text DEFAULT 'Sparkles',
ADD COLUMN IF NOT EXISTS offers_button_link text DEFAULT '/deals';