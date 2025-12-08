import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, HardDrive, Database, FileImage, RefreshCw, Lock, Mail, Eye, EyeOff, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminAdvancedSettings = () => {
  const { settings, loading } = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Telegram
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramBotPassword, setTelegramBotPassword] = useState('');
  const [settingUpWebhook, setSettingUpWebhook] = useState(false);
  
  // Storage info
  const [storageInfo, setStorageInfo] = useState<{
    totalSize: number;
    fileCount: number;
    files: { name: string; size: number; type: string }[];
  } | null>(null);
  const [loadingStorage, setLoadingStorage] = useState(false);
  
  // Password change
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [savingTelegram, setSavingTelegram] = useState(false);

  useEffect(() => {
    if (settings) {
      setTelegramBotToken((settings as any).telegram_bot_token || '');
      setTelegramChatId((settings as any).telegram_chat_id || '');
      setTelegramBotPassword((settings as any).telegram_bot_password || '');
    }
  }, [settings]);

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
      const { error } = await supabase.from('settings').update({
        telegram_bot_token: telegramBotToken || null,
        telegram_chat_id: telegramChatId || null,
        telegram_bot_password: telegramBotPassword || null,
        updated_at: new Date().toISOString()
      }).eq('id', settings?.id);
      
      if (error) throw error;
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميغابايت', 'غيغابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const FREE_TIER_LIMIT = 1 * 1024 * 1024 * 1024;
  const storagePercentage = storageInfo ? (storageInfo.totalSize / FREE_TIER_LIMIT) * 100 : 0;

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast({ title: 'يرجى إدخال البريد الإلكتروني الجديد', variant: 'destructive' });
      return;
    }
    
    setUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast({ title: 'تم إرسال رابط التأكيد', description: 'يرجى التحقق من بريدك الإلكتروني الجديد' });
      setNewEmail('');
    } catch (error: any) {
      console.error('Email update error:', error);
      toast({ title: 'خطأ في تحديث البريد الإلكتروني', description: error.message, variant: 'destructive' });
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: 'يرجى ملء جميع الحقول', variant: 'destructive' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: 'كلمات المرور غير متطابقة', variant: 'destructive' });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({ title: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', variant: 'destructive' });
      return;
    }
    
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: 'تم تحديث كلمة المرور بنجاح' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({ title: 'خطأ في تحديث كلمة المرور', description: error.message, variant: 'destructive' });
    } finally {
      setUpdatingPassword(false);
    }
  };

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

        {/* إعدادات الحساب */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              إعدادات الحساب
            </CardTitle>
            <CardDescription>تغيير البريد الإلكتروني وكلمة المرور للأدمن</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* البريد الإلكتروني */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">البريد الحالي:</span>
                <span className="font-medium" dir="ltr">{user?.email}</span>
              </div>
              
              <div className="space-y-2">
                <Label>البريد الإلكتروني الجديد</Label>
                <div className="flex gap-2">
                  <Input 
                    type="email"
                    value={newEmail} 
                    onChange={e => setNewEmail(e.target.value)} 
                    placeholder="example@email.com" 
                    dir="ltr"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUpdateEmail} 
                    disabled={updatingEmail || !newEmail}
                    variant="outline"
                  >
                    {updatingEmail ? 'جاري...' : 'تحديث'}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* كلمة المرور */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input 
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="كلمة المرور الجديدة" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>تأكيد كلمة المرور الجديدة</Label>
                <Input 
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="أعد إدخال كلمة المرور" 
                />
              </div>
              
              <Button 
                onClick={handleUpdatePassword} 
                disabled={updatingPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {updatingPassword ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* مساحة التخزين */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              مساحة التخزين
            </CardTitle>
            <CardDescription>معلومات عن المساحة المستخدمة</CardDescription>
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
                    <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{storageInfo.fileCount}</p>
                    <p className="text-sm text-muted-foreground">ملف مخزن</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <FileImage className="h-8 w-8 mx-auto mb-2 text-primary" />
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
      </div>
    </div>
  );
};

export default AdminAdvancedSettings;