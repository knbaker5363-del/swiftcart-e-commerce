import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, MousePointer, Type, Square, Image, Navigation, Loader, Waves, Save } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

interface VisualEffects {
  scroll_reveal: boolean;
  product_hover_lift: boolean;
  product_hover_glow: boolean;
  product_3d_tilt: boolean;
  button_shine: boolean;
  button_ripple: boolean;
  button_glow: boolean;
  button_scale: boolean;
  text_typewriter: boolean;
  text_gradient: boolean;
  text_wave: boolean;
  text_fade: boolean;
  card_border_glow: boolean;
  card_glass_effect: boolean;
  image_zoom_hover: boolean;
  image_parallax: boolean;
  navbar_blur: boolean;
  navbar_shadow: boolean;
  loading_skeleton: boolean;
  loading_shimmer: boolean;
  badge_pulse: boolean;
  heart_beat: boolean;
  floating_elements: boolean;
  stagger_animation: boolean;
  smooth_scroll: boolean;
}

const defaultEffects: VisualEffects = {
  scroll_reveal: true,
  product_hover_lift: true,
  product_hover_glow: true,
  product_3d_tilt: false,
  button_shine: true,
  button_ripple: true,
  button_glow: true,
  button_scale: true,
  text_typewriter: false,
  text_gradient: false,
  text_wave: false,
  text_fade: true,
  card_border_glow: false,
  card_glass_effect: false,
  image_zoom_hover: true,
  image_parallax: false,
  navbar_blur: true,
  navbar_shadow: true,
  loading_skeleton: true,
  loading_shimmer: true,
  badge_pulse: true,
  heart_beat: true,
  floating_elements: false,
  stagger_animation: true,
  smooth_scroll: true,
};

interface EffectCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  effects: { key: keyof VisualEffects; label: string; description: string }[];
}

const effectCategories: EffectCategory[] = [
  {
    title: 'تأثيرات التمرير',
    description: 'تأثيرات تظهر عند التمرير في الصفحة',
    icon: <Waves className="h-5 w-5" />,
    effects: [
      { key: 'scroll_reveal', label: 'ظهور العناصر', description: 'العناصر تظهر بحركة عند التمرير' },
      { key: 'stagger_animation', label: 'ظهور متتابع', description: 'العناصر تظهر واحدة تلو الأخرى' },
      { key: 'smooth_scroll', label: 'تمرير سلس', description: 'تمرير سلس بين الأقسام' },
    ],
  },
  {
    title: 'تأثيرات المنتجات',
    description: 'تأثيرات بطاقات المنتجات',
    icon: <Square className="h-5 w-5" />,
    effects: [
      { key: 'product_hover_lift', label: 'رفع البطاقة', description: 'البطاقة ترتفع عند المرور' },
      { key: 'product_hover_glow', label: 'توهج البطاقة', description: 'توهج خفيف حول البطاقة' },
      { key: 'product_3d_tilt', label: 'ميلان ثلاثي الأبعاد', description: 'البطاقة تميل بحسب موقع الماوس' },
      { key: 'card_border_glow', label: 'حدود متوهجة', description: 'حدود متوهجة متحركة' },
      { key: 'card_glass_effect', label: 'تأثير زجاجي', description: 'خلفية زجاجية شفافة' },
    ],
  },
  {
    title: 'تأثيرات الأزرار',
    description: 'تأثيرات الأزرار والروابط',
    icon: <MousePointer className="h-5 w-5" />,
    effects: [
      { key: 'button_shine', label: 'لمعان الزر', description: 'تأثير لمعان عند المرور' },
      { key: 'button_ripple', label: 'موجة الضغط', description: 'تأثير موجة عند الضغط' },
      { key: 'button_glow', label: 'توهج الزر', description: 'توهج حول الزر عند المرور' },
      { key: 'button_scale', label: 'تكبير الزر', description: 'الزر يكبر قليلاً عند المرور' },
    ],
  },
  {
    title: 'تأثيرات النصوص',
    description: 'تأثيرات العناوين والنصوص',
    icon: <Type className="h-5 w-5" />,
    effects: [
      { key: 'text_typewriter', label: 'كتابة تلقائية', description: 'النص يُكتب حرف بحرف' },
      { key: 'text_gradient', label: 'تدرج ألوان', description: 'النص بألوان متدرجة متحركة' },
      { key: 'text_wave', label: 'موجة الحروف', description: 'الحروف تتحرك كالموجة' },
      { key: 'text_fade', label: 'ظهور تدريجي', description: 'النص يظهر تدريجياً' },
    ],
  },
  {
    title: 'تأثيرات الصور',
    description: 'تأثيرات الصور والوسائط',
    icon: <Image className="h-5 w-5" />,
    effects: [
      { key: 'image_zoom_hover', label: 'تكبير الصورة', description: 'الصورة تكبر عند المرور' },
      { key: 'image_parallax', label: 'تأثير بارالاكس', description: 'الصورة تتحرك مع التمرير' },
    ],
  },
  {
    title: 'تأثيرات الشريط العلوي',
    description: 'تأثيرات شريط التنقل',
    icon: <Navigation className="h-5 w-5" />,
    effects: [
      { key: 'navbar_blur', label: 'تأثير ضبابي', description: 'خلفية ضبابية للشريط' },
      { key: 'navbar_shadow', label: 'ظل الشريط', description: 'ظل أسفل الشريط' },
    ],
  },
  {
    title: 'تأثيرات التحميل',
    description: 'تأثيرات أثناء التحميل',
    icon: <Loader className="h-5 w-5" />,
    effects: [
      { key: 'loading_skeleton', label: 'هيكل التحميل', description: 'عرض هيكل أثناء التحميل' },
      { key: 'loading_shimmer', label: 'لمعان التحميل', description: 'تأثير لمعان متحرك' },
    ],
  },
  {
    title: 'تأثيرات إضافية',
    description: 'تأثيرات متنوعة',
    icon: <Sparkles className="h-5 w-5" />,
    effects: [
      { key: 'badge_pulse', label: 'نبض الشارات', description: 'الشارات تنبض للفت الانتباه' },
      { key: 'heart_beat', label: 'نبض القلب', description: 'أيقونة القلب تنبض' },
      { key: 'floating_elements', label: 'عناصر طافية', description: 'عناصر تطفو وتتحرك' },
    ],
  },
];

