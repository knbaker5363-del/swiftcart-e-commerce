import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  Sparkles,
  Paintbrush,
  Image,
  X,
  Upload
} from 'lucide-react';
import { compressImageToFile } from '@/lib/imageCompression';
import StorePreview from '@/components/admin/StorePreview';

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

// Themes
const themes = [
  { id: 'default', name: 'كلاسيكي', colors: 'أبيض وأسود' },
  { id: 'night', name: 'ليلي', colors: 'أزرق داكن' },
  { id: 'day', name: 'نهاري', colors: 'برتقالي ساطع' },
  { id: 'pink', name: 'زهري', colors: 'وردي' },
  { id: 'green', name: 'أخضر', colors: 'أخضر زمردي' },
  { id: 'orange', name: 'برتقالي', colors: 'برتقالي دافئ' },
  { id: 'ocean', name: 'محيطي', colors: 'أزرق سماوي' },
  { id: 'lavender', name: 'لافندر', colors: 'بنفسجي فاتح' },
  { id: 'coral', name: 'مرجاني', colors: 'مرجاني' },
  { id: 'mint', name: 'نعناعي', colors: 'أخضر نعناعي' },
  { id: 'sunset', name: 'غروب', colors: 'برتقالي وأحمر' },
  { id: 'slate', name: 'رمادي', colors: 'رمادي مزرق' },
  { id: 'cherry', name: 'كرزي', colors: 'أحمر كرزي' },
  { id: 'forest', name: 'غابة', colors: 'أخضر غامق' },
  { id: 'gold', name: 'ذهبي', colors: 'ذهبي' },
  { id: 'ruby', name: 'ياقوتي', colors: 'أحمر ياقوتي' },
  { id: 'sky', name: 'سماوي', colors: 'أزرق سماوي فاتح' },
  { id: 'plum', name: 'برقوقي', colors: 'بنفسجي غامق' },
  { id: 'teal', name: 'فيروزي', colors: 'فيروزي داكن' },
  { id: 'rose', name: 'وردي فاتح', colors: 'وردي فاتح' },
  { id: 'cocoa', name: 'كاكاو', colors: 'بني دافئ' },
];

// Accent colors
const accentColorOptions = [
  { id: 'default', name: 'حسب الثيم', color: 'var(--gradient-primary)' },
  { id: 'blue', name: 'أزرق', color: 'hsl(210, 100%, 50%)' },
  { id: 'red', name: 'أحمر', color: 'hsl(0, 85%, 55%)' },
  { id: 'green', name: 'أخضر', color: 'hsl(145, 80%, 42%)' },
  { id: 'purple', name: 'بنفسجي', color: 'hsl(270, 70%, 55%)' },
  { id: 'orange', name: 'برتقالي', color: 'hsl(25, 95%, 53%)' },
  { id: 'pink', name: 'وردي', color: 'hsl(330, 85%, 60%)' },
  { id: 'teal', name: 'فيروزي', color: 'hsl(175, 75%, 40%)' },
  { id: 'yellow', name: 'أصفر', color: 'hsl(45, 95%, 50%)' },
  { id: 'indigo', name: 'نيلي', color: 'hsl(245, 70%, 55%)' },
  { id: 'black', name: 'أسود', color: 'hsl(0, 0%, 15%)' },
];

// Animation effects
const animationEffects = [
  { id: 'none', name: 'بدون', icon: '✕' },
  { id: 'snow', name: 'ثلج', icon: '❄️' },
  { id: 'stars', name: 'نجوم', icon: '⭐' },
  { id: 'hearts', name: 'قلوب', icon: '❤️' },
  { id: 'confetti', name: 'احتفال', icon: '🎊' },
  { id: 'bubbles', name: 'فقاعات', icon: '🫧' },
  { id: 'leaves', name: 'أوراق', icon: '🍃' },
];

