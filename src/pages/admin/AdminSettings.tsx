import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Upload, X, MessageCircle } from 'lucide-react';
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
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('972');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name);
      setSelectedTheme(settings.theme);
      setLocation(settings.location || '');
      setLogoUrl(settings.logo_url);
      setWhatsappCountryCode((settings as any).whatsapp_country_code || '972');
      setWhatsappNumber((settings as any).whatsapp_number || '');
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

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          store_name: storeName,
          theme: selectedTheme,
          logo_url: logoUrl,
          location: location,
          whatsapp_country_code: whatsappCountryCode,
          whatsapp_number: whatsappNumber,
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