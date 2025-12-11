-- =============================================
-- دليل إعداد قاعدة البيانات الكامل
-- للمتجر الإلكتروني - إصدار موحد ومحدث
-- تاريخ التحديث: 2024-12-11
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

DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- الجزء 2: الجداول الأساسية
-- =============================================

-- جدول الفئات
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT,
  icon_name TEXT,
  bg_color TEXT,
  sort_order INTEGER DEFAULT 0,
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
  stock_quantity INTEGER,
  track_stock BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- جدول ربط المنتجات بالفئات
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

-- جدول حدود الطلبات (Rate Limiting)
CREATE TABLE IF NOT EXISTS public.order_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- الجزء 3: جداول العروض الخاصة
-- =============================================

-- جدول العروض الخاصة
CREATE TABLE IF NOT EXISTS public.special_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  size TEXT NOT NULL DEFAULT '2x2',
  price NUMERIC,
  bundle_price NUMERIC,
  condition_text TEXT,
  offer_type TEXT DEFAULT 'bundle',
  required_quantity INTEGER DEFAULT 3,
  background_color TEXT DEFAULT '#7c3aed',
  text_color TEXT DEFAULT '#ffffff',
  sort_order INTEGER DEFAULT 0,
  position_x NUMERIC,
  position_y NUMERIC,
  show_on_homepage BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- جدول منتجات العروض الخاصة
CREATE TABLE IF NOT EXISTS public.special_offer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.special_offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(offer_id, product_id)
);

-- =============================================
-- الجزء 4: جداول الهدايا
-- =============================================

-- جدول عروض الهدايا
CREATE TABLE IF NOT EXISTS public.gift_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  minimum_amount NUMERIC NOT NULL DEFAULT 100,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- جدول منتجات الهدايا
CREATE TABLE IF NOT EXISTS public.gift_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_offer_id UUID NOT NULL REFERENCES public.gift_offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(gift_offer_id, product_id)
);

-- =============================================
-- الجزء 5: جداول أكواد الخصم
-- =============================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- الجزء 6: جداول التحليلات
-- =============================================

-- جدول مشاهدات الصفحات
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- جدول مشاهدات المنتجات
CREATE TABLE IF NOT EXISTS public.product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- الجزء 7: جداول الإشعارات
-- =============================================

-- جدول الإشعارات المرسلة
CREATE TABLE IF NOT EXISTS public.push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_by UUID,
  recipients_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- جدول رموز الأجهزة
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- الجزء 8: الإعدادات الحساسة (Telegram)
-- =============================================

CREATE TABLE IF NOT EXISTS public.sensitive_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,
  telegram_bot_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- الجزء 9: جدول الإعدادات الكامل
