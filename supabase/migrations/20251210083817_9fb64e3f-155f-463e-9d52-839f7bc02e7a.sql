-- 1. Fix PUBLIC_DATA_EXPOSURE: Remove the policy that exposes customer data
DROP POLICY IF EXISTS "Anyone can view orders by ID" ON public.orders;

-- 2. Fix SECRETS_EXPOSED: Create a separate protected table for sensitive settings
CREATE TABLE IF NOT EXISTS public.sensitive_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_bot_token text,
  telegram_chat_id text,
  telegram_bot_password text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on sensitive_settings
ALTER TABLE public.sensitive_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access sensitive settings
CREATE POLICY "Only admins can access sensitive settings"
  ON public.sensitive_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Migrate existing data from settings to sensitive_settings
INSERT INTO public.sensitive_settings (telegram_bot_token, telegram_chat_id, telegram_bot_password)
SELECT telegram_bot_token, telegram_chat_id, telegram_bot_password
FROM public.settings
LIMIT 1
ON CONFLICT DO NOTHING;

-- Remove sensitive columns from settings table
ALTER TABLE public.settings DROP COLUMN IF EXISTS telegram_bot_token;
ALTER TABLE public.settings DROP COLUMN IF EXISTS telegram_chat_id;
ALTER TABLE public.settings DROP COLUMN IF EXISTS telegram_bot_password;

-- 3. Fix INPUT_VALIDATION: Create trigger to validate order item prices
CREATE OR REPLACE FUNCTION public.validate_order_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actual_price numeric;
  discount_pct numeric;
  final_price numeric;
BEGIN
  -- Get the actual product price and discount
  SELECT price, COALESCE(discount_percentage, 0) INTO actual_price, discount_pct
  FROM products WHERE id = NEW.product_id;
  
  IF actual_price IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  -- Calculate final price with discount
  final_price := actual_price * (1 - discount_pct / 100);
  
  -- Override the price_at_purchase with actual calculated price
  NEW.price_at_purchase := final_price;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order_items
DROP TRIGGER IF EXISTS ensure_correct_price ON public.order_items;
CREATE TRIGGER ensure_correct_price
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_item_price();