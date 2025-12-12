-- Add gift_type column to gift_offers table
ALTER TABLE gift_offers 
ADD COLUMN IF NOT EXISTS gift_type TEXT DEFAULT 'choice' 
CHECK (gift_type IN ('choice', 'random'));

-- Add weight column to gift_products table for random selection probability
ALTER TABLE gift_products 
ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 100 CHECK (weight >= 1 AND weight <= 100);

-- Add comment for clarity
COMMENT ON COLUMN gift_offers.gift_type IS 'choice = customer selects, random = weighted random selection';
COMMENT ON COLUMN gift_products.weight IS 'Weight for random selection (1-100), higher = more likely';