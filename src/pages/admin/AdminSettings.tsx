import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, MessageCircle, Image, Trash2, Instagram, Send, Settings2, HardDrive, Database, FileImage, RefreshCw, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { compressImageToFile } from '@/lib/imageCompression';
import { useAuth } from '@/contexts/AuthContext';

const AdminSettings = () => {
  const { settings, loading } = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Store info
  const [storeName, setStoreName] = useState('');
  const [location, setLocation] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [storePhone, setStorePhone] = useState('');
  
  // WhatsApp
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('972');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  // Delivery
  const [deliveryWestBank, setDeliveryWestBank] = useState('20');
  const [deliveryJerusalem, setDeliveryJerusalem] = useState('50');
  const [deliveryInside, setDeliveryInside] = useState('70');
  
  // Banners
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  // Social media
  const [socialWhatsapp, setSocialWhatsapp] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialSnapchat, setSocialSnapchat] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');
  
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name);
      setLocation((settings as any).location || '');
      setLogoUrl(settings.logo_url);
      setFaviconUrl((settings as any).favicon_url || null);
      setStorePhone((settings as any).store_phone || '');
      setWhatsappCountryCode((settings as any).whatsapp_country_code || '972');
      setWhatsappNumber((settings as any).whatsapp_number || '');
      setDeliveryWestBank(String((settings as any).delivery_west_bank || '20'));
      setDeliveryJerusalem(String((settings as any).delivery_jerusalem || '50'));
      setDeliveryInside(String((settings as any).delivery_inside || '70'));
      setBannerImages((settings as any).banner_images || []);
      setSocialWhatsapp((settings as any).social_whatsapp || '');
      setSocialInstagram((settings as any).social_instagram || '');
      setSocialFacebook((settings as any).social_facebook || '');
      setSocialSnapchat((settings as any).social_snapchat || '');
      setSocialTiktok((settings as any).social_tiktok || '');
      setTelegramBotToken((settings as any).telegram_bot_token || '');
      setTelegramChatId((settings as any).telegram_chat_id || '');
      setTelegramBotPassword((settings as any).telegram_bot_password || '');
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const compressedFile = await compressImageToFile(file);
      const fileName = `logo-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setLogoUrl(publicUrl);
      toast({ title: 'تم رفع الشعار بنجاح' });
    } catch (error) {
      toast({ title: 'خطأ في رفع الشعار', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingFavicon(true);
    try {
      const compressedFile = await compressImageToFile(file, 256, 256, 0.9);
      const fileName = `favicon-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setFaviconUrl(publicUrl);
      toast({ title: 'تم رفع أيقونة المتجر بنجاح' });
    } catch (error) {
      toast({ title: 'خطأ في رفع الأيقونة', variant: 'destructive' });
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingBanner(true);
    try {
      const compressedFile = await compressImageToFile(file, 1920, 1080, 0.85);
      const fileName = `banner-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setBannerImages([...bannerImages, publicUrl]);
      toast({ title: 'تم رفع صورة البانر بنجاح' });
    } catch (error) {
      toast({ title: 'خطأ في رفع البانر', variant: 'destructive' });
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
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

  // Free tier limit is 1GB
  const FREE_TIER_LIMIT = 1 * 1024 * 1024 * 1024; // 1GB in bytes
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
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({ title: 'خطأ في تحديث كلمة المرور', description: error.message, variant: 'destructive' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('settings').update({
        store_name: storeName,
        logo_url: logoUrl,
        favicon_url: faviconUrl,
        location: location,
        store_phone: storePhone,
        whatsapp_country_code: whatsappCountryCode,
        whatsapp_number: whatsappNumber,
        delivery_west_bank: parseFloat(deliveryWestBank),
        delivery_jerusalem: parseFloat(deliveryJerusalem),
        delivery_inside: parseFloat(deliveryInside),
        banner_images: bannerImages,
        social_whatsapp: socialWhatsapp || null,
        social_instagram: socialInstagram || null,
        social_facebook: socialFacebook || null,
        social_snapchat: socialSnapchat || null,
        social_tiktok: socialTiktok || null,
        telegram_bot_token: telegramBotToken || null,
        telegram_chat_id: telegramChatId || null,
        telegram_bot_password: telegramBotPassword || null,
        updated_at: new Date().toISOString()
      }).eq('id', settings?.id);
      
      if (error) throw error;
      toast({ title: 'تم حفظ الإعدادات بنجاح' });
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ title: 'خطأ في حفظ الإعدادات', variant: 'destructive' });
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
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-2">إدارة إعدادات المتجر الأساسية</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* معلومات المتجر */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات المتجر</CardTitle>
            <CardDescription>معلومات المتجر الأساسية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* شعار المتجر */}
            <div className="space-y-2">
              <Label>شعار المتجر</Label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative">
                    <img src={logoUrl} alt="شعار المتجر" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
                    <button onClick={() => setLogoUrl(null)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                  <p className="text-sm text-muted-foreground mt-1">{uploading ? 'جاري الرفع...' : 'اختر صورة للشعار'}</p>
                </div>
              </div>
            </div>

            {/* أيقونة المتجر */}
            <div className="space-y-2">
              <Label>أيقونة المتجر (Favicon)</Label>
              <div className="flex items-center gap-4">
                {faviconUrl ? (
                  <div className="relative">
                    <img src={faviconUrl} alt="أيقونة" className="w-16 h-16 rounded-lg object-cover border-2 border-primary/20" />
                    <button onClick={() => setFaviconUrl(null)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleFaviconUpload} disabled={uploadingFavicon} />
                  <p className="text-sm text-muted-foreground mt-1">{uploadingFavicon ? 'جاري الرفع...' : 'أيقونة تظهر في المتصفح'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeName">اسم المتجر</Label>
              <Input id="storeName" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="اسم متجرك" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">الموقع</Label>
              <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="مثال: فلسطين" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storePhone">رقم هاتف المتجر</Label>
              <Input id="storePhone" type="tel" value={storePhone} onChange={e => setStorePhone(e.target.value)} placeholder="0591234567" />
            </div>
          </CardContent>
        </Card>

        {/* إعدادات واتساب */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              إعدادات واتساب
            </CardTitle>
            <CardDescription>رقم واتساب لاستقبال الطلبات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>رمز الدولة</Label>
              <Select value={whatsappCountryCode} onValueChange={setWhatsappCountryCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="972">+972 (فلسطين)</SelectItem>
                  <SelectItem value="970">+970 (فلسطين)</SelectItem>
                  <SelectItem value="966">+966 (السعودية)</SelectItem>
                  <SelectItem value="962">+962 (الأردن)</SelectItem>
                  <SelectItem value="20">+20 (مصر)</SelectItem>
                  <SelectItem value="971">+971 (الإمارات)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>رقم واتساب</Label>
              <Input 
                type="tel" 
                value={whatsappNumber} 
                onChange={e => setWhatsappNumber(e.target.value.replace(/\D/g, ''))} 
                placeholder="123456789" 
              />
              <p className="text-sm text-muted-foreground">الرقم الكامل: +{whatsappCountryCode}{whatsappNumber}</p>
            </div>
          </CardContent>
        </Card>

        {/* أسعار التوصيل */}
        <Card>
          <CardHeader>
            <CardTitle>أسعار التوصيل</CardTitle>
            <CardDescription>أسعار التوصيل للمناطق المختلفة (بالشيكل)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>الضفة الغربية</Label>
                <Input type="number" value={deliveryWestBank} onChange={e => setDeliveryWestBank(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>القدس</Label>
                <Input type="number" value={deliveryJerusalem} onChange={e => setDeliveryJerusalem(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>الداخل (48)</Label>
                <Input type="number" value={deliveryInside} onChange={e => setDeliveryInside(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* صور البانر */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              صور البانر
            </CardTitle>
            <CardDescription>إدارة صور البانر الرئيسي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bannerImages.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{bannerImages.length} صور</span>
                  <Button variant="destructive" size="sm" onClick={() => setBannerImages([])}>
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف الكل
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {bannerImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img} alt={`بانر ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                      <button 
                        onClick={() => setBannerImages(bannerImages.filter((_, i) => i !== index))} 
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div>
              <Input type="file" accept="image/*" onChange={handleBannerUpload} disabled={uploadingBanner} />
              <p className="text-sm text-muted-foreground mt-1">{uploadingBanner ? 'جاري الرفع...' : 'أضف صورة للبانر'}</p>
            </div>
          </CardContent>
        </Card>

        {/* روابط التواصل */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              روابط التواصل الاجتماعي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>واتساب</Label>
              <Input value={socialWhatsapp} onChange={e => setSocialWhatsapp(e.target.value)} placeholder="https://wa.me/..." dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>انستغرام</Label>
              <Input value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/..." dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>فيسبوك</Label>
              <Input value={socialFacebook} onChange={e => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/..." dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>سناب شات</Label>
              <Input value={socialSnapchat} onChange={e => setSocialSnapchat(e.target.value)} placeholder="https://snapchat.com/..." dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>تيك توك</Label>
              <Input value={socialTiktok} onChange={e => setSocialTiktok(e.target.value)} placeholder="https://tiktok.com/..." dir="ltr" />
            </div>
          </CardContent>
        </Card>

        {/* إعدادات متقدمة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              إعدادات متقدمة
            </CardTitle>
            <CardDescription>إعدادات تقنية ومتقدمة للمتجر</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* تيليجرام */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">إشعارات تيليجرام</Label>
              </div>
              <p className="text-sm text-muted-foreground">ربط بوت تيليجرام لإشعارات الطلبات</p>
              
              <div className="space-y-4 bg-muted/30 rounded-lg p-4">
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
                <Button onClick={handleSetupWebhook} disabled={settingUpWebhook || !telegramBotToken} variant="outline" className="w-full">
                  {settingUpWebhook ? 'جاري التفعيل...' : 'تفعيل Webhook'}
                </Button>
              </div>
            </div>

            <Separator />
            
            {/* تغيير بيانات الحساب */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">إعدادات الحساب</Label>
              </div>
              <p className="text-sm text-muted-foreground">تغيير البريد الإلكتروني وكلمة المرور للأدمن</p>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                {/* البريد الإلكتروني الحالي */}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">البريد الحالي:</span>
                  <span className="font-medium" dir="ltr">{user?.email}</span>
                </div>
                
                {/* تغيير البريد الإلكتروني */}
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
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                {/* تغيير كلمة المرور */}
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
                  variant="outline"
                  className="w-full"
                >
                  {updatingPassword ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* مساحة التخزين */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">مساحة التخزين</Label>
                </div>
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
            </div>
          </CardContent>
        </Card>

        {/* زر الحفظ */}
        <Button onClick={handleSave} size="lg" className="w-full md:w-auto">
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
