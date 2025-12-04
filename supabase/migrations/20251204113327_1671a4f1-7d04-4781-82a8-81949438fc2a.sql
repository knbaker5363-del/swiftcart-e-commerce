-- =============================================
-- FIX ALL RLS POLICIES - ADMIN ONLY MANAGEMENT
-- =============================================

-- ============ PRODUCTS TABLE ============
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

CREATE POLICY "Admins can manage products" 
ON products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- ============ CATEGORIES TABLE ============
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;

CREATE POLICY "Admins can manage categories" 
ON categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- ============ BRANDS TABLE ============
DROP POLICY IF EXISTS "Authenticated users can manage brands" ON brands;

CREATE POLICY "Admins can manage brands" 
ON brands 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- ============ SETTINGS TABLE ============
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON settings;

CREATE POLICY "Admins can manage settings" 
ON settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- ============ PRODUCT_CATEGORIES TABLE ============
DROP POLICY IF EXISTS "Authenticated users can manage product categories" ON product_categories;

CREATE POLICY "Admins can manage product categories" 
ON product_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- ============ STORAGE POLICIES ============
-- Drop old permissive storage policies
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

-- Create admin-only storage policies
CREATE POLICY "Admins can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

-- Keep public read access for product images (customers need to see them)
CREATE POLICY "Anyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');