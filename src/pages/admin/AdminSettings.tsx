import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, X, MessageCircle, Image, Trash2, Instagram, Search, Eye, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { compressImageToFile } from '@/lib/imageCompression';

const AdminSettings = () => {
  const { settings, loading } = useSettings();
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
  
  // SEO settings
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  
  // Welcome Popup
  const [welcomePopupEnabled, setWelcomePopupEnabled] = useState(false);
  const [welcomePopupImageUrl, setWelcomePopupImageUrl] = useState<string | null>(null);
  const [welcomePopupLink, setWelcomePopupLink] = useState('');
  const [welcomePopupShowOnce, setWelcomePopupShowOnce] = useState(true);
  const [uploadingPopupImage, setUploadingPopupImage] = useState(false);

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
      // SEO
      setSeoTitle((settings as any).seo_title || '');
      setSeoDescription((settings as any).seo_description || '');
      setSeoKeywords((settings as any).seo_keywords || '');
      setOgImageUrl((settings as any).og_image_url || null);
      // Welcome Popup
      setWelcomePopupEnabled((settings as any).welcome_popup_enabled || false);
      setWelcomePopupImageUrl((settings as any).welcome_popup_image_url || null);
      setWelcomePopupLink((settings as any).welcome_popup_link || '');
      setWelcomePopupShowOnce((settings as any).welcome_popup_show_once !== false);
    }
  }, [settings]);

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingOgImage(true);
    try {
      const compressedFile = await compressImageToFile(file, 1200, 630, 0.9);
      const fileName = `og-image-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setOgImageUrl(publicUrl);
      toast({ title: 'تم رفع صورة المشاركة بنجاح' });
    } catch (error) {
      toast({ title: 'خطأ في رفع الصورة', variant: 'destructive' });
    } finally {
      setUploadingOgImage(false);
    }
  };

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

  const handlePopupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingPopupImage(true);
    try {
      const compressedFile = await compressImageToFile(file, 800, 800, 0.9);
      const fileName = `popup-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setWelcomePopupImageUrl(publicUrl);
      toast({ title: 'تم رفع صورة الإشعار بنجاح' });
    } catch (error) {
      toast({ title: 'خطأ في رفع الصورة', variant: 'destructive' });
    } finally {
      setUploadingPopupImage(false);
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
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        seo_keywords: seoKeywords || null,
        og_image_url: ogImageUrl,
        welcome_popup_enabled: welcomePopupEnabled,
        welcome_popup_image_url: welcomePopupImageUrl,
        welcome_popup_link: welcomePopupLink || null,
        welcome_popup_show_once: welcomePopupShowOnce,
        updated_at: new Date().toISOString()
      }).eq('id', settings?.id);
      
      if (error) throw error;
      // Clear popup storage if popup settings changed
      localStorage.removeItem('welcome_popup_shown');
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

        {/* إعدادات SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              إعدادات SEO ومحركات البحث
            </CardTitle>
            <CardDescription>تحسين ظهور متجرك في نتائج البحث</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان الموقع (Title)</Label>
              <Input 
                value={seoTitle} 
                onChange={e => setSeoTitle(e.target.value)} 
                placeholder="متجري - تسوق أفضل المنتجات"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">{seoTitle.length}/60 حرف - يظهر في تبويب المتصفح ونتائج البحث</p>
            </div>
            
            <div className="space-y-2">
              <Label>وصف الموقع (Description)</Label>
              <Textarea 
                value={seoDescription} 
                onChange={e => setSeoDescription(e.target.value)} 
                placeholder="اكتشف مجموعة واسعة من المنتجات عالية الجودة بأسعار تنافسية"
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{seoDescription.length}/160 حرف - يظهر في نتائج البحث</p>
            </div>
            
            <div className="space-y-2">
              <Label>الكلمات المفتاحية</Label>
              <Input 
                value={seoKeywords} 
                onChange={e => setSeoKeywords(e.target.value)} 
                placeholder="تسوق، منتجات، عروض، توصيل"
              />
              <p className="text-xs text-muted-foreground">افصل بين الكلمات بفاصلة</p>
            </div>
            
            <div className="space-y-2">
              <Label>صورة المشاركة (OG Image)</Label>
              <div className="flex items-center gap-4">
                {ogImageUrl ? (
                  <div className="relative">
                    <img src={ogImageUrl} alt="OG" className="w-40 h-20 rounded-lg object-cover border" />
                    <button onClick={() => setOgImageUrl(null)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleOgImageUpload} disabled={uploadingOgImage} />
                  <p className="text-sm text-muted-foreground mt-1">{uploadingOgImage ? 'جاري الرفع...' : 'صورة تظهر عند مشاركة الموقع (1200×630)'}</p>
                </div>
              </div>
            </div>
            
            {/* معاينة Google */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Eye className="h-3 w-3" />
                معاينة في نتائج البحث
              </p>
              <div className="bg-background p-3 rounded border">
                <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {seoTitle || storeName || 'عنوان الموقع'}
                </p>
                <p className="text-green-700 text-sm">www.yourstore.com</p>
                <p className="text-muted-foreground text-sm">
                  {seoDescription || 'وصف الموقع يظهر هنا...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إشعار الترحيب */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              إشعار الترحيب (Popup)
            </CardTitle>
            <CardDescription>صورة منبثقة تظهر عند فتح الموقع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="popup-enabled">تفعيل الإشعار</Label>
              <Switch
                id="popup-enabled"
                checked={welcomePopupEnabled}
                onCheckedChange={setWelcomePopupEnabled}
              />
            </div>
            
            {welcomePopupEnabled && (
              <>
                <div className="space-y-2">
                  <Label>صورة الإشعار</Label>
                  <div className="flex items-center gap-4">
                    {welcomePopupImageUrl ? (
                      <div className="relative">
                        <img src={welcomePopupImageUrl} alt="Popup" className="w-32 h-32 rounded-lg object-cover border" />
                        <button onClick={() => setWelcomePopupImageUrl(null)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input type="file" accept="image/*" onChange={handlePopupImageUpload} disabled={uploadingPopupImage} />
                      <p className="text-sm text-muted-foreground mt-1">{uploadingPopupImage ? 'جاري الرفع...' : 'صورة العرض أو الإعلان'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>رابط عند الضغط (اختياري)</Label>
                  <Input 
                    value={welcomePopupLink} 
                    onChange={e => setWelcomePopupLink(e.target.value)} 
                    placeholder="/special-offers أو /deals"
                  />
                  <p className="text-xs text-muted-foreground">عند الضغط على الصورة، ينتقل العميل لهذا الرابط</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="popup-once">عرض مرة واحدة فقط</Label>
                    <p className="text-xs text-muted-foreground">إذا فعّلت، يظهر الإشعار مرة واحدة للعميل</p>
                  </div>
                  <Switch
                    id="popup-once"
                    checked={welcomePopupShowOnce}
                    onCheckedChange={setWelcomePopupShowOnce}
                  />
                </div>
              </>
            )}
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