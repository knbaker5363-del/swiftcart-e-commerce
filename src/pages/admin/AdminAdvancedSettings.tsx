import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDrive, Database, FileImage, RefreshCw, Send, Lock, LockOpen, AlertTriangle, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clearAllSupabaseData } from '@/lib/supabase-runtime';
import { useNavigate } from 'react-router-dom';

const AdminAdvancedSettings = () => {
  const { settings, loading } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Telegram
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramBotPassword, setTelegramBotPassword] = useState('');
  const [settingUpWebhook, setSettingUpWebhook] = useState(false);
  const [savingTelegram, setSavingTelegram] = useState(false);
  
  // Storage info
  const [storageInfo, setStorageInfo] = useState<{
    totalSize: number;
    fileCount: number;
    files: { name: string; size: number; type: string }[];
  } | null>(null);
  const [loadingStorage, setLoadingStorage] = useState(false);
  
  // Database info
  const [dbInfo, setDbInfo] = useState<{
    products: number;
    categories: number;
    brands: number;
    orders: number;
    pageViews: number;
    productViews: number;
  } | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  
  // Setup lock
  const [setupLocked, setSetupLocked] = useState(false);
  const [savingSetupLock, setSavingSetupLock] = useState(false);

  // Load sensitive settings and setup lock on mount
  useEffect(() => {
    const loadSettings = async () => {
      // Load sensitive settings
      const { data: sensitiveData } = await supabase
        .from('sensitive_settings')
        .select('*')
        .maybeSingle();
      
      if (sensitiveData) {
        setTelegramBotToken(sensitiveData.telegram_bot_token || '');
        setTelegramChatId(sensitiveData.telegram_chat_id || '');
        setTelegramBotPassword(sensitiveData.telegram_bot_password || '');
      }
      
      // Load setup lock status
      const { data: settingsData } = await supabase
        .from('settings')
        .select('setup_locked')
        .maybeSingle();
      
      if (settingsData) {
        setSetupLocked((settingsData as any).setup_locked || false);
      }
    };
    loadSettings();
  }, []);

  const handleToggleSetupLock = async (locked: boolean) => {
    setSavingSetupLock(true);
    try {
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .maybeSingle();
      
      if (existing) {
        const { error } = await supabase
          .from('settings')
          .update({ setup_locked: locked } as any)
          .eq('id', existing.id);
        
        if (error) throw error;
        
        setSetupLocked(locked);
        toast({ 
          title: locked ? 'تم قفل صفحة الإعداد' : 'تم فتح صفحة الإعداد',
          description: locked ? 'لن يستطيع أحد الوصول لصفحة /setup' : 'يمكن الآن الوصول لصفحة /setup'
        });
      }
    } catch (error) {
      console.error('Error toggling setup lock:', error);
      toast({ title: 'خطأ في تحديث الإعدادات', variant: 'destructive' });
    } finally {
      setSavingSetupLock(false);
    }
  };

  const handleResetConnection = async () => {
    try {
      // First unlock setup page
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .maybeSingle();
      
      if (existing) {
        await supabase
          .from('settings')
          .update({ setup_locked: false } as any)
          .eq('id', existing.id);
      }

      // Sign out
      await supabase.auth.signOut({ scope: 'local' });
      
      // Clear all Supabase data
      clearAllSupabaseData();
      
      toast({ 
        title: 'تم إعادة التعيين', 
        description: 'سيتم نقلك لصفحة الإعداد...' 
      });
      
      // Small delay then redirect to setup
      setTimeout(() => {
        window.location.href = '/setup';
      }, 1000);
    } catch (error) {
      console.error('Error resetting connection:', error);
      toast({ 
        title: 'خطأ', 
        description: 'حدث خطأ أثناء إعادة التعيين',
        variant: 'destructive' 
      });
    }
  };

  const handleSetupWebhook = async () => {
    if (!telegramBotToken) {
      toast({ title: 'يرجى إدخال توكين البوت أولاً', variant: 'destructive' });
      return;
    }
    
    setSettingUpWebhook(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: { action: 'setup', botToken: telegramBotToken }
      });
      
      if (error) throw error;
      toast({ title: 'تم تفعيل Webhook بنجاح', description: 'أرسل /start للبوت لربط حسابك' });
    } catch (error) {
      console.error('Webhook setup error:', error);
      toast({ title: 'خطأ في تفعيل Webhook', variant: 'destructive' });
    } finally {
      setSettingUpWebhook(false);
    }
  };

  const handleSaveTelegram = async () => {
    setSavingTelegram(true);
    try {
      // Check if sensitive_settings record exists
      const { data: existing } = await supabase
        .from('sensitive_settings')
        .select('id')
        .maybeSingle();
      
      if (existing) {
        // Update existing record
        const { error } = await supabase.from('sensitive_settings').update({
          telegram_bot_token: telegramBotToken || null,
          telegram_chat_id: telegramChatId || null,
          telegram_bot_password: telegramBotPassword || null,
          updated_at: new Date().toISOString()
        }).eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase.from('sensitive_settings').insert({
          telegram_bot_token: telegramBotToken || null,
          telegram_chat_id: telegramChatId || null,
          telegram_bot_password: telegramBotPassword || null
        });
        
        if (error) throw error;
      }
      
      toast({ title: 'تم حفظ إعدادات تيليجرام بنجاح' });
    } catch (error) {
      console.error('Error saving telegram settings:', error);
      toast({ title: 'خطأ في حفظ الإعدادات', variant: 'destructive' });
    } finally {
      setSavingTelegram(false);
    }
  };

  const fetchStorageInfo = async () => {
    setLoadingStorage(true);
    try {
      const { data: files, error } = await supabase.storage.from('product-images').list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      
      if (error) throw error;
      
      let totalSize = 0;
      const fileDetails = (files || []).map(file => {
        const size = (file.metadata as any)?.size || 0;
        totalSize += size;
        return {
          name: file.name,
          size: size,
          type: file.metadata?.mimetype || 'unknown'
        };
      });
      
      setStorageInfo({
        totalSize,
        fileCount: fileDetails.length,
        files: fileDetails
      });
    } catch (error) {
      console.error('Error fetching storage info:', error);
      toast({ title: 'خطأ في جلب معلومات التخزين', variant: 'destructive' });
    } finally {
      setLoadingStorage(false);
    }
  };

  const fetchDbInfo = async () => {
    setLoadingDb(true);
    try {
      const [products, categories, brands, orders, pageViews, productViews] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('brands').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('page_views').select('id', { count: 'exact', head: true }),
        supabase.from('product_views').select('id', { count: 'exact', head: true }),
      ]);
      
      setDbInfo({
        products: products.count || 0,
        categories: categories.count || 0,
        brands: brands.count || 0,
        orders: orders.count || 0,
        pageViews: pageViews.count || 0,
        productViews: productViews.count || 0,
      });
    } catch (error) {
      console.error('Error fetching db info:', error);
      toast({ title: 'خطأ في جلب معلومات قاعدة البيانات', variant: 'destructive' });
    } finally {
      setLoadingDb(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميغابايت', 'غيغابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Storage: 1GB limit
  const STORAGE_LIMIT = 1 * 1024 * 1024 * 1024;
  const storagePercentage = storageInfo ? (storageInfo.totalSize / STORAGE_LIMIT) * 100 : 0;
  
  // Database: 500MB limit
  const DB_LIMIT = 500 * 1024 * 1024;
  // Estimate DB size based on record counts (rough estimate)
  const estimatedDbSize = dbInfo ? 
    (dbInfo.products * 2048) + // ~2KB per product
    (dbInfo.categories * 512) + // ~0.5KB per category
    (dbInfo.brands * 512) + // ~0.5KB per brand
    (dbInfo.orders * 1024) + // ~1KB per order
    (dbInfo.pageViews * 256) + // ~0.25KB per page view
    (dbInfo.productViews * 256) // ~0.25KB per product view
    : 0;
  const dbPercentage = (estimatedDbSize / DB_LIMIT) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات المتقدمة</h1>
        <p className="text-muted-foreground mt-2">إعدادات تقنية ومتقدمة للمتجر</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* قفل صفحة الإعداد */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              أمان صفحة الإعداد
            </CardTitle>
            <CardDescription>قفل صفحة الإعداد لمنع أي شخص من إعادة تكوين المتجر</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">قفل صفحة الإعداد</p>
                <p className="text-sm text-muted-foreground">
                  بعد التفعيل، لن يستطيع أي شخص الوصول لصفحة /setup
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch 
                  checked={setupLocked}
                  onCheckedChange={handleToggleSetupLock}
                  disabled={savingSetupLock}
                />
                <Button
                  variant={setupLocked ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleToggleSetupLock(!setupLocked)}
                  disabled={savingSetupLock}
                  className="gap-2"
                >
                  {savingSetupLock ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : setupLocked ? (
                    <>
                      <LockOpen className="h-4 w-4" />
                      فتح القفل
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      قفل الآن
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {setupLocked && (
              <Alert className="border-orange-500/50 bg-orange-500/10">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-700 dark:text-orange-300">
                  صفحة الإعداد مقفلة. يمكنك إلغاء القفل من هنا فقط.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* إعادة تعيين الاتصال */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <RotateCcw className="h-5 w-5" />
              إعادة تعيين الاتصال بقاعدة البيانات
            </CardTitle>
            <CardDescription>
              قم بإعادة تكوين الاتصال بحساب Supabase جديد أو إعادة إعداد المتجر من البداية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                <strong>تحذير:</strong> هذا الإجراء سيقوم بـ:
                <ul className="list-disc list-inside mt-2 mr-4 space-y-1">
                  <li>مسح جميع بيانات الاتصال الحالية</li>
                  <li>تسجيل خروجك من حسابك</li>
                  <li>إعادتك لصفحة الإعداد لربط حساب Supabase جديد</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">متى تستخدم هذه الميزة؟</h4>
              <ul className="text-sm text-muted-foreground space-y-2 mr-4">
                <li>✓ عند الرغبة في ربط حساب Supabase جديد</li>
                <li>✓ عند الانتقال لمشروع Supabase آخر</li>
                <li>✓ عند مواجهة مشاكل في الاتصال بقاعدة البيانات</li>
                <li>✓ عند الرغبة في البدء من جديد بقاعدة بيانات فارغة</li>
              </ul>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <RotateCcw className="h-4 w-4" />
                  إعادة تعيين الاتصال والذهاب لصفحة الإعداد
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد من إعادة التعيين؟</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      سيتم مسح جميع بيانات الاتصال المحلية وتسجيل خروجك.
                    </p>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      تأكد من حفظ بيانات الاتصال الحالية إذا كنت ستحتاجها لاحقاً!
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleResetConnection}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    نعم، إعادة التعيين
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* إشعارات تيليجرام */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              إشعارات تيليجرام
            </CardTitle>
            <CardDescription>ربط بوت تيليجرام لإشعارات الطلبات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bot Token</Label>
              <Input 
                type="password"
                value={telegramBotToken} 
                onChange={e => setTelegramBotToken(e.target.value)} 
                placeholder="توكين البوت من @BotFather" 
                dir="ltr" 
              />
            </div>
            <div className="space-y-2">
              <Label>Chat ID</Label>
              <Input 
                value={telegramChatId} 
                onChange={e => setTelegramChatId(e.target.value)} 
                placeholder="يتم ملؤه تلقائياً" 
                dir="ltr" 
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة مرور البوت</Label>
              <Input 
                type="password"
                value={telegramBotPassword} 
                onChange={e => setTelegramBotPassword(e.target.value)} 
                placeholder="كلمة مرور لحماية البوت" 
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveTelegram} disabled={savingTelegram} className="flex-1">
                {savingTelegram ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </Button>
              <Button onClick={handleSetupWebhook} disabled={settingUpWebhook || !telegramBotToken} variant="outline">
                {settingUpWebhook ? 'جاري التفعيل...' : 'تفعيل Webhook'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* مساحة التخزين */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              مساحة تخزين الصور
            </CardTitle>
            <CardDescription>معلومات عن مساحة تخزين الصور (1 غيغابايت)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchStorageInfo}
                disabled={loadingStorage}
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${loadingStorage ? 'animate-spin' : ''}`} />
                {loadingStorage ? 'جاري التحميل...' : 'تحديث'}
              </Button>
            </div>
            
            {storageInfo ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>المستخدم: {formatBytes(storageInfo.totalSize)}</span>
                    <span>المتاح: 1 غيغابايت</span>
                  </div>
                  <Progress value={storagePercentage} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center">
                    {storagePercentage.toFixed(1)}% مستخدم من المساحة المتاحة
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <FileImage className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{storageInfo.fileCount}</p>
                    <p className="text-sm text-muted-foreground">ملف مخزن</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <HardDrive className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{formatBytes(storageInfo.totalSize)}</p>
                    <p className="text-sm text-muted-foreground">حجم الملفات</p>
                  </div>
                </div>
                
                {/* تفاصيل الملفات */}
                <div className="space-y-2">
                  <Label className="text-sm">آخر الملفات المرفوعة</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {storageInfo.files.slice(0, 10).map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-muted/30 rounded p-2">
                        <span className="truncate max-w-[200px]" title={file.name}>{file.name}</span>
                        <span className="text-muted-foreground">{formatBytes(file.size)}</span>
                      </div>
                    ))}
                    {storageInfo.files.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        و {storageInfo.files.length - 10} ملفات أخرى...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <HardDrive className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>اضغط على "تحديث" لعرض معلومات التخزين</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* مساحة قاعدة البيانات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              مساحة قاعدة البيانات
            </CardTitle>
            <CardDescription>معلومات عن حجم البيانات المخزنة (500 ميغابايت)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchDbInfo}
                disabled={loadingDb}
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${loadingDb ? 'animate-spin' : ''}`} />
                {loadingDb ? 'جاري التحميل...' : 'تحديث'}
              </Button>
            </div>
            
            {dbInfo ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>المستخدم تقريباً: {formatBytes(estimatedDbSize)}</span>
                    <span>المتاح: 500 ميغابايت</span>
                  </div>
                  <Progress value={Math.min(dbPercentage, 100)} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center">
                    {dbPercentage.toFixed(2)}% مستخدم تقريباً من المساحة المتاحة
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold">{dbInfo.products}</p>
                    <p className="text-xs text-muted-foreground">منتج</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold">{dbInfo.categories}</p>
                    <p className="text-xs text-muted-foreground">تصنيف</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold">{dbInfo.brands}</p>
                    <p className="text-xs text-muted-foreground">براند</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold">{dbInfo.orders}</p>
                    <p className="text-xs text-muted-foreground">طلب</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold">{dbInfo.pageViews}</p>
                    <p className="text-xs text-muted-foreground">زيارة صفحة</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold">{dbInfo.productViews}</p>
                    <p className="text-xs text-muted-foreground">مشاهدة منتج</p>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground text-center bg-muted/30 rounded p-2">
                  💡 هذا تقدير تقريبي. المساحة الفعلية قد تختلف قليلاً.
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>اضغط على "تحديث" لعرض معلومات قاعدة البيانات</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAdvancedSettings;