-- Add setting to control special offers visibility on homepage
ALTER TABLE settings ADD COLUMN IF NOT EXISTS show_home_special_offers boolean DEFAULT true;