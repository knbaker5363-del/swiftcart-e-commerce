-- إضافة عمود للصور الإضافية في جدول المنتجات
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS additional_images jsonb DEFAULT '[]'::jsonb;

-- تعليق توضيحي
COMMENT ON COLUMN products.additional_images IS 'مصفوفة من روابط الصور الإضافية للمنتج بصيغة JSON';