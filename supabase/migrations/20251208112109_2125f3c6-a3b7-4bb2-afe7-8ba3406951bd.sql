-- Add SEO settings columns
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT,
ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Add stock management to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS track_stock BOOLEAN DEFAULT false;

-- Create rate limiting table for orders
CREATE TABLE IF NOT EXISTS public.order_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_rate_limits ENABLE ROW LEVEL SECURITY;

-- Anyone can insert rate limit records
CREATE POLICY "Anyone can insert rate limits" 
ON public.order_rate_limits 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view/delete rate limits
CREATE POLICY "Admins can manage rate limits" 
ON public.order_rate_limits 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_rate_limits_lookup 
ON public.order_rate_limits (phone_number, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_rate_limits_ip 
ON public.order_rate_limits (ip_address, created_at DESC);