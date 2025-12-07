-- Allow anyone to read orders by ID (for order tracking via localStorage)
CREATE POLICY "Anyone can view orders by ID" 
ON public.orders 
FOR SELECT 
USING (true);