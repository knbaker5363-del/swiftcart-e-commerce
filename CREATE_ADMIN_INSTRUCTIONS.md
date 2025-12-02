# إنشاء حساب Admin - تعليمات الاستخدام

## الطريقة: كود Console (الأسرع والأكثر أمانًا)

### الخطوات:

1. **افتح الموقع** في المتصفح (أي صفحة)

2. **افتح Console في المتصفح:**
   - **Chrome/Edge**: اضغط `F12` أو `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
   - **Firefox**: اضغط `F12` أو `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - **Safari**: `Cmd+Option+C`

3. **انسخ والصق هذا الكود** في Console:

```javascript
(async function createAdmin() {
  const email = prompt("أدخل البريد الإلكتروني للأدمن:");
  if (!email) {
    alert("يجب إدخال البريد الإلكتروني");
    return;
  }

  const password = prompt("أدخل كلمة المرور (6 أحرف على الأقل):");
  if (!password || password.length < 6) {
    alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    return;
  }

  const fullName = prompt("أدخل الاسم الكامل (اختياري):");

  console.log("جاري إنشاء الحساب...");

  try {
    // Import Supabase client
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    
    // Get Supabase credentials from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      alert("خطأ: لم يتم العثور على بيانات Supabase");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });

    if (signUpError) {
      alert("خطأ في إنشاء الحساب: " + signUpError.message);
      console.error("Sign up error:", signUpError);
      return;
    }

    if (!signUpData.user) {
      alert("خطأ: لم يتم إنشاء المستخدم");
      return;
    }

    const userId = signUpData.user.id;
    console.log("✅ تم إنشاء المستخدم بنجاح - ID:", userId);

    // Step 2: Add admin role (need to use service role or admin access)
    // Since we can't directly insert with client-side code due to RLS,
    // we'll provide SQL command to run manually

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  ✅ تم إنشاء الحساب بنجاح!                                    ║
╠════════════════════════════════════════════════════════════════╣
║  📧 البريد: ${email}                                           ║
║  🆔 User ID: ${userId}                                         ║
╠════════════════════════════════════════════════════════════════╣
║  ⚠️  خطوة أخيرة: تفعيل صلاحيات Admin                         ║
║                                                                ║
║  يرجى تشغيل هذا الأمر SQL في لوحة التحكم:                    ║
║                                                                ║
║  INSERT INTO public.user_roles (user_id, role)                ║
║  VALUES ('${userId}', 'admin')                                ║
║  ON CONFLICT (user_id, role) DO NOTHING;                      ║
║                                                                ║
║  أو استخدم الأمر التالي لتشغيله تلقائياً:                    ║
╚════════════════════════════════════════════════════════════════╝
    `);

    // Try to insert admin role (will only work if user has appropriate permissions)
    try {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      if (roleError) {
        console.warn("⚠️  لم يتم تعيين صلاحيات Admin تلقائياً:", roleError.message);
        console.log("يرجى تشغيل أمر SQL المذكور أعلاه يدوياً في لوحة التحكم");
      } else {
        console.log("✅ تم تعيين صلاحيات Admin بنجاح!");
        alert("✅ تم إنشاء حساب Admin بنجاح!\n\nيمكنك الآن تسجيل الدخول في:\n/admin/login");
      }
    } catch (e) {
      console.warn("⚠️  لم يتم تعيين صلاحيات Admin تلقائياً");
      console.log("يرجى تشغيل أمر SQL المذكور أعلاه يدوياً في لوحة التحكم");
    }

  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("حدث خطأ أثناء إنشاء الحساب: " + error.message);
  }
})();
```

4. **اتبع التعليمات** التي ستظهر على الشاشة

5. **إذا ظهرت رسالة تطلب منك تشغيل أمر SQL:**
   - انتقل إلى لوحة التحكم Backend (Lovable Cloud)
   - اذهب إلى SQL Editor
   - الصق الأمر SQL وشغله

6. **الآن يمكنك تسجيل الدخول** عبر `/admin/login`

---

## ملاحظات مهمة:

- ✅ **الأمان**: هذا الكود يعمل مرة واحدة فقط ولا يترك أثر
- ✅ **السرية**: لا تشارك كلمة المرور مع أحد
- ⚠️ **مهم**: احفظ بيانات تسجيل الدخول في مكان آمن
- 🔒 **RLS محمي**: جدول user_roles محمي ولا يمكن التلاعب به من المتصفح

---

## البديل: إنشاء Admin يدوياً عبر SQL

إذا لم تنجح الطريقة السابقة، يمكنك:

1. افتح لوحة التحكم Backend (Lovable Cloud)
2. اذهب إلى SQL Editor
3. شغل الأوامر التالية:

```sql
-- أولاً: تأكد من وجود المستخدم في جدول profiles (يجب أن يكون موجود بعد التسجيل)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- ثانياً: نسخ الـ id من النتيجة واستبداله هنا
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-id-here', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## التحقق من نجاح العملية:

```sql
-- تحقق من المستخدمين الـ Admin
SELECT 
  p.email, 
  p.full_name,
  ur.role,
  ur.created_at
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'admin';
```

---

## الأسئلة الشائعة:

**س: هل يمكن إنشاء أكثر من admin؟**
ج: نعم، يمكنك تشغيل الكود لعدة مستخدمين

**س: كيف أحذف صلاحيات admin من مستخدم؟**
ج: استخدم هذا الأمر SQL:
```sql
DELETE FROM public.user_roles 
WHERE user_id = 'user-id-here' AND role = 'admin';
```

**س: هل يمكن للمستخدمين العاديين الوصول للوحة الإدارة؟**
ج: لا، محمي تماماً بنظام RLS + server-side checks

---

**ملاحظة أخيرة:** هذا الملف يمكن حذفه بعد إنشاء أول admin!
