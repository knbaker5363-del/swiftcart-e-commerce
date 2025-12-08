-- Add product card display settings
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS card_size TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS cards_per_row_mobile INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS cards_per_row_desktop INTEGER DEFAULT 4;