-- =============================================

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- معلومات المتجر الأساسية
  store_name TEXT NOT NULL DEFAULT 'متجري',
  logo_url TEXT,
  store_name_image_url TEXT,
  favicon_url TEXT,
  location TEXT DEFAULT 'فلسطين',
  store_phone TEXT,
  
  -- المظهر والألوان
  theme TEXT NOT NULL DEFAULT 'default',
  accent_color TEXT DEFAULT 'primary',
  text_style TEXT DEFAULT 'default',
  font_family TEXT DEFAULT 'tajawal',
  site_style TEXT DEFAULT 'classic',
  store_name_black BOOLEAN DEFAULT false,
  
  -- الهيدر
  header_layout TEXT DEFAULT 'logo-right-social-below',
  header_bg_color TEXT DEFAULT '#ffffff',
  header_logo_position TEXT DEFAULT 'right',
  logo_shape TEXT DEFAULT 'square',
  show_header_logo BOOLEAN DEFAULT true,
  show_header_store_name BOOLEAN DEFAULT true,
  hide_header_store_info BOOLEAN DEFAULT false,
  
  -- بانر الإعلانات
  announcement_enabled BOOLEAN DEFAULT true,
  announcement_messages JSONB DEFAULT '[{"icon": "truck", "text": "توصيل مجاني للطلبات فوق 200₪"}, {"icon": "gift", "text": "اشتري بقيمة 100₪ واحصل على هدية مجانية!"}, {"icon": "sparkles", "text": "عروض حصرية يومياً - تابعنا!"}]'::jsonb,
  announcement_bg_color TEXT DEFAULT 'primary',
  
  -- بانر الهيرو
  banner_images JSONB DEFAULT '[]'::jsonb,
  hero_banner_color TEXT DEFAULT '#000000',
  
  -- التصنيفات
  category_display_style TEXT DEFAULT 'grid',
  category_row_bg_color TEXT DEFAULT '#ffffff',
  category_row_transparent BOOLEAN DEFAULT true,
  
  -- البطاقات والعرض
  card_size TEXT DEFAULT 'medium',
  cards_per_row_mobile INTEGER DEFAULT 2,
  cards_per_row_desktop INTEGER DEFAULT 4,
  show_image_border BOOLEAN DEFAULT true,
  
  -- الأزرار
  cart_button_style TEXT DEFAULT 'default',
  cart_button_text TEXT DEFAULT 'إضافة للسلة',
  cart_icon_style TEXT DEFAULT 'cart',
  back_button_text TEXT DEFAULT 'رجوع',
  
  -- أزرار التنقل
  show_brands_button BOOLEAN DEFAULT true,
  show_brands_slider BOOLEAN DEFAULT false,
  show_deals_button BOOLEAN DEFAULT true,
  deals_button_name TEXT DEFAULT 'كافة الخصومات',
  deals_button_icon TEXT DEFAULT 'Percent',
  show_offers_button BOOLEAN DEFAULT true,
  offers_button_name TEXT DEFAULT 'العروض الخاصة بنا',
  offers_button_icon TEXT DEFAULT 'Sparkles',
  offers_button_link TEXT DEFAULT '/deals',
  
  -- العروض والهدايا
  show_home_special_offers BOOLEAN DEFAULT true,
  home_offers_shape TEXT DEFAULT 'circles',
  show_offer_badges BOOLEAN DEFAULT true,
  gift_display_mode TEXT DEFAULT 'button',
  gift_icon_style TEXT DEFAULT 'pink-gold',
  
  -- التوصيل
  delivery_west_bank NUMERIC DEFAULT 20,
  delivery_jerusalem NUMERIC DEFAULT 50,
  delivery_inside NUMERIC DEFAULT 70,
  
  -- الواتساب
  whatsapp_country_code TEXT DEFAULT '972',
  whatsapp_number TEXT,
  
  -- وسائل التواصل
  social_whatsapp TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  social_snapchat TEXT,
  social_tiktok TEXT,
  social_media_position TEXT DEFAULT 'hero',
  social_icon_style TEXT DEFAULT 'rounded',
  
  -- التأثيرات البصرية
  animation_effect TEXT,
  visual_effects JSONB DEFAULT '{"text_fade": true, "text_wave": false, "heart_beat": true, "badge_pulse": true, "button_glow": true, "navbar_blur": true, "button_scale": true, "button_shine": true, "button_ripple": true, "navbar_shadow": true, "scroll_reveal": true, "smooth_scroll": true, "text_gradient": false, "image_parallax": false, "loading_shimmer": true, "product_3d_tilt": false, "text_typewriter": false, "card_border_glow": false, "image_zoom_hover": true, "loading_skeleton": true, "card_glass_effect": false, "floating_elements": false, "stagger_animation": true, "product_hover_glow": true, "product_hover_lift": true}'::jsonb,
  
  -- الخلفية
  background_style TEXT DEFAULT 'solid',
  background_pattern TEXT,
  background_image_url TEXT,
  background_animation_type TEXT DEFAULT 'none',
  background_icon_type TEXT DEFAULT 'shopping',
  background_selected_icons JSONB DEFAULT '["ShoppingBag", "Heart", "Star"]'::jsonb,
  background_icon_density INTEGER DEFAULT 30,
  background_icon_size_mode TEXT DEFAULT 'random',
  background_line_thickness NUMERIC DEFAULT 2,
  
  -- التحميل
  loading_style TEXT DEFAULT 'spinner',
  loading_show_logo BOOLEAN DEFAULT true,
  
  -- الدفع
  checkout_badges_enabled BOOLEAN DEFAULT true,
  checkout_badges JSONB DEFAULT '[{"icon": "truck", "label": "توصيل سريع", "enabled": true}, {"icon": "shield", "label": "دفع آمن", "enabled": true}, {"icon": "clock", "label": "24/7 دعم", "enabled": true}, {"icon": "gift", "label": "هدايا مجانية", "enabled": true}]'::jsonb,
  
  -- تخطيط الصفحة الرئيسية
  store_layout_style TEXT DEFAULT 'classic',
  layout_products_per_category_row INTEGER DEFAULT 6,
  layout_category_row_scrollable BOOLEAN DEFAULT true,
  layout_show_category_view_all BOOLEAN DEFAULT true,
  layout_featured_product_id UUID,
  layout_enable_3d_effect BOOLEAN DEFAULT false,
  layout_3d_effect_type TEXT DEFAULT 'rotate',
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  og_image_url TEXT,
  
  -- المخزون
  show_stock_to_customers BOOLEAN DEFAULT true,
  
  -- النافذة المنبثقة
  welcome_popup_enabled BOOLEAN DEFAULT false,
  welcome_popup_image_url TEXT,
  welcome_popup_link TEXT,
  welcome_popup_show_once BOOLEAN DEFAULT true,
  
  -- الأمان
  setup_locked BOOLEAN DEFAULT false,
  
  -- التواريخ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- الجزء 10: الدوال (FUNCTIONS)
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
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- دالة التحقق من سعر عنصر الطلب
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
  SELECT price, COALESCE(discount_percentage, 0) INTO actual_price, discount_pct
  FROM products WHERE id = NEW.product_id;
  
  IF actual_price IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  final_price := actual_price * (1 - discount_pct / 100);
  NEW.price_at_purchase := final_price;
  
  RETURN NEW;
