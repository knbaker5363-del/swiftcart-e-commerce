-- Add discount fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_end_date timestamp with time zone;

-- Create index for faster queries on discounted products
CREATE INDEX IF NOT EXISTS idx_products_discount ON public.products(discount_percentage) WHERE discount_percentage > 0;