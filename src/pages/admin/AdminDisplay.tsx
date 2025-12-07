import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  ShoppingCart, 
  ShoppingBag, 
  Package, 
  Briefcase, 
  Gift,
  Check,
  Type,
  Palette,
  Layout
} from 'lucide-react';

// Cart icon options
const cartIconOptions = [
  { id: 'cart', name: 'عربة تسوق', icon: ShoppingCart },
  { id: 'bag', name: 'حقيبة تسوق', icon: ShoppingBag },
  { id: 'package', name: 'صندوق', icon: Package },
  { id: 'briefcase', name: 'حقيبة', icon: Briefcase },
  { id: 'gift', name: 'هدية', icon: Gift },
];

// Font options
const fontOptions = [
  { id: 'tajawal', name: 'Tajawal', className: 'font-tajawal' },
  { id: 'cairo', name: 'Cairo', className: 'font-cairo' },
  { id: 'almarai', name: 'Almarai', className: 'font-almarai' },
  { id: 'noto-kufi', name: 'Noto Kufi Arabic', className: 'font-noto-kufi' },
  { id: 'ibm-plex', name: 'IBM Plex Sans Arabic', className: 'font-ibm-plex' },
];

// Category display options
const categoryDisplayOptions = [
  { id: 'grid', name: 'مربعات مع صور/أيقونات', description: 'عرض التصنيفات كمربعات مع صور أو أيقونات كبيرة' },
  { id: 'list', name: 'دوائر مع أسماء', description: 'عرض التصنيفات كدوائر مع الأسماء' },
  { id: 'icon-list', name: 'أيقونة صغيرة مع اسم', description: 'أيقونة صغيرة مع اسم التصنيف' },
];

const AdminDisplay = () => {
  const { settings, refreshSettings } = useSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // State for display settings
  const [cartIconStyle, setCartIconStyle] = useState('cart');
  const [cartButtonText, setCartButtonText] = useState('إضافة للسلة');
  const [fontFamily, setFontFamily] = useState('tajawal');
  const [categoryDisplayStyle, setCategoryDisplayStyle] = useState('grid');
  const [showBrandsButton, setShowBrandsButton] = useState(true);

  // Load settings
  useEffect(() => {
    if (settings) {
      setCartIconStyle((settings as any)?.cart_icon_style || 'cart');
      setCartButtonText((settings as any)?.cart_button_text || 'إضافة للسلة');
      setFontFamily((settings as any)?.font_family || 'tajawal');
      setCategoryDisplayStyle((settings as any)?.category_display_style || 'grid');
      setShowBrandsButton((settings as any)?.show_brands_button !== false);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          cart_icon_style: cartIconStyle,
          cart_button_text: cartButtonText,
          font_family: fontFamily,
          category_display_style: categoryDisplayStyle,
          show_brands_button: showBrandsButton,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings?.id);

      if (error) throw error;

      await refreshSettings();
      
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات العرض بنجاح',
      });
    } catch (error) {
      console.error('Error saving display settings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ الإعدادات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إعدادات العرض</h1>
        <p className="text-muted-foreground mt-2">تخصيص طريقة عرض الموقع والأزرار والخطوط</p>
      </div>

      {/* Font Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            الخط
          </CardTitle>
          <CardDescription>اختر خط الموقع</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {fontOptions.map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => setFontFamily(font.id)}
                className={`p-4 rounded-lg border-2 text-right transition-all ${
                  fontFamily === font.id
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg" style={{ fontFamily: font.name }}>
                    {font.name}
                  </span>
                  {fontFamily === font.id && <Check className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: font.name }}>
                  هذا النص مكتوب بخط {font.name}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cart Button Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            زر السلة
          </CardTitle>
          <CardDescription>تخصيص شكل وكتابة زر إضافة للسلة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cart Icon Style */}
          <div>
            <Label className="text-base font-medium mb-3 block">أيقونة السلة</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {cartIconOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setCartIconStyle(option.id)}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                      cartIconStyle === option.id
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{option.name}</span>
                    {cartIconStyle === option.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart Button Text */}
          <div>
            <Label className="text-base font-medium mb-3 block">نص زر السلة</Label>
            <Input
              value={cartButtonText}
              onChange={(e) => setCartButtonText(e.target.value)}
              placeholder="إضافة للسلة"
              className="max-w-sm"
            />
            <p className="text-sm text-muted-foreground mt-2">
              اترك الحقل فارغ لإظهار الأيقونة فقط بدون نص
            </p>
          </div>

          {/* Preview */}
          <div>
            <Label className="text-base font-medium mb-3 block">معاينة</Label>
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Button className="gap-2">
                {(() => {
                  const Icon = cartIconOptions.find(o => o.id === cartIconStyle)?.icon || ShoppingCart;
                  return <Icon className="h-4 w-4" />;
                })()}
                {cartButtonText || ''}
              </Button>
              <span className="text-muted-foreground">← هكذا سيظهر زر إضافة للسلة</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            عرض التصنيفات
          </CardTitle>
          <CardDescription>تخصيص طريقة عرض التصنيفات (سلايدر)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">شكل التصنيفات</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {categoryDisplayOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setCategoryDisplayStyle(option.id)}
                  className={`p-4 rounded-lg border-2 text-right transition-all ${
                    categoryDisplayStyle === option.id
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{option.name}</span>
                    {categoryDisplayStyle === option.id && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Show Brands Button */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="showBrandsButton" className="text-base font-medium">
                إظهار زر البراندات
              </Label>
              <p className="text-sm text-muted-foreground">
                إظهار زر "البراندات الخاصة بنا" في الصفحة الرئيسية
              </p>
            </div>
            <Switch
              id="showBrandsButton"
              checked={showBrandsButton}
              onCheckedChange={setShowBrandsButton}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full md:w-auto">
        {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </Button>
    </div>
  );
};

export default AdminDisplay;