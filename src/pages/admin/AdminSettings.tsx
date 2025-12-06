import { useState, useEffect } from 'react';
import { useSettings, accentColors } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Palette, Upload, X, MessageCircle, Image, Trash2, Instagram, Check, Sparkles, Paintbrush, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ThemePreview from '@/components/ThemePreview';
import { compressImageToFile, isImageFile } from '@/lib/imageCompression';
const themes = [{
  id: 'default',
  name: 'كلاسيكي (أبيض وأسود)',
  colors: 'أبيض وأسود',
  noGradient: true
}, {
  id: 'night',
  name: 'ليلي',
  colors: 'أزرق داكن مع بنفسجي',
  noGradient: false
}, {
  id: 'day',
  name: 'نهاري',
  colors: 'برتقالي ساطع مع أصفر',
  noGradient: false
}, {
  id: 'pink',
  name: 'زهري',
  colors: 'وردي مع فوشيا',
  noGradient: false
}, {
  id: 'green',
  name: 'أخضر',
  colors: 'أخضر زمردي',
  noGradient: false
}, {
  id: 'orange',
  name: 'برتقالي',
  colors: 'برتقالي دافئ',
  noGradient: false
}, {
  id: 'ocean',
  name: 'محيطي',
  colors: 'أزرق سماوي',
  noGradient: true
}, {
  id: 'lavender',
  name: 'لافندر',
  colors: 'بنفسجي فاتح',
  noGradient: true
}, {
  id: 'coral',
  name: 'مرجاني',
  colors: 'مرجاني مع وردي',
  noGradient: false
}, {
  id: 'mint',
  name: 'نعناعي',
  colors: 'أخضر نعناعي',
  noGradient: true
}, {
  id: 'sunset',
  name: 'غروب',
  colors: 'برتقالي مع أحمر',
  noGradient: false
}, {
  id: 'slate',
  name: 'رمادي',
  colors: 'رمادي مزرق',
  noGradient: true
}, {
  id: 'cherry',
  name: 'كرزي',
  colors: 'أحمر كرزي مع وردي',
  noGradient: false
}, {
  id: 'forest',
  name: 'غابة',
  colors: 'أخضر غامق مع زيتي',
  noGradient: false
}, {
  id: 'gold',
  name: 'ذهبي',
  colors: 'ذهبي مع برتقالي',
  noGradient: false
}, {
  id: 'ruby',
  name: 'ياقوتي',
  colors: 'أحمر ياقوتي',
  noGradient: true
}, {
  id: 'sky',
  name: 'سماوي',
  colors: 'أزرق سماوي فاتح',
  noGradient: true
}, {
  id: 'plum',
  name: 'برقوقي',
  colors: 'بنفسجي غامق',
  noGradient: false
}, {
  id: 'teal',
  name: 'فيروزي',
  colors: 'فيروزي داكن',
  noGradient: true
}, {
  id: 'rose',
  name: 'وردي فاتح',
  colors: 'وردي فاتح مع زهري',
  noGradient: false
}, {
  id: 'cocoa',
  name: 'كاكاو',
  colors: 'بني دافئ',
  noGradient: true
}];
const animationEffects = [{
  id: 'none',
  name: 'بدون تأثير',
  icon: '✕'
}, {
  id: 'snow',
  name: 'ثلج',
  icon: '❄️'
}, {
  id: 'stars',
  name: 'نجوم',
  icon: '⭐'
}, {
  id: 'hearts',
  name: 'قلوب',
  icon: '❤️'
}, {
  id: 'confetti',
  name: 'احتفال',
  icon: '🎊'
}, {
  id: 'bubbles',
  name: 'فقاعات',
  icon: '🫧'
}, {
  id: 'leaves',
  name: 'أوراق',
  icon: '🍃'
}];
const accentColorOptions = [{
  id: 'default',
  name: 'حسب الثيم',
  color: 'var(--gradient-primary)'
}, {
  id: 'blue',
  name: 'أزرق',
  color: 'hsl(210, 100%, 50%)'
}, {
  id: 'red',
  name: 'أحمر',
  color: 'hsl(0, 85%, 55%)'
}, {
  id: 'green',
  name: 'أخضر',
  color: 'hsl(145, 80%, 42%)'
}, {
  id: 'purple',
  name: 'بنفسجي',
  color: 'hsl(270, 70%, 55%)'
}, {
  id: 'orange',
  name: 'برتقالي',
  color: 'hsl(25, 95%, 53%)'
}, {
  id: 'pink',
  name: 'وردي',
  color: 'hsl(330, 85%, 60%)'
}, {
  id: 'teal',
  name: 'فيروزي',
  color: 'hsl(175, 75%, 40%)'
}, {
  id: 'yellow',
  name: 'أصفر',
  color: 'hsl(45, 95%, 50%)'
}, {
  id: 'indigo',
  name: 'نيلي',
  color: 'hsl(245, 70%, 55%)'
}, {
  id: 'rose',
  name: 'وردي غامق',
  color: 'hsl(350, 90%, 60%)'
}, {
  id: 'cyan',
  name: 'سماوي',
  color: 'hsl(190, 90%, 45%)'
}, {
  id: 'amber',
  name: 'كهرماني',
  color: 'hsl(38, 92%, 50%)'
}, {
  id: 'lime',
  name: 'ليموني',
  color: 'hsl(84, 80%, 45%)'
}, {
  id: 'emerald',
  name: 'زمردي',
  color: 'hsl(158, 64%, 42%)'
}, {
  id: 'black',
  name: 'أسود',
  color: 'hsl(0, 0%, 15%)'
}];
const AdminSettings = () => {
  const {
    settings,
    loading,
    applyTheme,
    applyAccentColor
  } = useSettings();
  const {
    toast
  } = useToast();
  const [storeName, setStoreName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [storePhone, setStorePhone] = useState('');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('972');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [deliveryWestBank, setDeliveryWestBank] = useState('20');
  const [deliveryJerusalem, setDeliveryJerusalem] = useState('50');
  const [deliveryInside, setDeliveryInside] = useState('70');
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [storeNameBlack, setStoreNameBlack] = useState(false);
  const [animationEffect, setAnimationEffect] = useState('none');
  const [accentColor, setAccentColor] = useState('default');
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
  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name);
      setSelectedTheme(settings.theme);
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
      setStoreNameBlack((settings as any).store_name_black || false);
      setAnimationEffect((settings as any).animation_effect || 'none');
      setAccentColor((settings as any).accent_color || 'default');
      // Social media
      setSocialWhatsapp((settings as any).social_whatsapp || '');
      setSocialInstagram((settings as any).social_instagram || '');
      setSocialFacebook((settings as any).social_facebook || '');
      setSocialSnapchat((settings as any).social_snapchat || '');
      setSocialTiktok((settings as any).social_tiktok || '');
      // Telegram
      setTelegramBotToken((settings as any).telegram_bot_token || '');
      setTelegramChatId((settings as any).telegram_chat_id || '');
      setTelegramBotPassword((settings as any).telegram_bot_password || '');
    }
  }, [settings]);

  // Apply preview theme when hovering
  const handleThemePreview = (themeId: string) => {
    setPreviewTheme(themeId);
    applyTheme(themeId);
    // Reset accent to see theme's default
    applyAccentColor(accentColor === 'default' ? null : accentColor);
  };

  // Reset to selected theme when not hovering
  const handleThemePreviewEnd = () => {
    setPreviewTheme(null);
    applyTheme(selectedTheme);
    applyAccentColor(accentColor === 'default' ? null : accentColor);
  };

  // Select theme
  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    setPreviewTheme(null);
    applyTheme(themeId);
    applyAccentColor(accentColor === 'default' ? null : accentColor);
  };

  // Handle accent color change
  const handleAccentColorChange = (colorId: string) => {
    setAccentColor(colorId);
    applyAccentColor(colorId === 'default' ? null : colorId);
  };
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار صورة فقط',
        variant: 'destructive'
      });
      return;
    }
    setUploading(true);
    try {
      // Compress image before upload
      toast({ title: 'جاري ضغط الصورة...' });
      const compressedFile = await compressImageToFile(file);
      const fileName = `logo-${Date.now()}.webp`;
      const {
        error: uploadError
      } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setLogoUrl(publicUrl);
      toast({
        title: 'تم الرفع',
        description: 'تم رفع الشعار بنجاح'
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'خطأ',
        description: 'فشل رفع الشعار',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };
  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار صورة فقط',
        variant: 'destructive'
      });
      return;
    }
    setUploadingFavicon(true);
    try {
      // Compress favicon (smaller size for icons)
      toast({ title: 'جاري ضغط الصورة...' });
      const compressedFile = await compressImageToFile(file, 256, 256, 0.9);
      const fileName = `favicon-${Date.now()}.webp`;
      const {
        error: uploadError
      } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setFaviconUrl(publicUrl);
      toast({
        title: 'تم الرفع',
        description: 'تم رفع أيقونة المتجر بنجاح'
      });
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast({
        title: 'خطأ',
        description: 'فشل رفع أيقونة المتجر',
        variant: 'destructive'
      });
    } finally {
      setUploadingFavicon(false);
    }
  };
  const handleRemoveFavicon = () => {
    setFaviconUrl(null);
  };
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار صورة فقط',
        variant: 'destructive'
      });
      return;
    }
    setUploadingBanner(true);
    try {
      // Compress banner (larger size for banners)
      toast({ title: 'جاري ضغط الصورة...' });
      const compressedFile = await compressImageToFile(file, 1920, 1080, 0.85);
      const fileName = `banner-${Date.now()}.webp`;
      const {
        error: uploadError
      } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setBannerImages([...bannerImages, publicUrl]);
      toast({
        title: 'تم الرفع',
        description: 'تم رفع صورة البانر بنجاح'
      });
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: 'خطأ',
        description: 'فشل رفع صورة البانر',
        variant: 'destructive'
      });
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
    }
  };
  const handleRemoveBanner = (index: number) => {
    const newBanners = bannerImages.filter((_, i) => i !== index);
    setBannerImages(newBanners);
  };
  const handleClearAllBanners = () => {
    setBannerImages([]);
    toast({
      title: 'تم الحذف',
      description: 'تم حذف جميع صور البانر'
    });
  };
  const handleSave = async () => {
    try {
      const {
        error
      } = await supabase.from('settings').update({
        store_name: storeName,
        theme: selectedTheme,
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
        store_name_black: storeNameBlack,
        animation_effect: animationEffect === 'none' ? null : animationEffect,
        accent_color: accentColor === 'default' ? null : accentColor,
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
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الإعدادات بنجاح'
      });
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ الإعدادات',
        variant: 'destructive'
      });
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-2">إدارة إعدادات المتجر والمظهر</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* المظهر والثيم */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              ثيم الخلفية
            </CardTitle>
            <CardDescription>اختر مظهر وألوان الخلفية للمتجر</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* معاينة الثيم */}
            <div className="mb-6">
              <Label className="text-base font-medium mb-3 block">معاينة الثيم المختار</Label>
              
            </div>

            {/* اختيار الثيم */}
            <div>
              <Label className="text-base font-medium mb-3 block">اختر ثيم الخلفية</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {themes.map(theme => <button key={theme.id} onClick={() => handleThemeSelect(theme.id)} onMouseEnter={() => handleThemePreview(theme.id)} onMouseLeave={handleThemePreviewEnd} className={`p-3 rounded-lg border-2 text-right transition-all hover:scale-[1.02] ${selectedTheme === theme.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">{theme.name}</div>
                      {selectedTheme === theme.id && <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{theme.colors}</div>
                  </button>)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* لون الأزرار */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5" />
              لون الأزرار والعناصر التفاعلية
            </CardTitle>
            <CardDescription>اختر لوناً منفصلاً للأزرار بشكل مستقل عن ثيم الخلفية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {accentColorOptions.map(color => <button key={color.id} onClick={() => handleAccentColorChange(color.id)} className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105 ${accentColor === color.id ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'}`}>
                  <div className="w-8 h-8 rounded-full border-2 border-background shadow-sm" style={{
                background: color.color
              }} />
                  <span className="text-xs font-medium text-center">{color.name}</span>
                  {accentColor === color.id && <Check className="h-3 w-3 text-primary" />}
                </button>)}
            </div>
            <p className="text-sm text-muted-foreground">
              اختر "حسب الثيم" لاستخدام لون الأزرار الافتراضي للثيم المختار
            </p>
          </CardContent>
        </Card>

        {/* خيارات إضافية للمظهر */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              خيارات المظهر الإضافية
            </CardTitle>
            <CardDescription>تخصيصات إضافية للمظهر</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* خيار إبقاء اسم المتجر أسود */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="storeNameBlack" className="text-base font-medium">
                  إبقاء اسم المتجر أسود
                </Label>
                <p className="text-sm text-muted-foreground">
                  عند التفعيل، سيظهر اسم المتجر باللون الأسود بدلاً من لون الثيم
                </p>
              </div>
              <Switch id="storeNameBlack" checked={storeNameBlack} onCheckedChange={setStoreNameBlack} />
            </div>

            {/* التأثيرات المتحركة */}
            <div>
              <Label className="text-base font-medium mb-3 flex items-center gap-2">
                التأثيرات المتحركة
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                أضف تأثيرات متحركة على خلفية الموقع (مثل ثلج، نجوم، قلوب...)
              </p>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {animationEffects.map(effect => <button key={effect.id} onClick={() => setAnimationEffect(effect.id)} className={`p-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${animationEffect === effect.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-primary/50'}`}>
                    <div className="text-2xl mb-1">{effect.icon}</div>
                    <div className="text-xs font-medium">{effect.name}</div>
                  </button>)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات المتجر</CardTitle>
            <CardDescription>تخصيص معلومات المتجر الأساسية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* شعار المتجر */}
            <div className="space-y-2">
              <Label>شعار المتجر</Label>
              <div className="flex items-center gap-4">
                {logoUrl ? <div className="relative">
                    <img src={logoUrl} alt="شعار المتجر" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
                    <button onClick={handleRemoveLogo} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90">
                      <X className="h-4 w-4" />
                    </button>
                  </div> : <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} className="cursor-pointer" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploading ? 'جاري الرفع...' : 'اختر صورة للشعار'}
                  </p>
                </div>
              </div>
            </div>

            {/* أيقونة المتجر (Favicon) */}
            <div className="space-y-2">
              <Label>أيقونة المتجر (Favicon)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                هذه الأيقونة تظهر في شريط المتصفح بجانب عنوان الصفحة
              </p>
              <div className="flex items-center gap-4">
                {faviconUrl ? <div className="relative">
                    <img src={faviconUrl} alt="أيقونة المتجر" className="w-16 h-16 rounded-lg object-cover border-2 border-primary/20" />
                    <button onClick={handleRemoveFavicon} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90">
                      <X className="h-3 w-3" />
                    </button>
                  </div> : <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleFaviconUpload} disabled={uploadingFavicon} className="cursor-pointer" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadingFavicon ? 'جاري الرفع...' : 'اختر صورة للأيقونة (يفضل حجم 32x32 أو 64x64)'}
                  </p>
                </div>
              </div>
            </div>

            {/* اسم المتجر */}
            <div className="space-y-2">
              <Label htmlFor="storeName">اسم المتجر</Label>
              <Input id="storeName" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="اسم متجرك" />
              <p className="text-sm text-muted-foreground">
                سيظهر هذا الاسم في عنوان التبويب وأيقونة الموقع
              </p>
            </div>

            {/* الموقع */}
            <div className="space-y-2">
              <Label htmlFor="location">الموقع</Label>
              <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="مثال: الرياض، المملكة العربية السعودية" />
            </div>
            
            {/* رقم هاتف المتجر */}
            <div className="space-y-2">
              <Label htmlFor="storePhone">رقم هاتف المتجر</Label>
              <Input id="storePhone" type="tel" value={storePhone} onChange={e => setStorePhone(e.target.value)} placeholder="مثال: 0591234567 أو +972591234567" maxLength={20} />
              <p className="text-sm text-muted-foreground">
                الرقم الذي سيتصل به العملاء لإتمام الطلب
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              إعدادات واتساب
            </CardTitle>
            <CardDescription>رقم واتساب المتجر لاستقبال الطلبات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="countryCode">رمز الدولة</Label>
              <Select value={whatsappCountryCode} onValueChange={setWhatsappCountryCode}>
                <SelectTrigger id="countryCode">
                  <SelectValue placeholder="اختر رمز الدولة" />
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
              <Label htmlFor="whatsappNumber">رقم واتساب</Label>
              <Input id="whatsappNumber" type="tel" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value.replace(/\D/g, ''))} placeholder="مثال: 123456789" maxLength={15} />
              <p className="text-sm text-muted-foreground">
                الرقم الكامل: +{whatsappCountryCode}{whatsappNumber}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أسعار التوصيل</CardTitle>
            <CardDescription>تحديد أسعار التوصيل للمناطق المختلفة (بالشيكل)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryWestBank">الضفة الغربية</Label>
                <Input id="deliveryWestBank" type="number" value={deliveryWestBank} onChange={e => setDeliveryWestBank(e.target.value)} placeholder="20" min="0" step="0.01" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryJerusalem">القدس</Label>
                <Input id="deliveryJerusalem" type="number" value={deliveryJerusalem} onChange={e => setDeliveryJerusalem(e.target.value)} placeholder="50" min="0" step="0.01" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryInside">الداخل (48)</Label>
                <Input id="deliveryInside" type="number" value={deliveryInside} onChange={e => setDeliveryInside(e.target.value)} placeholder="70" min="0" step="0.01" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              صور البانر
            </CardTitle>
            <CardDescription>إدارة صور البانر الرئيسي (يُنصح بـ 3-5 صور)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* عرض الصور الحالية */}
            {bannerImages.length > 0 && <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {bannerImages.length} صور مضافة
                  </span>
                  <Button variant="destructive" size="sm" onClick={handleClearAllBanners}>
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف الكل
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {bannerImages.map((img, index) => <div key={index} className="relative group">
                      <img src={img} alt={`بانر ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                      <button onClick={() => handleRemoveBanner(index)} className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded">
                        {index + 1}
                      </span>
                    </div>)}
                </div>
              </>}
            
            {/* زر إضافة صورة */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input type="file" accept="image/*" onChange={handleBannerUpload} disabled={uploadingBanner} className="cursor-pointer" />
                <p className="text-sm text-muted-foreground mt-1">
                  {uploadingBanner ? 'جاري الرفع...' : 'أضف صورة للبانر (حجم مثالي: 1920x600)'}
                </p>
              </div>
            </div>
            
            {bannerImages.length === 0 && <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">لم يتم إضافة صور للبانر بعد</p>
              </div>}
          </CardContent>
        </Card>

        {/* روابط التواصل الاجتماعي */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              روابط التواصل الاجتماعي
            </CardTitle>
            <CardDescription>أضف روابط صفحات التواصل الاجتماعي الخاصة بالمتجر</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="socialWhatsapp">واتساب (رابط أو رقم)</Label>
              <Input id="socialWhatsapp" value={socialWhatsapp} onChange={e => setSocialWhatsapp(e.target.value)} placeholder="مثال: https://wa.me/972591234567" dir="ltr" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="socialInstagram">انستغرام</Label>
              <Input id="socialInstagram" value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)} placeholder="مثال: https://instagram.com/yourstore" dir="ltr" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="socialFacebook">فيسبوك</Label>
              <Input id="socialFacebook" value={socialFacebook} onChange={e => setSocialFacebook(e.target.value)} placeholder="مثال: https://facebook.com/yourstore" dir="ltr" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="socialSnapchat">سناب شات</Label>
              <Input id="socialSnapchat" value={socialSnapchat} onChange={e => setSocialSnapchat(e.target.value)} placeholder="مثال: https://snapchat.com/add/yourstore" dir="ltr" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="socialTiktok">تيك توك</Label>
              <Input id="socialTiktok" value={socialTiktok} onChange={e => setSocialTiktok(e.target.value)} placeholder="مثال: https://tiktok.com/@yourstore" dir="ltr" />
            </div>
          </CardContent>
        </Card>

        {/* إعدادات تيليجرام */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              إشعارات تيليجرام
            </CardTitle>
            <CardDescription>اربط بوت تيليجرام لاستلام إشعارات الطلبات الجديدة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegramBotToken">Bot Token</Label>
              <Input 
                id="telegramBotToken" 
                type="password"
                value={telegramBotToken} 
                onChange={e => setTelegramBotToken(e.target.value)} 
                placeholder="أدخل توكين البوت من @BotFather" 
                dir="ltr" 
              />
              <p className="text-xs text-muted-foreground">
                احصل على التوكين من @BotFather على تيليجرام
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegramBotPassword">كلمة سر البوت (اختياري)</Label>
              <Input 
                id="telegramBotPassword" 
                type="password"
                value={telegramBotPassword} 
                onChange={e => setTelegramBotPassword(e.target.value)} 
                placeholder="أدخل كلمة سر لحماية البوت" 
                dir="ltr" 
              />
              <p className="text-xs text-muted-foreground">
                عند فتح البوت لأول مرة سيُطلب من المستخدم إدخال كلمة السر
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telegramChatId">Chat ID (يُملأ تلقائياً)</Label>
              <Input 
                id="telegramChatId" 
                value={telegramChatId} 
                onChange={e => setTelegramChatId(e.target.value)} 
                placeholder="سيُملأ تلقائياً عند إدخال كلمة السر الصحيحة" 
                dir="ltr"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                سيُحفظ تلقائياً عند إدخال كلمة السر الصحيحة في البوت
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="font-medium text-sm">خطوات الإعداد:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>أنشئ بوت جديد عبر @BotFather واحصل على التوكين</li>
                <li>أدخل التوكين وكلمة السر أعلاه واحفظ</li>
                <li>قم بإعداد الـ Webhook (رابط أدناه)</li>
                <li>افتح البوت وأرسل /start ثم أدخل كلمة السر</li>
              </ol>
              {telegramBotToken && (
                <div className="mt-3 p-2 bg-background rounded border">
                  <p className="text-xs font-medium mb-1">رابط إعداد Webhook:</p>
                  <code className="text-xs break-all text-primary">
                    https://api.telegram.org/bot{telegramBotToken}/setWebhook?url=https://ghsiifbeszsrpqwbpopr.supabase.co/functions/v1/telegram-webhook
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    افتح هذا الرابط في المتصفح لتفعيل الـ Webhook
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} size="lg">
          حفظ التغييرات
        </Button>
      </div>
    </div>;
};
export default AdminSettings;