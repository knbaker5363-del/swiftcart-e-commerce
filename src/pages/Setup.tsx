import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useConfig } from '@/contexts/ConfigContext';
import { useSupabaseContext } from '@/contexts/SupabaseContext';
import { testSupabaseConnection, createRuntimeSupabaseClient, clearAllSupabaseData } from '@/lib/supabase-runtime';
import { reinitializeSupabase } from '@/lib/supabase-wrapper';
import { Check, Loader2, Database, User, Store, ArrowLeft, ArrowRight, Sparkles, FileCode, ExternalLink, Copy, Upload, RefreshCw } from 'lucide-react';

type Step = 'welcome' | 'supabase' | 'detect' | 'database' | 'admin' | 'store' | 'import-confirm' | 'complete';
type SetupMode = 'new' | 'import';

interface ExistingData {
  hasSettings: boolean;
  hasAdmin: boolean;
  hasProducts: boolean;
  productsCount: number;
  existingStoreName?: string;
}

const Setup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveConfig } = useConfig();
  const { reconnect } = useSupabaseContext();
  
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [setupMode, setSetupMode] = useState<SetupMode>('new');
  const [existingData, setExistingData] = useState<ExistingData | null>(null);
  
  // Supabase credentials
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [connectionTested, setConnectionTested] = useState(false);
  
  // Admin credentials
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  
  // Store settings
  const [storeName, setStoreName] = useState('متجري');
  const [storeLocation, setStoreLocation] = useState('فلسطين');
  const [storePhone, setStorePhone] = useState('');

  const getStepsForMode = (): { id: Step; title: string; icon: React.ReactNode }[] => {
    if (setupMode === 'import') {
      return [
        { id: 'welcome', title: 'مرحباً', icon: <Sparkles className="h-5 w-5" /> },
        { id: 'supabase', title: 'ربط قاعدة البيانات', icon: <Database className="h-5 w-5" /> },
        { id: 'detect', title: 'فحص البيانات', icon: <RefreshCw className="h-5 w-5" /> },
        { id: 'import-confirm', title: 'تأكيد الاستيراد', icon: <Upload className="h-5 w-5" /> },
        { id: 'complete', title: 'انتهى!', icon: <Check className="h-5 w-5" /> },
      ];
    }
    return [
      { id: 'welcome', title: 'مرحباً', icon: <Sparkles className="h-5 w-5" /> },
      { id: 'supabase', title: 'ربط قاعدة البيانات', icon: <Database className="h-5 w-5" /> },
      { id: 'detect', title: 'فحص البيانات', icon: <RefreshCw className="h-5 w-5" /> },
      { id: 'database', title: 'تهيئة الجداول', icon: <FileCode className="h-5 w-5" /> },
      { id: 'admin', title: 'حساب المدير', icon: <User className="h-5 w-5" /> },
      { id: 'store', title: 'إعدادات المتجر', icon: <Store className="h-5 w-5" /> },
      { id: 'complete', title: 'انتهى!', icon: <Check className="h-5 w-5" /> },
    ];
  };

  const steps = getStepsForMode();

  const checkExistingData = async (): Promise<ExistingData> => {
    const client = createRuntimeSupabaseClient(supabaseUrl, supabaseAnonKey);
    
    // Check settings
    const { data: settings } = await client.from('settings').select('id, store_name').limit(1);
    
    // Check admin users
    const { data: admins } = await client.from('user_roles').select('id').eq('role', 'admin').limit(1);
    
    // Check products count
    const { data: products, count } = await client.from('products').select('id', { count: 'exact' }).limit(1);
    
    return {
      hasSettings: settings && settings.length > 0,
      hasAdmin: admins && admins.length > 0,
      hasProducts: products && products.length > 0,
      productsCount: count || 0,
      existingStoreName: settings?.[0]?.store_name
    };
  };

  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      toast({ title: 'خطأ', description: 'يرجى إدخال جميع البيانات', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const success = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
      if (success) {
        setConnectionTested(true);
        toast({ title: 'نجاح!', description: 'تم الاتصال بنجاح' });
      } else {
        toast({ title: 'خطأ', description: 'فشل الاتصال، تحقق من البيانات', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل الاتصال', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleDetectData = async () => {
    setIsLoading(true);
    try {
      const data = await checkExistingData();
      setExistingData(data);
      
      if (data.hasSettings && data.hasAdmin) {
        // Database has existing data - use import mode
        setSetupMode('import');
        setCurrentStep('import-confirm');
        if (data.existingStoreName) {
          setStoreName(data.existingStoreName);
        }
        toast({ title: 'تم اكتشاف بيانات موجودة!', description: 'يمكنك استيراد البيانات مباشرة' });
      } else {
        // Empty database - proceed with new setup
        setSetupMode('new');
        setCurrentStep('database');
        toast({ title: 'قاعدة بيانات جديدة', description: 'سيتم إعداد المتجر من الصفر' });
      }
    } catch (error) {
      // If tables don't exist, it's a new setup
      console.log('Tables not found, proceeding with new setup');
      setSetupMode('new');
      setCurrentStep('database');
    }
    setIsLoading(false);
  };

  const handleImportConfirm = async () => {
    setIsLoading(true);
    try {
      // Save config to localStorage
      saveConfig({
        supabaseUrl,
        supabaseAnonKey,
        isConfigured: true,
      });

      toast({ title: 'نجاح!', description: 'تم ربط قاعدة البيانات بنجاح' });
      setCurrentStep('complete');
    } catch (error: any) {
      console.error('Import error:', error);
      toast({ title: 'خطأ', description: error.message || 'فشل الاستيراد', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleCreateAdmin = async () => {
    if (!adminEmail || !adminPassword || !adminName) {
      toast({ title: 'خطأ', description: 'يرجى إدخال جميع البيانات', variant: 'destructive' });
      return;
    }

    if (adminPassword.length < 6) {
      toast({ title: 'خطأ', description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const client = createRuntimeSupabaseClient(supabaseUrl, supabaseAnonKey);
      
      // Sign up the admin user
      const { data: authData, error: signUpError } = await client.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: { full_name: adminName }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Wait a bit for the trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Add admin role
        const { error: roleError } = await client.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'admin'
        });

        if (roleError && !roleError.message.includes('duplicate')) {
          console.error('Role error:', roleError);
        }

        toast({ title: 'نجاح!', description: 'تم إنشاء حساب المدير' });
        setCurrentStep('store');
      }
    } catch (error: any) {
      console.error('Admin creation error:', error);
      toast({ title: 'خطأ', description: error.message || 'فشل إنشاء الحساب', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleSaveStoreSettings = async () => {
    setIsLoading(true);
    try {
      const client = createRuntimeSupabaseClient(supabaseUrl, supabaseAnonKey);
      
      // Check if settings exist
      const { data: existingSettings } = await client.from('settings').select('id').limit(1);
      
      if (existingSettings && existingSettings.length > 0) {
        // Update existing settings and lock setup
        await client.from('settings').update({
          store_name: storeName,
          location: storeLocation,
          store_phone: storePhone,
          setup_locked: true,
        }).eq('id', existingSettings[0].id);
      } else {
        // Insert new settings
        await client.from('settings').insert({
          store_name: storeName,
          location: storeLocation,
          store_phone: storePhone,
          setup_locked: true,
        });
      }

      // Save config to localStorage
      saveConfig({
        supabaseUrl,
        supabaseAnonKey,
        isConfigured: true,
      });

      toast({ title: 'نجاح!', description: 'تم حفظ الإعدادات، جاري إعادة تحميل المتجر...' });
      setCurrentStep('complete');
    } catch (error: any) {
      console.error('Settings error:', error);
      toast({ title: 'خطأ', description: error.message || 'فشل حفظ الإعدادات', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleComplete = async () => {
    try {
      console.log('Starting setup completion...');
      
      // Sign out from any existing session first
      try {
        const oldClient = reinitializeSupabase();
        if (oldClient) {
          await oldClient.auth.signOut({ scope: 'local' });
          console.log('Signed out from existing session');
        }
      } catch (e) {
        console.log('No existing session to sign out from');
      }
      
      // Clear ALL Supabase auth tokens and cached data
      clearAllSupabaseData();
      console.log('Cleared all old Supabase data');
      
      // Reinitialize Supabase client with new credentials
      reinitializeSupabase(supabaseUrl, supabaseAnonKey);
      console.log('Reinitialized Supabase with new credentials');
      
      // Small delay to ensure everything is cleared and reinitialized
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For import mode, go to admin login; for new setup, go to home
      console.log('Reloading page...');
      if (setupMode === 'import') {
        window.location.href = '/admin123';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during completion:', error);
      window.location.href = '/';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'تم النسخ!', description: 'تم نسخ الرابط' });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">مرحباً بك في إعداد متجرك!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              سنقوم معاً بإعداد متجرك الإلكتروني خطوة بخطوة. 
              العملية سهلة ولن تستغرق أكثر من 10 دقائق.
            </p>
            <div className="bg-muted/50 border rounded-lg p-4 text-sm text-right space-y-2">
              <p className="font-semibold">يمكنك:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>إعداد متجر جديد من الصفر</li>
                <li>استيراد بيانات من متجر سابق (نفس قاعدة البيانات)</li>
              </ul>
            </div>
            <Button onClick={() => setCurrentStep('supabase')} size="lg" className="gap-2">
              ابدأ الإعداد
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        );

      case 'supabase':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">ربط قاعدة البيانات</h2>
              <p className="text-muted-foreground text-sm">
                أدخل بيانات مشروع Supabase الخاص بك. يمكنك إنشاء مشروع مجاني من{' '}
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  supabase.com
                </a>
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabaseUrl">Project URL</Label>
                <Input
                  id="supabaseUrl"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xxxxx.supabase.co"
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supabaseAnonKey">Anon Key (public)</Label>
                <Input
                  id="supabaseAnonKey"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  dir="ltr"
                />
              </div>
              
              <Button 
                onClick={handleTestConnection} 
                disabled={isLoading || !supabaseUrl || !supabaseAnonKey}
                variant="outline"
                className="w-full"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                اختبار الاتصال
              </Button>
              
              {connectionTested && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <Check className="h-5 w-5" />
                  <span>تم الاتصال بنجاح!</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
                <ArrowRight className="h-4 w-4 ml-2" />
                رجوع
              </Button>
              <Button 
                onClick={handleDetectData} 
                disabled={!connectionTested || isLoading}
                className="flex-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                التالي - فحص البيانات
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        );

      case 'detect':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-bold">جاري فحص قاعدة البيانات...</h2>
            <p className="text-muted-foreground">
              يرجى الانتظار بينما نتحقق من وجود بيانات سابقة
            </p>
          </div>
        );

      case 'import-confirm':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Database className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">تم اكتشاف بيانات موجودة!</h2>
            </div>
            
            <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">اسم المتجر:</span>
                <span className="font-semibold">{existingData?.existingStoreName || 'غير محدد'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">حساب أدمن:</span>
                <span className="font-semibold text-green-600">
                  {existingData?.hasAdmin ? '✓ موجود' : '✗ غير موجود'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">المنتجات:</span>
                <span className="font-semibold">{existingData?.productsCount || 0} منتج</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>ملاحظة:</strong> سيتم استخدام بيانات المتجر الموجودة. يمكنك تسجيل الدخول بحسابك السابق بعد الانتهاء.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleImportConfirm}
                disabled={isLoading}
                className="w-full gap-2"
                size="lg"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                استيراد البيانات والمتابعة
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setSetupMode('new');
                  setCurrentStep('database');
                }}
                className="w-full"
              >
                إعداد جديد (حذف البيانات القديمة)
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => {
                setConnectionTested(false);
                setCurrentStep('supabase');
              }}
              className="w-full"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              تغيير قاعدة البيانات
            </Button>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">تهيئة قاعدة البيانات</h2>
              <p className="text-muted-foreground text-sm">
                قم بتشغيل ملف SQL في Supabase لإنشاء الجداول المطلوبة
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-primary" />
                  خطوات تهيئة قاعدة البيانات:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>افتح لوحة تحكم Supabase الخاصة بمشروعك</li>
                  <li>اذهب إلى <strong>SQL Editor</strong> من القائمة الجانبية</li>
                  <li>انسخ محتوى ملف <code className="bg-background px-1 rounded">COMPLETE_MIGRATION.sql</code></li>
                  <li>الصق المحتوى في SQL Editor واضغط <strong>Run</strong></li>
                </ol>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => window.open(`${supabaseUrl.replace('.supabase.co', '.supabase.com')}/project/${supabaseUrl.split('//')[1]?.split('.')[0]}/sql/new`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  فتح SQL Editor في Supabase
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => copyToClipboard(window.location.origin + '/COMPLETE_MIGRATION.sql')}
                >
                  <Copy className="h-4 w-4" />
                  نسخ رابط ملف SQL
                </Button>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>ملاحظة:</strong> تأكد من تشغيل SQL بالكامل قبل المتابعة. إذا ظهرت أخطاء، تحقق من أن المشروع جديد وفارغ.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('supabase')}>
                <ArrowRight className="h-4 w-4 ml-2" />
                رجوع
              </Button>
              <Button 
                onClick={() => setCurrentStep('admin')}
                className="flex-1"
              >
                قمت بتشغيل SQL - التالي
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">إنشاء حساب المدير</h2>
              <p className="text-muted-foreground text-sm">
                أنشئ حساب المدير الأول للمتجر
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">الاسم</Label>
                <Input
                  id="adminName"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="أحمد محمد"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminEmail">البريد الإلكتروني</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminPassword">كلمة المرور</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>تنبيه:</strong> تأكد من تفعيل "Enable email confirmations" في إعدادات Supabase Auth أو استخدم "Auto-confirm" للتسهيل.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('database')}>
                <ArrowRight className="h-4 w-4 ml-2" />
                رجوع
              </Button>
              <Button 
                onClick={handleCreateAdmin}
                disabled={isLoading || !adminEmail || !adminPassword || !adminName}
                className="flex-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                إنشاء الحساب
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        );

      case 'store':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">إعدادات المتجر</h2>
              <p className="text-muted-foreground text-sm">
                أدخل المعلومات الأساسية لمتجرك
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">اسم المتجر</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="متجري"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storeLocation">الموقع</Label>
                <Input
                  id="storeLocation"
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  placeholder="فلسطين"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storePhone">رقم الهاتف</Label>
                <Input
                  id="storePhone"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="0599123456"
                  dir="ltr"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('admin')}>
                <ArrowRight className="h-4 w-4 ml-2" />
                رجوع
              </Button>
              <Button 
                onClick={handleSaveStoreSettings}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                حفظ والانتهاء
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">
              {setupMode === 'import' ? 'تم ربط المتجر بنجاح! 🎉' : 'تم إعداد المتجر بنجاح! 🎉'}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {setupMode === 'import' 
                ? 'تم ربط متجرك بقاعدة البيانات السابقة. يمكنك تسجيل الدخول بحسابك القديم.'
                : 'متجرك جاهز الآن. يمكنك تسجيل الدخول بحساب المدير الذي أنشأته للبدء في إضافة المنتجات وتخصيص المتجر.'
              }
            </p>
            {setupMode === 'new' && (
              <div className="bg-muted/50 border rounded-lg p-4 text-sm text-right space-y-2">
                <p><strong>البريد الإلكتروني:</strong> {adminEmail}</p>
                <p><strong>رابط لوحة التحكم:</strong> /admin123</p>
              </div>
            )}
            {setupMode === 'import' && existingData && (
              <div className="bg-muted/50 border rounded-lg p-4 text-sm text-right space-y-2">
                <p><strong>اسم المتجر:</strong> {existingData.existingStoreName}</p>
                <p><strong>المنتجات:</strong> {existingData.productsCount} منتج</p>
                <p><strong>رابط لوحة التحكم:</strong> /admin123</p>
              </div>
            )}
            <Button onClick={handleComplete} size="lg" className="gap-2">
              {setupMode === 'import' ? 'الذهاب لتسجيل الدخول' : 'الذهاب للمتجر'}
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        );
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  index <= currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.icon}
              </div>
            ))}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-muted-foreground">
              {steps[currentStepIndex]?.title}
            </CardTitle>
            <CardDescription>
              الخطوة {currentStepIndex + 1} من {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Setup;
