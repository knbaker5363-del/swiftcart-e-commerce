import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Gift, Truck, Sparkles, Tag, Star, Heart, Zap, Percent,
  Plus, Trash2, Save, GripVertical, Megaphone
} from 'lucide-react';
import { Icon } from '@iconify/react';

interface AnnouncementMessage {
  icon: string;
  text: string;
}

const iconOptions = [
  { id: 'truck', name: 'شاحنة توصيل', icon: Truck },
  { id: 'gift', name: 'هدية', icon: Gift },
  { id: 'sparkles', name: 'لمعان', icon: Sparkles },
  { id: 'tag', name: 'تخفيض', icon: Tag },
  { id: 'star', name: 'نجمة', icon: Star },
  { id: 'heart', name: 'قلب', icon: Heart },
  { id: 'zap', name: 'صاعقة', icon: Zap },
  { id: 'percent', name: 'نسبة', icon: Percent },
  { id: 'delivery', name: 'توصيل سريع', iconify: 'mdi:truck-delivery' },
  { id: 'sale', name: 'تخفيضات', iconify: 'mdi:sale' },
  { id: 'fire', name: 'نار', iconify: 'mdi:fire' },
  { id: 'crown', name: 'تاج', iconify: 'mdi:crown' },
  { id: 'diamond', name: 'ماسة', iconify: 'mdi:diamond' },
  { id: 'rocket', name: 'صاروخ', iconify: 'mdi:rocket-launch' },
  { id: 'flash', name: 'فلاش', iconify: 'mdi:flash' },
  { id: 'medal', name: 'ميدالية', iconify: 'mdi:medal' },
];