END;
$$;

-- =============================================
-- الجزء 11: Triggers
-- =============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_brands_updated_at ON public.brands;
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_special_offers_updated_at ON public.special_offers;
CREATE TRIGGER update_special_offers_updated_at
  BEFORE UPDATE ON public.special_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_gift_offers_updated_at ON public.gift_offers;
CREATE TRIGGER update_gift_offers_updated_at
  BEFORE UPDATE ON public.gift_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sensitive_settings_updated_at ON public.sensitive_settings;
CREATE TRIGGER update_sensitive_settings_updated_at
  BEFORE UPDATE ON public.sensitive_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_push_tokens_updated_at ON public.push_tokens;
CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger للتحقق من سعر عنصر الطلب
DROP TRIGGER IF EXISTS ensure_correct_price ON public.order_items;
CREATE TRIGGER ensure_correct_price
  BEFORE INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_item_price();

-- =============================================
-- الجزء 12: الفهارس (INDEXES)
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
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_special_offers_is_active ON public.special_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_special_offer_products_offer ON public.special_offer_products(offer_id);
CREATE INDEX IF NOT EXISTS idx_gift_offers_is_active ON public.gift_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_views_product ON public.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON public.product_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_rate_limits_phone ON public.order_rate_limits(phone_number);
CREATE INDEX IF NOT EXISTS idx_order_rate_limits_created ON public.order_rate_limits(created_at DESC);

-- =============================================
-- الجزء 13: تفعيل Row Level Security
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
ALTER TABLE public.order_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_offer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensitive_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- الجزء 14: سياسات RLS (الأمان)
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
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles for management" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile only" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view profiles for management" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
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

