import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Upload, X, MessageCircle, Image, Plus, Trash2, Instagram, Facebook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const themes = [
  { id: 'default', name: 'الافتراضي', colors: 'من #9b87f5 إلى #7E69AB' },
  { id: 'night', name: 'ليلي', colors: 'من #1A1F2C إلى #403E43' },
  { id: 'day', name: 'نهاري', colors: 'من #F97316 إلى #FBBF24' },
  { id: 'pink', name: 'زهري', colors: 'من #EC4899 إلى #F472B6' },
  { id: 'green', name: 'أخضر', colors: 'من #10B981 إلى #34D399' },
  { id: 'orange', name: 'برتقالي', colors: 'من #F59E0B إلى #FB923C' },
];

const AdminSettings = () => {
  const { settings, loading, updateSettings } = useSettings();
  const { toast } = useToast();
  const [storeName, setStoreName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [location, setLocation] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [storePhone, setStorePhone] = useState('');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('972');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [deliveryWestBank, setDeliveryWestBank] = useState('20');
  const [deliveryJerusalem, setDeliveryJerusalem] = useState('50');
  const [deliveryInside, setDeliveryInside] = useState('70');
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  // Social media
  const [socialWhatsapp, setSocialWhatsapp] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialSnapchat, setSocialSnapchat] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name);
      setSelectedTheme(settings.theme);
      setLocation(settings.location || '');
      setLogoUrl(settings.logo_url);
      setStorePhone((settings as any).store_phone || '');
      setWhatsappCountryCode((settings as any).whatsapp_country_code || '972');
      setWhatsappNumber((settings as any).whatsapp_number || '');
      setDeliveryWestBank(String((settings as any).delivery_west_bank || '20'));
      setDeliveryJerusalem(String((settings as any).delivery_jerusalem || '50'));
      setDeliveryInside(String((settings as any).delivery_inside || '70'));
      setBannerImages((settings as any).banner_images || []);
      // Social media
      setSocialWhatsapp((settings as any).social_whatsapp || '');
      setSocialInstagram((settings as any).social_instagram || '');
      setSocialFacebook((settings as any).social_facebook || '');
      setSocialSnapchat((settings as any).social_snapchat || '');
      setSocialTiktok((settings as any).social_tiktok || '');
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار صورة فقط',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);
      
      toast({
        title: 'تم الرفع',
        description: 'تم رفع الشعار بنجاح',
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'خطأ',
        description: 'فشل رفع الشعار',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار صورة فقط',
        variant: 'destructive',
      });
      return;
    }

    setUploadingBanner(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setBannerImages([...bannerImages, publicUrl]);
      
      toast({
        title: 'تم الرفع',
        description: 'تم رفع صورة البانر بنجاح',
      });
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: 'خطأ',
        description: 'فشل رفع صورة البانر',
        variant: 'destructive',
      });
    } finally {
      setUploadingBanner(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleRemoveBanner = (index: number) => {
    const newBanners = bannerImages.filter((_, i) => i !== index);
    setBannerImages(newBanners);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          store_name: storeName,
          theme: selectedTheme,
          logo_url: logoUrl,
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings?.id);

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الإعدادات بنجاح',
      });
      
      // Reload settings
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ الإعدادات',
        variant: 'destructive',
      });
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
        <p className="text-muted-foreground mt-2">إدارة إعدادات المتجر والمظهر</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
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
                {logoUrl ? (
                  <div className="relative">
                    <img
                      src={logoUrl}
                      alt="شعار المتجر"
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploading ? 'جاري الرفع...' : 'اختر صورة للشعار'}
                  </p>
                </div>
              </div>
            </div>

            {/* اسم المتجر */}
            <div className="space-y-2">
              <Label htmlFor="storeName">اسم المتجر</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="اسم متجرك"
              />
            </div>

            {/* الموقع */}
            <div className="space-y-2">
              <Label htmlFor="location">الموقع</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: الرياض، المملكة العربية السعودية"
              />
            </div>
            
            {/* رقم هاتف المتجر */}
            <div className="space-y-2">
              <Label htmlFor="storePhone">رقم هاتف المتجر</Label>
              <Input
                id="storePhone"
                type="tel"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="مثال: 0591234567 أو +972591234567"
                maxLength={20}
              />
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
              <Input
                id="whatsappNumber"
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="مثال: 123456789"
                maxLength={15}
              />
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
                <Input
                  id="deliveryWestBank"
                  type="number"
                  value={deliveryWestBank}
                  onChange={(e) => setDeliveryWestBank(e.target.value)}
                  placeholder="20"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryJerusalem">القدس</Label>
                <Input
                  id="deliveryJerusalem"
                  type="number"
                  value={deliveryJerusalem}
                  onChange={(e) => setDeliveryJerusalem(e.target.value)}
                  placeholder="50"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryInside">الداخل (48)</Label>
                <Input
                  id="deliveryInside"
                  type="number"
                  value={deliveryInside}
                  onChange={(e) => setDeliveryInside(e.target.value)}
                  placeholder="70"
                  min="0"
                  step="0.01"
                />
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
            {bannerImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {bannerImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`بانر ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => handleRemoveBanner(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* زر إضافة صورة */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {uploadingBanner ? 'جاري الرفع...' : 'أضف صورة للبانر (حجم مثالي: 1920x600)'}
                </p>
              </div>
            </div>
            
            {bannerImages.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">لم يتم إضافة صور للبانر بعد</p>
              </div>
            )}
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
              <Input
                id="socialWhatsapp"
                value={socialWhatsapp}
                onChange={(e) => setSocialWhatsapp(e.target.value)}
                placeholder="مثال: https://wa.me/972591234567"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="socialInstagram">انستغرام</Label>
              <Input
                id="socialInstagram"
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                placeholder="مثال: https://instagram.com/yourstore"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="socialFacebook">فيسبوك</Label>
              <Input
                id="socialFacebook"
                value={socialFacebook}
                onChange={(e) => setSocialFacebook(e.target.value)}
                placeholder="مثال: https://facebook.com/yourstore"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="socialSnapchat">سناب شات</Label>
              <Input
                id="socialSnapchat"
                value={socialSnapchat}
                onChange={(e) => setSocialSnapchat(e.target.value)}
                placeholder="مثال: https://snapchat.com/add/yourstore"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="socialTiktok">تيك توك</Label>
              <Input
                id="socialTiktok"
                value={socialTiktok}
                onChange={(e) => setSocialTiktok(e.target.value)}
                placeholder="مثال: https://tiktok.com/@yourstore"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              المظهر
            </CardTitle>
            <CardDescription>اختر مظهر المتجر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-4 rounded-lg border-2 text-right transition-all ${
                    selectedTheme === theme.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold text-lg mb-1">{theme.name}</div>
                  <div className="text-sm text-muted-foreground">{theme.colors}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} size="lg">
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;