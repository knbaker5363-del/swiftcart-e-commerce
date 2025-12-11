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
import { Check, Loader2, Database, User, Store, ArrowLeft, ArrowRight, Sparkles, FileCode, ExternalLink, Copy, Upload, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type Step = 'welcome' | 'supabase' | 'detect' | 'schema-check' | 'database' | 'admin' | 'store' | 'import-confirm' | 'complete';
type SetupMode = 'new' | 'import';

interface ExistingData {
  hasSettings: boolean;
  hasAdmin: boolean;
  hasProducts: boolean;
  productsCount: number;
  categoriesCount: number;
  brandsCount: number;
  ordersCount: number;
  existingStoreName?: string;
}

interface SchemaCheckResult {
  table: string;
  exists: boolean;
  missingColumns: string[];
  status: 'ok' | 'missing' | 'incomplete';
}

interface SchemaValidation {
  isValid: boolean;
  isPartiallyValid: boolean;
  results: SchemaCheckResult[];
  missingTables: string[];
  incompleteTables: string[];
}

// Required tables and their essential columns
const REQUIRED_SCHEMA = {
  settings: ['id', 'store_name', 'theme', 'created_at', 'updated_at'],
  products: ['id', 'name', 'price', 'is_active', 'created_at'],
  categories: ['id', 'name', 'created_at'],
  brands: ['id', 'name', 'created_at'],
  orders: ['id', 'customer_name', 'customer_phone', 'customer_address', 'total_amount', 'status', 'created_at'],
  order_items: ['id', 'order_id', 'product_id', 'quantity', 'price_at_purchase'],
  user_roles: ['id', 'user_id', 'role', 'created_at'],
  profiles: ['id', 'email', 'created_at'],
  favorites: ['id', 'user_id', 'product_id', 'created_at'],
  product_categories: ['id', 'product_id', 'category_id'],
  special_offers: ['id', 'name', 'is_active', 'created_at'],
  special_offer_products: ['id', 'offer_id', 'product_id'],
  gift_offers: ['id', 'name', 'minimum_amount', 'is_active'],
  gift_products: ['id', 'gift_offer_id', 'product_id'],
  promo_codes: ['id', 'code', 'discount_percentage', 'is_active'],
  page_views: ['id', 'visitor_id', 'page_path', 'created_at'],
  product_views: ['id', 'visitor_id', 'product_id', 'created_at'],
  sensitive_settings: ['id', 'telegram_bot_token', 'telegram_chat_id'],
};

const Setup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveConfig } = useConfig();
  const { reconnect } = useSupabaseContext();
  
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [setupMode, setSetupMode] = useState<SetupMode>('new');
  const [existingData, setExistingData] = useState<ExistingData | null>(null);
  const [schemaValidation, setSchemaValidation] = useState<SchemaValidation | null>(null);
  const [checkProgress, setCheckProgress] = useState(0);
  
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
        { id: 'schema-check', title: 'فحص الهيكل', icon: <RefreshCw className="h-5 w-5" /> },
        { id: 'import-confirm', title: 'تأكيد الاستيراد', icon: <Upload className="h-5 w-5" /> },
        { id: 'complete', title: 'انتهى!', icon: <Check className="h-5 w-5" /> },
      ];
    }
    return [
      { id: 'welcome', title: 'مرحباً', icon: <Sparkles className="h-5 w-5" /> },
      { id: 'supabase', title: 'ربط قاعدة البيانات', icon: <Database className="h-5 w-5" /> },
      { id: 'schema-check', title: 'فحص الهيكل', icon: <RefreshCw className="h-5 w-5" /> },
      { id: 'database', title: 'تهيئة الجداول', icon: <FileCode className="h-5 w-5" /> },
      { id: 'admin', title: 'حساب المدير', icon: <User className="h-5 w-5" /> },
      { id: 'store', title: 'إعدادات المتجر', icon: <Store className="h-5 w-5" /> },
      { id: 'complete', title: 'انتهى!', icon: <Check className="h-5 w-5" /> },
    ];
  };

  const steps = getStepsForMode();

  // Tables with restrictive RLS that may fail SELECT even when they exist
  const RLS_PROTECTED_TABLES = [
    'sensitive_settings',
    'page_views', 
    'product_views',
    'push_notifications',
    'push_tokens'
  ];

  // Tables where RLS only shows active/valid records
  const CONDITIONAL_RLS_TABLES = [
    'special_offers',
    'gift_offers',
    'promo_codes'
  ];

  const checkTableSchema = async (client: any, tableName: string, requiredColumns: string[]): Promise<SchemaCheckResult> => {
    try {
      // Try to select from the table with limit 0 to check if it exists
      const { data, error } = await client.from(tableName).select('*').limit(0);
      
      if (error) {
        const errorMessage = error.message?.toLowerCase() || '';
        const errorCode = error.code || '';
        
        // Table definitely doesn't exist
        if (errorMessage.includes('does not exist') || 
            errorMessage.includes('relation') && errorMessage.includes('does not exist') ||
            errorCode === '42P01') {
          return { table: tableName, exists: false, missingColumns: requiredColumns, status: 'missing' };
        }
        
        // RLS or permission errors - table exists but we can't read
        // For protected tables, assume they exist and are complete
        if (RLS_PROTECTED_TABLES.includes(tableName) || CONDITIONAL_RLS_TABLES.includes(tableName)) {
          return { table: tableName, exists: true, missingColumns: [], status: 'ok' };
        }
        
        // For other permission errors, assume table exists
        if (errorMessage.includes('permission') || 
            errorMessage.includes('denied') ||
            errorMessage.includes('policy') ||
            errorCode === '42501') {
          return { table: tableName, exists: true, missingColumns: [], status: 'ok' };
        }
        
        // Unknown error - try column-by-column check
        const missingColumns: string[] = [];
        for (const col of requiredColumns) {
          const { error: colError } = await client.from(tableName).select(col).limit(0);
          if (colError && colError.message?.includes('does not exist')) {
            missingColumns.push(col);
          }
        }
        
        if (missingColumns.length > 0) {
          return { table: tableName, exists: true, missingColumns, status: 'incomplete' };
        }
      }
      
      return { table: tableName, exists: true, missingColumns: [], status: 'ok' };
    } catch (err) {
      // For protected tables, assume they exist on any error
      if (RLS_PROTECTED_TABLES.includes(tableName) || CONDITIONAL_RLS_TABLES.includes(tableName)) {
        return { table: tableName, exists: true, missingColumns: [], status: 'ok' };
      }
      return { table: tableName, exists: false, missingColumns: requiredColumns, status: 'missing' };
    }
  };

  const validateSchema = async (): Promise<SchemaValidation> => {
    const client = createRuntimeSupabaseClient(supabaseUrl, supabaseAnonKey);
    const results: SchemaCheckResult[] = [];
    const tables = Object.entries(REQUIRED_SCHEMA);
    
    for (let i = 0; i < tables.length; i++) {
      const [tableName, columns] = tables[i];
      const result = await checkTableSchema(client, tableName, columns);
      results.push(result);
      setCheckProgress(Math.round(((i + 1) / tables.length) * 100));
    }
    
    const missingTables = results.filter(r => r.status === 'missing').map(r => r.table);
    const incompleteTables = results.filter(r => r.status === 'incomplete').map(r => r.table);
    const isValid = missingTables.length === 0 && incompleteTables.length === 0;
    const isPartiallyValid = missingTables.length < tables.length / 2;
    
    return { isValid, isPartiallyValid, results, missingTables, incompleteTables };
  };

  const checkExistingData = async (): Promise<ExistingData> => {
    const client = createRuntimeSupabaseClient(supabaseUrl, supabaseAnonKey);
    
    // Check settings
    const { data: settings } = await client.from('settings').select('id, store_name').limit(1);
    
    // Check admin users
    const { data: admins } = await client.from('user_roles').select('id').eq('role', 'admin').limit(1);
    
    // Check products count
    const { count: productsCount } = await client.from('products').select('id', { count: 'exact', head: true });
    
    // Check categories count
    const { count: categoriesCount } = await client.from('categories').select('id', { count: 'exact', head: true });
    
    // Check brands count
    const { count: brandsCount } = await client.from('brands').select('id', { count: 'exact', head: true });
    
    // Check orders count
    const { count: ordersCount } = await client.from('orders').select('id', { count: 'exact', head: true });
    
    return {
      hasSettings: settings && settings.length > 0,
      hasAdmin: admins && admins.length > 0,
      hasProducts: (productsCount || 0) > 0,
      productsCount: productsCount || 0,
      categoriesCount: categoriesCount || 0,
      brandsCount: brandsCount || 0,
      ordersCount: ordersCount || 0,
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

  const handleSchemaCheck = async () => {
    setIsLoading(true);
    setCheckProgress(0);
    setCurrentStep('schema-check');
    
    try {
      // First validate schema
      const validation = await validateSchema();
      setSchemaValidation(validation);
      
      if (validation.isValid) {
        // Schema is complete, check for existing data
        const data = await checkExistingData();
        setExistingData(data);
        
        if (data.hasSettings && data.hasAdmin) {
          setSetupMode('import');
          if (data.existingStoreName) {
            setStoreName(data.existingStoreName);
          }
          toast({ title: 'قاعدة بيانات متوافقة!', description: 'يمكنك استيراد البيانات مباشرة' });
          setCurrentStep('import-confirm');
        } else {
          setSetupMode('new');
          toast({ title: 'الجداول موجودة', description: 'يمكنك إكمال الإعداد' });
          setCurrentStep('admin');
        }
      } else {
        // Schema is incomplete or missing
        setSetupMode('new');
        toast({ 
          title: validation.missingTables.length > 0 ? 'جداول مفقودة' : 'جداول غير مكتملة', 
          description: 'يجب تشغيل ملف SQL لإنشاء الجداول',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.log('Schema check failed, proceeding with new setup');
      setSetupMode('new');
      setSchemaValidation({
        isValid: false,
        isPartiallyValid: false,
        results: [],
        missingTables: Object.keys(REQUIRED_SCHEMA),
        incompleteTables: []
      });
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
      
      const { data: authData, error: signUpError } = await client.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: { full_name: adminName }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
      
      const { data: existingSettings } = await client.from('settings').select('id').limit(1);
      
      if (existingSettings && existingSettings.length > 0) {
        await client.from('settings').update({
          store_name: storeName,
          location: storeLocation,
          store_phone: storePhone,
          setup_locked: true,
        }).eq('id', existingSettings[0].id);
      } else {
        await client.from('settings').insert({
          store_name: storeName,
          location: storeLocation,
          store_phone: storePhone,
          setup_locked: true,
        });
      }

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
      
      try {
        const oldClient = reinitializeSupabase();
        if (oldClient) {
          await oldClient.auth.signOut({ scope: 'local' });
          console.log('Signed out from existing session');
        }
      } catch (e) {
        console.log('No existing session to sign out from');
      }
      
      clearAllSupabaseData();
      console.log('Cleared all old Supabase data');
      
      // IMPORTANT: Re-save config AFTER clearing (clearAllSupabaseData removes the config too)
      saveConfig({
        supabaseUrl,
        supabaseAnonKey,
        isConfigured: true,
      });
      console.log('Saved new Supabase config to localStorage');
      
      reinitializeSupabase(supabaseUrl, supabaseAnonKey);
      console.log('Reinitialized Supabase with new credentials');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
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

  const getStatusIcon = (status: 'ok' | 'missing' | 'incomplete') => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'incomplete':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
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
                onClick={handleSchemaCheck} 
                disabled={!connectionTested || isLoading}
                className="flex-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                التالي - فحص الهيكل
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        );

      case 'schema-check':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : schemaValidation?.isValid ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                )}
              </div>
              <h2 className="text-xl font-bold">
                {isLoading ? 'جاري فحص هيكل قاعدة البيانات...' : 
                 schemaValidation?.isValid ? 'قاعدة البيانات متوافقة!' : 'يوجد جداول مفقودة'}
              </h2>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={checkProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  فحص الجداول... {checkProgress}%
                </p>
              </div>
            )}

            {schemaValidation && !isLoading && (
              <div className="space-y-4">
                <div className="bg-muted/50 border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h3 className="font-semibold mb-3">نتائج الفحص:</h3>
                  <div className="space-y-2">
                    {schemaValidation.results.map((result) => (
                      <div key={result.table} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className={result.status === 'ok' ? 'text-foreground' : 'text-muted-foreground'}>
                            {result.table}
                          </span>
                        </div>
                        <span className={`text-xs ${
                          result.status === 'ok' ? 'text-green-500' : 
                          result.status === 'missing' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                          {result.status === 'ok' ? 'متوفر' : 
                           result.status === 'missing' ? 'مفقود' : 'غير مكتمل'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {!schemaValidation.isValid && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>ملاحظة:</strong> يجب تشغيل ملف SQL لإنشاء الجداول المفقودة قبل المتابعة.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => {
                    setConnectionTested(false);
                    setSchemaValidation(null);
                    setCurrentStep('supabase');
                  }}>
                    <ArrowRight className="h-4 w-4 ml-2" />
                    تغيير الاتصال
                  </Button>
                  
                  {schemaValidation.isValid ? (
                    <Button 
                      onClick={() => setCurrentStep('import-confirm')}
                      className="flex-1"
                    >
                      متابعة
                      <ArrowLeft className="h-4 w-4 mr-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setCurrentStep('database')}
                      className="flex-1"
                    >
                      تهيئة الجداول
                      <ArrowLeft className="h-4 w-4 mr-2" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'import-confirm':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Database className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">تم التحقق من قاعدة البيانات!</h2>
            </div>
            
            <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold mb-2">ملخص البيانات:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">اسم المتجر:</span>
                  <span className="font-semibold">{existingData?.existingStoreName || 'غير محدد'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">حساب أدمن:</span>
                  <span className={`font-semibold ${existingData?.hasAdmin ? 'text-green-600' : 'text-red-500'}`}>
                    {existingData?.hasAdmin ? '✓ موجود' : '✗ غير موجود'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المنتجات:</span>
                  <span className="font-semibold">{existingData?.productsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">التصنيفات:</span>
                  <span className="font-semibold">{existingData?.categoriesCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">البراندات:</span>
                  <span className="font-semibold">{existingData?.brandsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الطلبات:</span>
                  <span className="font-semibold">{existingData?.ordersCount || 0}</span>
                </div>
              </div>
            </div>

            {schemaValidation && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>جميع الجداول ({schemaValidation.results.filter(r => r.status === 'ok').length}/{schemaValidation.results.length}) متوافقة مع الإصدار الحالي</span>
                </p>
              </div>
            )}

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
                إعداد جديد (تجاهل البيانات الموجودة)
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => {
                setConnectionTested(false);
                setSchemaValidation(null);
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
            
            {schemaValidation && schemaValidation.missingTables.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
                  الجداول المفقودة ({schemaValidation.missingTables.length}):
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  {schemaValidation.missingTables.join('، ')}
                </p>
              </div>
            )}
            
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
                  <strong>ملاحظة:</strong> تأكد من تشغيل SQL بالكامل قبل المتابعة.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('supabase')}>
                <ArrowRight className="h-4 w-4 ml-2" />
                رجوع
              </Button>
              <Button 
                onClick={async () => {
                  // Re-check schema after SQL execution
                  setIsLoading(true);
                  const validation = await validateSchema();
                  setSchemaValidation(validation);
                  setIsLoading(false);
                  
                  if (validation.isValid) {
                    toast({ title: 'نجاح!', description: 'تم التحقق من الجداول' });
                    setCurrentStep('admin');
                  } else {
                    toast({ 
                      title: 'لا يزال هناك جداول مفقودة', 
                      description: 'تأكد من تشغيل ملف SQL بالكامل',
                      variant: 'destructive'
                    });
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                إعادة الفحص والمتابعة
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
                  <strong>تنبيه:</strong> تأكد من تفعيل "Auto-confirm" في إعدادات Supabase Auth للتسهيل.
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
                <p><strong>التصنيفات:</strong> {existingData.categoriesCount} تصنيف</p>
                <p><strong>الطلبات:</strong> {existingData.ordersCount} طلب</p>
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
