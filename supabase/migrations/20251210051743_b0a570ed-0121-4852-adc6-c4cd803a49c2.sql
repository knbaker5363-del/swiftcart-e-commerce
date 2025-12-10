-- Add setting to control special offers display shape on homepage
ALTER TABLE settings ADD COLUMN IF NOT EXISTS home_offers_shape text DEFAULT 'circles';