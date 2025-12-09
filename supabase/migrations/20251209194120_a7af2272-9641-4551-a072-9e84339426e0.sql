-- Create special offers table for banner-style promotions
CREATE TABLE public.special_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  image_url text,
  size text NOT NULL DEFAULT '2x2', -- '2x2', '2x4', '4x4', 'circle'
  price numeric,
  condition_text text, -- e.g., "أي 3 منتجات من القائمة"
  sort_order integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create junction table for offer products
CREATE TABLE public.special_offer_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id uuid NOT NULL REFERENCES public.special_offers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_offer_products ENABLE ROW LEVEL SECURITY;

-- RLS policies for special_offers
CREATE POLICY "Anyone can view active special offers" ON public.special_offers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage special offers" ON public.special_offers
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for special_offer_products
CREATE POLICY "Anyone can view special offer products" ON public.special_offer_products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage special offer products" ON public.special_offer_products
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));