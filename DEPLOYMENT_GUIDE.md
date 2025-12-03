# دليل نشر المتجر الإلكتروني

## نظرة عامة
هذا الدليل يشرح كيفية نشر المتجر الإلكتروني على استضافتك الخاصة مع ربطه بمشروع Supabase جديد.

## المتطلبات
1. حساب على [Supabase](https://supabase.com) (مجاني)
2. حساب على منصة استضافة (Vercel, Netlify, أو أي استضافة تدعم مواقع Static)

---

## الخطوة 1: إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com) وسجل دخول أو أنشئ حساب جديد
2. اضغط على "New Project"
3. اختر اسم للمشروع (مثل: my-store)
4. اختر كلمة مرور قوية لقاعدة البيانات
5. اختر أقرب منطقة جغرافية لك
6. انتظر حتى يتم إنشاء المشروع (2-3 دقائق)

### الحصول على مفاتيح API
بعد إنشاء المشروع:
1. اذهب إلى **Settings** → **API**
2. انسخ **Project URL** (مثل: https://xxxxx.supabase.co)
3. انسخ **anon public key** (المفتاح العام)
4. انسخ **service_role key** (المفتاح السري - يُستخدم مرة واحدة فقط)

---

## الخطوة 2: إعداد قاعدة البيانات

### تشغيل SQL Migrations
1. في Supabase، اذهب إلى **SQL Editor**
2. انسخ والصق الكود التالي ثم اضغط **Run**:

```sql
-- إنشاء أنواع البيانات
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- جدول الفئات
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول العلامات التجارية
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول المنتجات
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    additional_images JSONB DEFAULT '[]',
    category_id UUID REFERENCES public.categories(id),
    brand_id UUID REFERENCES public.brands(id),
    options JSONB DEFAULT '{}',
    discount_percentage NUMERIC DEFAULT 0,
    discount_end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول ربط المنتجات بالفئات
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الملفات الشخصية
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول أدوار المستخدمين
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role)
);

-- جدول الطلبات
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول عناصر الطلب
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC NOT NULL,
    selected_options JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول المفضلة
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- جدول الإعدادات
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT DEFAULT 'متجري',
    logo_url TEXT,
    location TEXT DEFAULT 'فلسطين',
    store_phone TEXT,
    theme TEXT DEFAULT 'default',
    whatsapp_country_code TEXT DEFAULT '972',
    whatsapp_number TEXT,
    delivery_west_bank NUMERIC DEFAULT 20,
    delivery_jerusalem NUMERIC DEFAULT 50,
    delivery_inside NUMERIC DEFAULT 70,
    banner_images JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- إدراج إعدادات افتراضية
INSERT INTO public.settings (store_name) VALUES ('متجري') ON CONFLICT DO NOTHING;

-- تفعيل Row Level Security
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

-- دالة التحقق من الدور
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
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
RETURNS trigger
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

-- إنشاء trigger للمستخدمين الجدد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- سياسات RLS للفئات
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- سياسات RLS للعلامات التجارية
CREATE POLICY "Anyone can view brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage brands" ON public.brands FOR ALL USING (auth.role() = 'authenticated');

-- سياسات RLS للمنتجات
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- سياسات RLS لربط المنتجات بالفئات
CREATE POLICY "Anyone can view product categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage product categories" ON public.product_categories FOR ALL USING (auth.role() = 'authenticated');

-- سياسات RLS للملفات الشخصية
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- سياسات RLS لأدوار المستخدمين
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- سياسات RLS للطلبات
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view and manage orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');

-- سياسات RLS لعناصر الطلب
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view and manage order items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');

-- سياسات RLS للمفضلة
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from their favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- سياسات RLS للإعدادات
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');

-- إنشاء Storage Bucket للصور
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;

-- سياسات Storage
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

### تفعيل Auto-Confirm للبريد الإلكتروني
1. اذهب إلى **Authentication** → **Providers**
2. اضغط على **Email**
3. قم بتفعيل **Confirm email** → **OFF** (أو اتركه مفعل إذا أردت تأكيد البريد)

---

## الخطوة 3: نشر الموقع

### على Vercel (مُوصى به)
1. ارفع المشروع على GitHub
2. اذهب إلى [vercel.com](https://vercel.com) وسجل دخول بحساب GitHub
3. اضغط "Import Project" واختر المستودع
4. اضغط "Deploy"
5. انتظر انتهاء البناء

### على Netlify
1. ارفع المشروع على GitHub
2. اذهب إلى [netlify.com](https://netlify.com)
3. اضغط "Add new site" → "Import an existing project"
4. اختر المستودع واضغط "Deploy"

### على استضافة عادية (cPanel/Hostinger)
1. شغّل الأمر التالي لبناء المشروع:
   ```bash
   npm install
   npm run build
   ```
2. ارفع محتويات مجلد `dist` إلى مجلد `public_html`

---

## الخطوة 4: إعداد المتجر

1. افتح رابط موقعك
2. ستظهر صفحة **Setup Wizard** تلقائياً
3. اتبع الخطوات:
   - أدخل Supabase URL
   - أدخل Anon Key
   - اختبر الاتصال
   - أنشئ حساب المدير
   - أدخل معلومات المتجر
4. بعد الانتهاء، ستدخل إلى لوحة التحكم

---

## الأسئلة الشائعة

### كيف أغير الإعدادات لاحقاً؟
- ادخل لوحة التحكم من `/admin/login`
- اذهب إلى **الإعدادات**

### كيف أعيد ربط Supabase؟
- امسح بيانات المتصفح (localStorage)
- افتح الموقع مجدداً وستظهر صفحة الإعداد

### الموقع لا يعمل؟
1. تأكد من صحة مفاتيح Supabase
2. تأكد من تشغيل SQL migrations
3. تأكد من تفعيل RLS policies

---

## الدعم الفني
للمساعدة، تواصل عبر [البريد الإلكتروني أو واتساب]
