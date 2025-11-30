-- إنشاء جدول المفضلة
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- تفعيل Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين بقراءة مفضلاتهم الخاصة
CREATE POLICY "Users can view their own favorites"
ON public.favorites
FOR SELECT
USING (auth.uid() = user_id);

-- السماح للمستخدمين بإضافة إلى مفضلاتهم
CREATE POLICY "Users can add to their favorites"
ON public.favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدمين بحذف من مفضلاتهم
CREATE POLICY "Users can delete from their favorites"
ON public.favorites
FOR DELETE
USING (auth.uid() = user_id);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_product_id_idx ON public.favorites(product_id);

-- تعليق توضيحي
COMMENT ON TABLE public.favorites IS 'جدول لحفظ المنتجات المفضلة للمستخدمين';