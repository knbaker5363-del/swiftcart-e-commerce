-- Drop old permissive policies on orders table
DROP POLICY IF EXISTS "Authenticated users can view and manage orders" ON orders;

-- Add secure policies for orders table (admins only)
CREATE POLICY "Admins can view all orders" 
ON orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders" 
ON orders 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders" 
ON orders 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Drop old permissive policies on order_items table
DROP POLICY IF EXISTS "Authenticated users can view and manage order items" ON order_items;

-- Add secure policies for order_items table (admins only)
CREATE POLICY "Admins can view all order items" 
ON order_items 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update order items" 
ON order_items 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete order items" 
ON order_items 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));