-- === حدود الطلبات ===
DROP POLICY IF EXISTS "Anyone can insert rate limits" ON public.order_rate_limits;
DROP POLICY IF EXISTS "Admins can manage rate limits" ON public.order_rate_limits;
CREATE POLICY "Anyone can insert rate limits" ON public.order_rate_limits FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage rate limits" ON public.order_rate_limits FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === العروض الخاصة ===
DROP POLICY IF EXISTS "Anyone can view active special offers" ON public.special_offers;
DROP POLICY IF EXISTS "Admins can manage special offers" ON public.special_offers;
CREATE POLICY "Anyone can view active special offers" ON public.special_offers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage special offers" ON public.special_offers FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === منتجات العروض الخاصة ===
DROP POLICY IF EXISTS "Anyone can view special offer products" ON public.special_offer_products;
DROP POLICY IF EXISTS "Admins can manage special offer products" ON public.special_offer_products;
CREATE POLICY "Anyone can view special offer products" ON public.special_offer_products FOR SELECT USING (true);
CREATE POLICY "Admins can manage special offer products" ON public.special_offer_products FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === عروض الهدايا ===
DROP POLICY IF EXISTS "Anyone can view active gift offers" ON public.gift_offers;
DROP POLICY IF EXISTS "Admins can manage gift offers" ON public.gift_offers;
CREATE POLICY "Anyone can view active gift offers" ON public.gift_offers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage gift offers" ON public.gift_offers FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === منتجات الهدايا ===
DROP POLICY IF EXISTS "Anyone can view gift products" ON public.gift_products;
DROP POLICY IF EXISTS "Admins can manage gift products" ON public.gift_products;
CREATE POLICY "Anyone can view gift products" ON public.gift_products FOR SELECT USING (true);
CREATE POLICY "Admins can manage gift products" ON public.gift_products FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === أكواد الخصم ===
DROP POLICY IF EXISTS "Anyone can read active promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;
CREATE POLICY "Anyone can read active promo codes" ON public.promo_codes FOR SELECT USING (is_active = true AND expires_at > now());
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === مشاهدات الصفحات ===
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
DROP POLICY IF EXISTS "Admins can view page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view page views" ON public.page_views FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- === مشاهدات المنتجات ===
DROP POLICY IF EXISTS "Anyone can insert product views" ON public.product_views;
DROP POLICY IF EXISTS "Admins can view product views" ON public.product_views;
CREATE POLICY "Anyone can insert product views" ON public.product_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view product views" ON public.product_views FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- === الإشعارات ===
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.push_notifications;
CREATE POLICY "Admins can manage notifications" ON public.push_notifications FOR ALL USING (has_role(auth.uid(), 'admin'));

-- === رموز الأجهزة ===
DROP POLICY IF EXISTS "Anyone can register device token" ON public.push_tokens;
DROP POLICY IF EXISTS "Admins can view tokens" ON public.push_tokens;
CREATE POLICY "Anyone can register device token" ON public.push_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view tokens" ON public.push_tokens FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- === الإعدادات الحساسة ===
DROP POLICY IF EXISTS "Admins can view sensitive settings" ON public.sensitive_settings;
DROP POLICY IF EXISTS "Admins can insert sensitive settings" ON public.sensitive_settings;
DROP POLICY IF EXISTS "Admins can update sensitive settings" ON public.sensitive_settings;
DROP POLICY IF EXISTS "Admins can delete sensitive settings" ON public.sensitive_settings;
CREATE POLICY "Admins can view sensitive settings" ON public.sensitive_settings FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert sensitive settings" ON public.sensitive_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sensitive settings" ON public.sensitive_settings FOR UPDATE USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sensitive settings" ON public.sensitive_settings FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- الجزء 15: Storage (تخزين الصور)
-- =============================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

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
-- الجزء 16: البيانات الافتراضية
-- =============================================

INSERT INTO public.settings (store_name, location, theme)
SELECT 'متجري', 'فلسطين', 'default'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

INSERT INTO public.sensitive_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.sensitive_settings);

-- =============================================
-- انتهى الإعداد بنجاح! ✅
-- =============================================
-- 
-- الخطوات التالية:
-- 1. اذهب إلى Settings → Vault → Secrets
-- 2. أضف Secret جديد باسم: ADMIN_CREATION_CODE
-- 3. ضع قيمة سرية قوية (مثل: MyStore2024Secret!)
-- 4. انشر الكود على Vercel أو أي استضافة
-- 5. افتح /admin123 وأنشئ حساب المدير
-- =============================================