const AdminEffects = () => {
  const [effects, setEffects] = useState<VisualEffects>(defaultEffects);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEffects();
  }, []);

  const fetchEffects = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('visual_effects')
        .single();

      if (error) throw error;
      if (data?.visual_effects && typeof data.visual_effects === 'object') {
        setEffects({ ...defaultEffects, ...(data.visual_effects as Record<string, boolean>) });
      }
    } catch (error) {
      console.error('Error fetching effects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof VisualEffects) => {
    setEffects((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: settingsData } = await supabase.from('settings').select('id').single();
      
      const { error } = await supabase
        .from('settings')
        .update({ visual_effects: effects as unknown as Record<string, boolean> })
        .eq('id', settingsData?.id || '');

      if (error) throw error;

      // Update localStorage
      const cachedSettings = localStorage.getItem('storeSettings');
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        parsed.visual_effects = effects;
        localStorage.setItem('storeSettings', JSON.stringify(parsed));
      }

      toast.success('تم حفظ التأثيرات بنجاح');
    } catch (error) {
      console.error('Error saving effects:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const enableAll = () => {
    const allEnabled = Object.keys(effects).reduce((acc, key) => {
      acc[key as keyof VisualEffects] = true;
      return acc;
    }, {} as VisualEffects);
    setEffects(allEnabled);
  };

  const disableAll = () => {
    const allDisabled = Object.keys(effects).reduce((acc, key) => {
      acc[key as keyof VisualEffects] = false;
      return acc;
    }, {} as VisualEffects);
    setEffects(allDisabled);
  };

  const resetDefaults = () => {
    setEffects(defaultEffects);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              التأثيرات البصرية
            </h1>
            <p className="text-muted-foreground mt-1">تحكم في التأثيرات والحركات في متجرك</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={enableAll}>
              تفعيل الكل
            </Button>
            <Button variant="outline" size="sm" onClick={disableAll}>
              إلغاء الكل
            </Button>
            <Button variant="outline" size="sm" onClick={resetDefaults}>
              الافتراضي
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {effectCategories.map((category, categoryIndex) => (
            <ScrollReveal key={category.title} direction="up" delay={categoryIndex * 100}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="p-2 rounded-lg bg-primary/10 text-primary">
                      {category.icon}
                    </span>
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.effects.map((effect) => (
                    <div
                      key={effect.key}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <Label htmlFor={effect.key} className="font-medium cursor-pointer">
                          {effect.label}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {effect.description}
                        </p>
                      </div>
                      <Switch
                        id={effect.key}
                        checked={effects[effect.key]}
                        onCheckedChange={() => handleToggle(effect.key)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>معاينة التأثيرات</CardTitle>
            <CardDescription>شاهد التأثيرات المفعلة قبل الحفظ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Button Preview */}
              <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">معاينة الأزرار</p>
                <Button
                  className={`w-full ${effects.button_shine ? 'shine-effect' : ''} ${
                    effects.button_scale ? 'hover:scale-105' : ''
                  } ${effects.button_glow ? 'hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]' : ''}`}
                >
                  زر تجريبي
                </Button>
              </div>

              {/* Card Preview */}
              <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">معاينة البطاقات</p>
                <div
                  className={`p-4 rounded-lg bg-card border ${
                    effects.product_hover_lift ? 'hover-lift' : ''
                  } ${effects.card_border_glow ? 'animated-border-glow' : ''} ${
                    effects.card_glass_effect ? 'glass' : ''
                  }`}
                >
                  <div className="h-16 bg-primary/10 rounded mb-2"></div>
                  <p className="text-sm font-medium">منتج تجريبي</p>
                  <p className="text-xs text-muted-foreground">50 ₪</p>
                </div>
              </div>

              {/* Text Preview */}
              <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">معاينة النصوص</p>
                <p
                  className={`text-lg font-bold ${
                    effects.text_gradient
                      ? 'bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent'
                      : ''
                  }`}
                >
                  نص تجريبي
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default AdminEffects;