const AdminDisplay = () => {
  const { settings, refreshSettings, applyTheme, applyAccentColor } = useSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Cart and font settings
  const [cartIconStyle, setCartIconStyle] = useState('cart');
  const [cartButtonText, setCartButtonText] = useState('إضافة للسلة');
  const [fontFamily, setFontFamily] = useState('tajawal');

  // Theme and appearance
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [accentColor, setAccentColor] = useState('default');
  const [animationEffect, setAnimationEffect] = useState('none');

  // Background settings
  const [backgroundStyle, setBackgroundStyle] = useState('solid');
  const [backgroundPattern, setBackgroundPattern] = useState<string | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [uploadingBgImage, setUploadingBgImage] = useState(false);

  // Layout settings
  const [headerLayout, setHeaderLayout] = useState('logo-right-social-below');
  const [logoShape, setLogoShape] = useState('circle');
  const [headerLogoPosition, setHeaderLogoPosition] = useState('right');
  const [hideHeaderStoreInfo, setHideHeaderStoreInfo] = useState(false);
  const [socialMediaPosition, setSocialMediaPosition] = useState('hero');
  const [cartButtonStyle, setCartButtonStyle] = useState('default');
  const [showImageBorder, setShowImageBorder] = useState(true);
  const [storeNameBlack, setStoreNameBlack] = useState(false);
  const [heroBannerColor, setHeroBannerColor] = useState('#000000');

  // Card display settings
  const [cardSize, setCardSize] = useState('medium');
  const [cardsPerRowMobile, setCardsPerRowMobile] = useState(2);
  const [cardsPerRowDesktop, setCardsPerRowDesktop] = useState(4);

  // Load settings
  useEffect(() => {
    if (settings) {
      setCartIconStyle((settings as any)?.cart_icon_style || 'cart');
      setCartButtonText((settings as any)?.cart_button_text || 'إضافة للسلة');
      setFontFamily((settings as any)?.font_family || 'tajawal');
      setSelectedTheme(settings.theme || 'default');
      setAccentColor((settings as any)?.accent_color || 'default');
      setAnimationEffect((settings as any)?.animation_effect || 'none');
      setBackgroundStyle((settings as any)?.background_style || 'solid');
      setBackgroundPattern((settings as any)?.background_pattern || null);
      setBackgroundImageUrl((settings as any)?.background_image_url || null);
      setHeaderLayout((settings as any)?.header_layout || 'logo-right-social-below');
      setLogoShape((settings as any)?.logo_shape || 'circle');
      setHeaderLogoPosition((settings as any)?.header_logo_position || 'right');
      setHideHeaderStoreInfo((settings as any)?.hide_header_store_info || false);
      setSocialMediaPosition((settings as any)?.social_media_position || 'hero');
      setCartButtonStyle((settings as any)?.cart_button_style || 'default');
      setShowImageBorder((settings as any)?.show_image_border !== false);
      setStoreNameBlack((settings as any)?.store_name_black || false);
      setHeroBannerColor((settings as any)?.hero_banner_color || '#000000');
      setCardSize((settings as any)?.card_size || 'medium');
      setCardsPerRowMobile((settings as any)?.cards_per_row_mobile || 2);
      setCardsPerRowDesktop((settings as any)?.cards_per_row_desktop || 4);
    }
  }, [settings]);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
  };

  const handleAccentColorChange = (colorId: string) => {
    setAccentColor(colorId);
    applyAccentColor(colorId === 'default' ? null : colorId);
  };

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingBgImage(true);
    try {
      const compressedFile = await compressImageToFile(file, 1920, 1080, 0.85);
      const fileName = `bg-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setBackgroundImageUrl(publicUrl);
      toast({ title: 'تم رفع صورة الخلفية بنجاح' });
    } catch (error) {
      toast({ title: 'خطأ في رفع الصورة', variant: 'destructive' });
    } finally {
      setUploadingBgImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          cart_icon_style: cartIconStyle,
          cart_button_text: cartButtonText,
          font_family: fontFamily,
          theme: selectedTheme,
          accent_color: accentColor === 'default' ? null : accentColor,
          animation_effect: animationEffect === 'none' ? null : animationEffect,
          background_style: backgroundStyle,
          background_pattern: backgroundPattern,
          background_image_url: backgroundImageUrl,
          header_layout: headerLayout,
          logo_shape: logoShape,
          header_logo_position: headerLogoPosition,
          hide_header_store_info: hideHeaderStoreInfo,
          social_media_position: socialMediaPosition,
          cart_button_style: cartButtonStyle,
          show_image_border: showImageBorder,
          store_name_black: storeNameBlack,
          hero_banner_color: heroBannerColor,
          card_size: cardSize,
          cards_per_row_mobile: cardsPerRowMobile,
          cards_per_row_desktop: cardsPerRowDesktop,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings?.id);

      if (error) throw error;

      // Apply font immediately
      const fontMap: Record<string, string> = {
        'tajawal': 'Tajawal, sans-serif',
        'cairo': 'Cairo, sans-serif',
        'almarai': 'Almarai, sans-serif',
        'noto-kufi': '"Noto Kufi Arabic", sans-serif',
        'ibm-plex': '"IBM Plex Sans Arabic", sans-serif',
      };
      document.body.style.fontFamily = fontMap[fontFamily] || fontMap['tajawal'];

      await refreshSettings();
      
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات المظهر بنجاح',
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
        <h1 className="text-3xl font-bold">إعدادات المظهر</h1>
        <p className="text-muted-foreground mt-2">تخصيص ثيم وألوان ومظهر الموقع</p>
      </div>

      {/* Preview Panel - شاشة المعاينة */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            معاينة المتجر
          </CardTitle>
          <CardDescription>هكذا سيظهر متجرك بالإعدادات الحالية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Preview */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">معاينة مباشرة</h4>
              <StorePreview 
                theme={selectedTheme}
                accentColor={accentColor}
                fontFamily={fontFamily}
                cartIcon={cartIconStyle}
                cartButtonText={cartButtonText}
                logoShape={logoShape}
                headerLogoPosition={headerLogoPosition}
                animationEffect={animationEffect}
              />
            </div>
            
            {/* Settings Impact Guide */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">شرح تأثير كل إعداد</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="font-semibold text-primary mb-1">🎨 ثيم الخلفية</div>
                  <p className="text-muted-foreground text-xs">يغير ألوان الخلفية العامة للموقع</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="font-semibold text-primary mb-1">🔘 لون الأزرار</div>
                  <p className="text-muted-foreground text-xs">يغير لون جميع الأزرار والعناصر التفاعلية</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="font-semibold text-primary mb-1">✨ التأثيرات المتحركة</div>
                  <p className="text-muted-foreground text-xs">يضيف تأثيرات متحركة للخلفية (ثلج، نجوم، قلوب)</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="font-semibold text-primary mb-1">🔤 الخط</div>
                  <p className="text-muted-foreground text-xs">يغير نوع الخط في جميع النصوص</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="font-semibold text-primary mb-1">🛒 زر السلة</div>
                  <p className="text-muted-foreground text-xs">يغير شكل وأيقونة زر إضافة للسلة</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="font-semibold text-primary mb-1">📍 موضع العناصر</div>
                  <p className="text-muted-foreground text-xs">يغير موضع اللوجو والسوشل ميديا</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  هذا النص بخط {font.name}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            ثيم الخلفية
          </CardTitle>
          <CardDescription>اختر ألوان الخلفية للموقع</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`p-2 rounded-lg border-2 text-center transition-all hover:scale-[1.02] ${
                  selectedTheme === theme.id 
                    ? 'border-primary bg-primary/10 shadow-md' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold text-xs">{theme.name}</div>
                <div className="text-[10px] text-muted-foreground">{theme.colors}</div>
                {selectedTheme === theme.id && <Check className="h-3 w-3 text-primary mx-auto mt-1" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            لون الأزرار
          </CardTitle>
          <CardDescription>اختر لون الأزرار والعناصر التفاعلية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {accentColorOptions.map(color => (
              <button
                key={color.id}
                onClick={() => handleAccentColorChange(color.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  accentColor === color.id ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-full border-2 border-background shadow-sm" 
                  style={{ background: color.color }} 
                />
                <span className="text-xs font-medium text-center">{color.name}</span>
                {accentColor === color.id && <Check className="h-3 w-3 text-primary" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hero Banner Color */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            لون البانر العلوي
          </CardTitle>
          <CardDescription>تخصيص لون الخلفية للبانر العلوي في صفحات التصنيفات والعلامات التجارية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Label>اللون:</Label>
              <Input
                type="color"
                value={heroBannerColor}
                onChange={(e) => setHeroBannerColor(e.target.value)}
                className="w-16 h-10 cursor-pointer p-1"
              />
              <Input
                type="text"
                value={heroBannerColor}
                onChange={(e) => setHeroBannerColor(e.target.value)}
                className="w-28"
                placeholder="#000000"
                dir="ltr"
              />
            </div>
          </div>
          
          {/* Quick color presets */}
          <div>
            <Label className="text-sm mb-2 block">ألوان سريعة:</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { color: '#000000', name: 'أسود' },
                { color: '#1a1a2e', name: 'كحلي' },
                { color: '#0f3460', name: 'أزرق غامق' },
                { color: '#16213e', name: 'نيلي' },
                { color: '#1b1b2f', name: 'ليلي' },
                { color: '#2d132c', name: 'بنفسجي غامق' },
                { color: '#1a3c34', name: 'أخضر غامق' },
                { color: '#3d0c02', name: 'أحمر غامق' },
                { color: '#4a1942', name: 'مارون' },
                { color: '#2c3e50', name: 'رمادي داكن' },
              ].map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => setHeroBannerColor(preset.color)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                    heroBannerColor === preset.color ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg border border-white/20"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-[10px]">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Preview */}
          <div>
            <Label className="text-sm mb-2 block">معاينة:</Label>
            <div 
              className="w-full h-24 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: heroBannerColor }}
            >
              <div className="text-center">
                <p className="text-lg">العلامات التجارية</p>
                <p className="text-sm opacity-70">تسوق من أفضل العلامات</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            خيارات المظهر
          </CardTitle>
          <CardDescription>تخصيصات إضافية للخلفية والتأثيرات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Background style */}
          <div>
            <Label className="text-base font-medium mb-3 block">نمط الخلفية</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'solid', name: 'لون سادة', icon: '🎨' },
                { id: 'pattern', name: 'نمط/باترن', icon: '🔵' },
                { id: 'image', name: 'صورة', icon: '🖼️' },
              ].map(style => (
                <button
                  key={style.id}
                  onClick={() => setBackgroundStyle(style.id)}
                  className={`p-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                    backgroundStyle === style.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{style.icon}</div>
                  <div className="text-xs font-medium">{style.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pattern options */}
          {backgroundStyle === 'pattern' && (
            <div>
              <Label className="text-base font-medium mb-3 block">نوع النمط</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dots', name: 'نقاط', icon: '•••' },
                  { id: 'lines', name: 'خطوط', icon: '|||' },
                  { id: 'bubbles', name: 'فقاعات', icon: '○○○' },
                ].map(pattern => (
                  <button
                    key={pattern.id}
                    onClick={() => setBackgroundPattern(pattern.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                      backgroundPattern === pattern.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-xl mb-1 font-mono">{pattern.icon}</div>
                    <div className="text-xs font-medium">{pattern.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Background image upload */}
          {backgroundStyle === 'image' && (
            <div className="space-y-2">
              <Label>صورة الخلفية</Label>
              <div className="flex items-center gap-4">
                {backgroundImageUrl ? (
                  <div className="relative">
                    <img src={backgroundImageUrl} alt="خلفية" className="w-32 h-20 rounded-lg object-cover border-2 border-primary/20" />
                    <button onClick={() => setBackgroundImageUrl(null)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleBackgroundImageUpload} disabled={uploadingBgImage} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {uploadingBgImage ? 'جاري الرفع...' : 'اختر صورة للخلفية'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Animation effects */}
          <div>
            <Label className="text-base font-medium mb-3 block">التأثيرات المتحركة</Label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {animationEffects.map(effect => (
                <button
                  key={effect.id}
                  onClick={() => setAnimationEffect(effect.id)}
                  className={`p-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                    animationEffect === effect.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{effect.icon}</div>
                  <div className="text-xs font-medium">{effect.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Logo and header layout */}
          <div>
            <Label className="text-base font-medium mb-3 block">شكل اللوجو</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'circle', name: 'دائري', icon: '⭕' },
                { id: 'square', name: 'مربع', icon: '⬜' },
              ].map(shape => (
                <button
                  key={shape.id}
                  onClick={() => setLogoShape(shape.id)}
                  className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-[1.02] ${
                    logoShape === shape.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{shape.icon}</div>
                  <div className="font-medium text-sm">{shape.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Header logo position */}
          <div>
            <Label className="text-base font-medium mb-3 block">موضع اللوجو في الهيدر</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'right', name: 'على اليمين', icon: '➡️' },
                { id: 'center', name: 'في المنتصف', icon: '⬛' },
                { id: 'left', name: 'على اليسار', icon: '⬅️' },
              ].map(pos => (
                <button
                  key={pos.id}
                  onClick={() => setHeaderLogoPosition(pos.id)}
                  className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-[1.02] ${
                    headerLogoPosition === pos.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{pos.id === 'right' ? '➡️' : pos.id === 'center' ? '⬛' : '⬅️'}</div>
                  <div className="font-medium text-sm">{pos.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Social media position */}
          {!hideHeaderStoreInfo && (
            <div>
              <Label className="text-base font-medium mb-3 block">مكان السوشل ميديا</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'hero', name: 'في البوكس', icon: '📍' },
                  { id: 'footer', name: 'نهاية الموقع', icon: '⬇️' },
                ].map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setSocialMediaPosition(pos.id)}
                    className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-[1.02] ${
                      socialMediaPosition === pos.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{pos.icon}</div>
                    <div className="font-medium text-sm">{pos.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-base font-medium">إظهار إطار حول الصور</Label>
                <p className="text-sm text-muted-foreground">عند التفعيل، ستظهر الصور داخل إطار</p>
              </div>
              <Switch checked={showImageBorder} onCheckedChange={setShowImageBorder} />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-base font-medium">إبقاء اسم المتجر أسود</Label>
                <p className="text-sm text-muted-foreground">عند التفعيل، سيظهر اسم المتجر باللون الأسود</p>
              </div>
              <Switch checked={storeNameBlack} onCheckedChange={setStoreNameBlack} />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-base font-medium">إخفاء بوكس معلومات المتجر</Label>
                <p className="text-sm text-muted-foreground">إخفاء اللوجو واسم المتجر من الصفحة الرئيسية</p>
              </div>
              <Switch checked={hideHeaderStoreInfo} onCheckedChange={setHideHeaderStoreInfo} />
            </div>
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
          <CardDescription>تخصيص شكل وأيقونة زر إضافة للسلة</CardDescription>
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
                    {cartIconStyle === option.id && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart button shape */}
          <div>
            <Label className="text-base font-medium mb-3 block">شكل زر السلة</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'default', name: 'افتراضي', style: 'rounded-md' },
                { id: 'rounded', name: 'دائري', style: 'rounded-xl' },
                { id: 'pill', name: 'كبسولة', style: 'rounded-full' },
                { id: 'square', name: 'مربع', style: 'rounded-none' },
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setCartButtonStyle(btn.id)}
                  className={`p-3 border-2 text-center transition-all hover:scale-105 ${btn.style} ${
                    cartButtonStyle === btn.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-sm font-medium">{btn.name}</div>
                </button>
              ))}
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
              <span className="text-muted-foreground">← هكذا سيظهر زر السلة</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            عرض البطاقات
          </CardTitle>
          <CardDescription>تخصيص حجم بطاقات المنتجات وعددها في كل صف</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Card Size */}
          <div>
            <Label className="text-base font-medium mb-3 block">حجم البطاقة</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'small', name: 'صغير', desc: 'بطاقات صغيرة ومدمجة' },
                { id: 'medium', name: 'متوسط', desc: 'الحجم الافتراضي' },
                { id: 'large', name: 'كبير', desc: 'بطاقات كبيرة وواضحة' },
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => setCardSize(size.id)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    cardSize === size.id
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold">{size.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{size.desc}</div>
                  {cardSize === size.id && <Check className="h-4 w-4 text-primary mx-auto mt-2" />}
                </button>
              ))}
            </div>
          </div>

          {/* Cards per row - Mobile */}
          <div>
            <Label className="text-base font-medium mb-3 block">عدد البطاقات في الصف (الجوال)</Label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => setCardsPerRowMobile(num)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    cardsPerRowMobile === num
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-bold text-2xl">{num}</div>
                  <div className="text-xs text-muted-foreground">
                    {num === 1 ? 'بطاقة واحدة' : num === 2 ? 'بطاقتان' : '3 بطاقات'}
                  </div>
                  {cardsPerRowMobile === num && <Check className="h-4 w-4 text-primary mx-auto mt-2" />}
                </button>
              ))}
            </div>
          </div>

          {/* Cards per row - Desktop */}
          <div>
            <Label className="text-base font-medium mb-3 block">عدد البطاقات في الصف (الكمبيوتر)</Label>
            <div className="grid grid-cols-4 gap-3">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setCardsPerRowDesktop(num)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    cardsPerRowDesktop === num
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-bold text-2xl">{num}</div>
                  <div className="text-xs text-muted-foreground">{num} بطاقات</div>
                  {cardsPerRowDesktop === num && <Check className="h-4 w-4 text-primary mx-auto mt-2" />}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Grid */}
          <div>
            <Label className="text-sm mb-2 block">معاينة الشبكة:</Label>
            <div className="p-4 bg-muted rounded-lg">
              <div 
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${cardsPerRowDesktop}, 1fr)` }}
              >
                {Array.from({ length: cardsPerRowDesktop * 2 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`bg-background border rounded-lg flex items-center justify-center ${
                      cardSize === 'small' ? 'h-20' : cardSize === 'large' ? 'h-40' : 'h-28'
                    }`}
                  >
                    <span className="text-xs text-muted-foreground">منتج</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                سطح المكتب: {cardsPerRowDesktop} بطاقات | الجوال: {cardsPerRowMobile} بطاقات | الحجم: {cardSize === 'small' ? 'صغير' : cardSize === 'large' ? 'كبير' : 'متوسط'}
              </p>
            </div>
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
