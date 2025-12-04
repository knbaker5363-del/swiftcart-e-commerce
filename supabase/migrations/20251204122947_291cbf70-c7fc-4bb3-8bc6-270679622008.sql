-- Add field for keeping store name black
ALTER TABLE settings ADD COLUMN IF NOT EXISTS store_name_black BOOLEAN DEFAULT false;