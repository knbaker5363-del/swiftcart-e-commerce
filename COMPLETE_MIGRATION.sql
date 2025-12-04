-- =============================================
-- دليل إعداد قاعدة البيانات الكامل
-- للمتجر الإلكتروني - إصدار موحد
-- تاريخ التحديث: 2024-12-04
-- =============================================
-- 
-- تعليمات الاستخدام:
-- 1. أنشئ مشروع Supabase جديد
-- 2. اذهب إلى SQL Editor
-- 3. انسخ هذا الملف بالكامل والصقه
-- 4. اضغط Run
-- 5. أنشئ Secret باسم ADMIN_CREATION_CODE في Vault
-- =============================================

-- تفعيل الإضافات المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- الجزء 1: أنواع البيانات (ENUMS)
-- =============================================

-- نوع أدوار المستخدمين
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- الجزء 2: الدوال (FUNCTIONS)
-- =============================================

-- دالة تحديث وقت التعديل
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- دالة التحقق من دور المستخدم
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- دالة إنشاء ملف شخصي للمستخدم الجديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- تعيين دور المستخدم العادي
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- =============================================
-- الجزء 3: الجداول الأساسية
-- =============================================

-- جدول الفئات
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- جدول العلامات التجارية
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- جدول المنتجات
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  additional_images JSONB DEFAULT '[]'::jsonb,
  options JSONB DEFAULT '{}'::jsonb,
  discount_percentage NUMERIC DEFAULT 0,
  discount_end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- جدول ربط المنتجات بالفئات (علاقة متعددة)
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(product_id, category_id)
);

-- جدول الملفات الشخصية
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- جدول أدوار المستخدمين
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, role)
);

-- جدول الطلبات
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'Pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- جدول عناصر الطلب
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  selected_options JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- جدول المفضلة
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- جدول الإعدادات (شامل لكل الميزات)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- معلومات المتجر الأساسية
  store_name TEXT NOT NULL DEFAULT 'متجري',
  logo_url TEXT,
  favicon_url TEXT,
  location TEXT DEFAULT 'فلسطين',
  store_phone TEXT,
  -- المظهر والتصميم
  theme TEXT NOT NULL DEFAULT 'default',
  accent_color TEXT DEFAULT 'primary',
  text_style TEXT DEFAULT 'default',
  store_name_black BOOLEAN DEFAULT false,
  animation_effect TEXT,
  -- صور البانر
  banner_images JSONB DEFAULT '[]'::jsonb,
  -- إعدادات الواتساب
  whatsapp_country_code TEXT DEFAULT '972',
  whatsapp_number TEXT,
  -- روابط السوشيال ميديا
  social_whatsapp TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  social_snapchat TEXT,
  social_tiktok TEXT,
  -- أسعار التوصيل
  delivery_west_bank NUMERIC DEFAULT 20,
  delivery_jerusalem NUMERIC DEFAULT 50,
  delivery_inside NUMERIC DEFAULT 70,
  -- التواريخ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- الجزء 4: Triggers
-- =============================================

-- Trigger للمستخدمين الجدد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger لتحديث وقت التعديل في الإعدادات
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger لتحديث وقت التعديل في الملفات الشخصية
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger لتحديث وقت التعديل في البراندات
DROP TRIGGER IF EXISTS update_brands_updated_at ON public.brands;
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- الجزء 5: الفهارس (INDEXES)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_discount ON public.products(discount_percentage) WHERE discount_percentage > 0;
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_product ON public.product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON public.product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON public.favorites(product_id);

-- =============================================
-- الجزء 6: تفعيل Row Level Security
-- =============================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- الجزء 7: سياسات RLS (الأمان)
-- =============================================

-- === الفئات ===
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === العلامات التجارية ===
DROP POLICY IF EXISTS "Anyone can view brands" ON public.brands;
DROP POLICY IF EXISTS "Admins can manage brands" ON public.brands;
CREATE POLICY "Anyone can view brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admins can manage brands" ON public.brands FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === المنتجات ===
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === ربط المنتجات بالفئات ===
DROP POLICY IF EXISTS "Anyone can view product categories" ON public.product_categories;
DROP POLICY IF EXISTS "Admins can manage product categories" ON public.product_categories;
CREATE POLICY "Anyone can view product categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage product categories" ON public.product_categories FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === الملفات الشخصية ===
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- === أدوار المستخدمين ===
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === الطلبات ===
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- === عناصر الطلب ===
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update order items" ON public.order_items FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete order items" ON public.order_items FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- === المفضلة ===
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add to their favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete from their favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from their favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- === الإعدادات ===
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- الجزء 8: Storage (تخزين الصور)
-- =============================================

-- إنشاء Bucket للصور
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات Storage
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

CREATE POLICY "Anyone can view product images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images" ON storage.objects 
  FOR DELETE USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

-- =============================================
-- الجزء 9: البيانات الافتراضية
-- =============================================

-- إدراج إعدادات افتراضية (إذا لم تكن موجودة)
INSERT INTO public.settings (store_name, location, theme)
SELECT 'متجري', 'فلسطين', 'default'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- =============================================
-- انتهى الإعداد بنجاح! ✅
-- =============================================
-- 
-- الخطوات التالية:
-- 1. اذهب إلى Settings → Vault → Secrets
-- 2. أضف Secret جديد باسم: ADMIN_CREATION_CODE
-- 3. ضع قيمة سرية قوية (مثل: MyStore2024Secret!)
-- 4. انشر الكود على Vercel
-- 5. افتح /admin/login وأنشئ حساب المدير
-- =============================================