const bgColorOptions = [
  { id: 'primary', name: 'اللون الرئيسي', preview: 'bg-primary' },
  { id: 'secondary', name: 'ثانوي', preview: 'bg-secondary' },
  { id: 'accent', name: 'مميز', preview: 'bg-accent' },
  { id: 'destructive', name: 'أحمر', preview: 'bg-destructive' },
  { id: 'muted', name: 'رمادي', preview: 'bg-muted' },
  { id: 'gradient', name: 'تدرج بنفسجي', preview: 'bg-gradient-to-r from-primary via-purple-500 to-pink-500' },
  { id: 'gold', name: 'تدرج ذهبي', preview: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500' },
];

const AdminAnnouncement = () => {
  const { settings, refreshSettings } = useSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [enabled, setEnabled] = useState(true);
  const [messages, setMessages] = useState<AnnouncementMessage[]>([
    { icon: 'truck', text: 'توصيل مجاني للطلبات فوق 200₪' },
    { icon: 'gift', text: 'اشتري بقيمة 100₪ واحصل على هدية مجانية!' },
    { icon: 'sparkles', text: 'عروض حصرية يومياً - تابعنا!' },
  ]);
  const [bgColor, setBgColor] = useState('primary');

  // Checkout badges
  const [checkoutBadgesEnabled, setCheckoutBadgesEnabled] = useState(true);
  const [checkoutBadges, setCheckoutBadges] = useState([
    { icon: 'truck', label: 'توصيل سريع', enabled: true },
    { icon: 'shield', label: 'دفع آمن', enabled: true },
    { icon: 'clock', label: '24/7 دعم', enabled: true },
    { icon: 'gift', label: 'هدايا مجانية', enabled: true },
  ]);

  // Gift display mode
  const [giftDisplayMode, setGiftDisplayMode] = useState('button');

  // Background animation
  const [backgroundAnimationType, setBackgroundAnimationType] = useState('none');

  useEffect(() => {
    if (settings) {
      setEnabled((settings as any)?.announcement_enabled !== false);
      if ((settings as any)?.announcement_messages) {
        setMessages((settings as any).announcement_messages);
      }
      setBgColor((settings as any)?.announcement_bg_color || 'primary');
      setCheckoutBadgesEnabled((settings as any)?.checkout_badges_enabled !== false);
      if ((settings as any)?.checkout_badges) {
        setCheckoutBadges((settings as any).checkout_badges);
      }
      setGiftDisplayMode((settings as any)?.gift_display_mode || 'button');
      setBackgroundAnimationType((settings as any)?.background_animation_type || 'none');
    }
  }, [settings]);

  const addMessage = () => {
    setMessages([...messages, { icon: 'sparkles', text: '' }]);
  };

  const removeMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const updateMessage = (index: number, field: 'icon' | 'text', value: string) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], [field]: value };
    setMessages(updated);
  };

  const toggleCheckoutBadge = (index: number) => {
    const updated = [...checkoutBadges];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    setCheckoutBadges(updated);
  };

  const updateCheckoutBadgeLabel = (index: number, label: string) => {
    const updated = [...checkoutBadges];
    updated[index] = { ...updated[index], label };
    setCheckoutBadges(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          announcement_enabled: enabled,
          announcement_messages: messages,
          announcement_bg_color: bgColor,
          checkout_badges_enabled: checkoutBadgesEnabled,
          checkout_badges: checkoutBadges,
          gift_display_mode: giftDisplayMode,
          background_animation_type: backgroundAnimationType,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', (settings as any)?.id);

      if (error) throw error;

      // Update localStorage
      const cachedSettings = localStorage.getItem('store_settings');
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        parsed.announcement_enabled = enabled;
        parsed.announcement_messages = messages;
        parsed.announcement_bg_color = bgColor;
        parsed.checkout_badges_enabled = checkoutBadgesEnabled;
        parsed.checkout_badges = checkoutBadges;
        parsed.gift_display_mode = giftDisplayMode;
        parsed.background_animation_type = backgroundAnimationType;
        localStorage.setItem('store_settings', JSON.stringify(parsed));
      }

      await refreshSettings();
      toast({ title: 'تم الحفظ بنجاح' });
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: 'خطأ في الحفظ', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const renderIconPreview = (iconId: string) => {
    const option = iconOptions.find(o => o.id === iconId);
    if (!option) return <Sparkles className="h-4 w-4" />;
    
    if (option.iconify) {
      return <Icon icon={option.iconify} className="h-4 w-4" />;
    }
    if (option.icon) {
      const IconComponent = option.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Sparkles className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Announcement Bar Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            شريط الإعلانات
          </CardTitle>
          <CardDescription>التحكم بالشريط المتحرك أعلى الصفحة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <Label>تفعيل شريط الإعلانات</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <Label>لون الخلفية</Label>
            <div className="grid grid-cols-4 gap-2">
              {bgColorOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setBgColor(option.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    bgColor === option.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  <div className={`h-6 rounded ${option.preview}`} />
                  <p className="text-xs mt-1 text-center">{option.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>الرسائل</Label>
              <Button variant="outline" size="sm" onClick={addMessage}>
                <Plus className="h-4 w-4 ml-1" />
                إضافة
              </Button>
            </div>
            
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                  
                  <Select value={msg.icon} onValueChange={(v) => updateMessage(index, 'icon', v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {renderIconPreview(msg.icon)}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          <div className="flex items-center gap-2">
                            {option.iconify ? (
                              <Icon icon={option.iconify} className="h-4 w-4" />
                            ) : option.icon ? (
                              <option.icon className="h-4 w-4" />
                            ) : null}
                            {option.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    value={msg.text}
                    onChange={(e) => updateMessage(index, 'text', e.target.value)}
                    placeholder="نص الرسالة..."
                    className="flex-1"
                  />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMessage(index)}
                    disabled={messages.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Badges */}
      <Card>
        <CardHeader>
          <CardTitle>أيقونات صفحة الدفع</CardTitle>
          <CardDescription>التحكم بأيقونات المميزات في صفحة إتمام الطلب</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>عرض أيقونات المميزات</Label>
            <Switch checked={checkoutBadgesEnabled} onCheckedChange={setCheckoutBadgesEnabled} />
          </div>
          
          {checkoutBadgesEnabled && (
            <div className="space-y-3">
              {checkoutBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Switch
                    checked={badge.enabled}
                    onCheckedChange={() => toggleCheckoutBadge(index)}
                  />
                  <Input
                    value={badge.label}
                    onChange={(e) => updateCheckoutBadgeLabel(index, e.target.value)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gift Display Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            طريقة عرض الهدايا
          </CardTitle>
          <CardDescription>اختر كيف تظهر الهدايا للزبون في صفحة الدفع</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setGiftDisplayMode('button')}
              className={`p-4 rounded-xl border-2 transition-all ${
                giftDisplayMode === 'button' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="text-center">
                <Button variant="outline" className="mb-2 pointer-events-none">
                  <Gift className="h-4 w-4 ml-2" />
                  اختر هديتك
                </Button>
                <p className="text-sm font-medium">زر اختيار</p>
                <p className="text-xs text-muted-foreground">يفتح نافذة لاختيار الهدية</p>
              </div>
            </button>
            
            <button
              onClick={() => setGiftDisplayMode('inline')}
              className={`p-4 rounded-xl border-2 transition-all ${
                giftDisplayMode === 'inline' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-2">
                  <div className="w-10 h-10 bg-muted rounded" />
                  <div className="w-10 h-10 bg-muted rounded" />
                  <div className="w-10 h-10 bg-muted rounded" />
                </div>
                <p className="text-sm font-medium">عرض مباشر</p>
                <p className="text-xs text-muted-foreground">الهدايا تظهر فوق النموذج</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Background Animation */}
      <Card>
        <CardHeader>
          <CardTitle>حركة الخلفية</CardTitle>
          <CardDescription>اختر نوع الحركة المتحركة في خلفية الموقع</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {[
              { id: 'none', name: 'بدون', icon: '✕' },
              { id: 'particles', name: 'جزيئات', icon: '✨' },
              { id: 'bubbles', name: 'فقاعات', icon: '🫧' },
              { id: 'stars', name: 'نجوم', icon: '⭐' },
              { id: 'snow', name: 'ثلج', icon: '❄️' },
              { id: 'confetti', name: 'احتفال', icon: '🎊' },
              { id: 'hearts', name: 'قلوب', icon: '❤️' },
              { id: 'leaves', name: 'أوراق', icon: '🍃' },
            ].map((anim) => (
              <button
                key={anim.id}
                onClick={() => setBackgroundAnimationType(anim.id)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  backgroundAnimationType === anim.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="text-2xl mb-1">{anim.icon}</div>
                <p className="text-xs font-medium">{anim.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 ml-2" />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </div>
  );
};

export default AdminAnnouncement;