-- Create gift_offers table for the gift system
CREATE TABLE public.gift_offers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    minimum_amount NUMERIC NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gift_products junction table (products that can be selected as gifts)
CREATE TABLE public.gift_products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    gift_offer_id UUID NOT NULL REFERENCES public.gift_offers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gift_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_products ENABLE ROW LEVEL SECURITY;

-- RLS policies for gift_offers
CREATE POLICY "Anyone can view active gift offers" 
ON public.gift_offers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage gift offers" 
ON public.gift_offers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for gift_products
CREATE POLICY "Anyone can view gift products" 
ON public.gift_products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage gift products" 
ON public.gift_products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update trigger for gift_offers
CREATE TRIGGER update_gift_offers_updated_at
BEFORE UPDATE ON public.gift_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();