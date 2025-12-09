import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PublicHeader } from '@/components/PublicHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Phone, Copy, MessageCircle, Tag, Instagram, Facebook, Gift, AlertCircle, ShoppingBag, Truck, Clock, Shield, CheckCircle2, Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { SiTiktok, SiSnapchat } from 'react-icons/si';
import OrderSuccessSocialLinks from '@/components/OrderSuccessSocialLinks';
import { GiftSelectionDialog } from '@/components/GiftSelectionDialog';
import { GiftNotificationBanner } from '@/components/GiftNotificationBanner';
import { GiftProductsDisplay } from '@/components/GiftProductsDisplay';
import { checkOrderRateLimit, recordOrderAttempt } from '@/lib/rateLimiter';
import { cn } from '@/lib/utils';
import { BouncingBalls } from '@/components/ui/bouncing-balls';
import { ExclusiveOfferBadge } from '@/components/ui/exclusive-offer-badge';
import { ConfettiEffect } from '@/components/ui/confetti-effect';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { GlowingCard } from '@/components/ui/glowing-card';
import { SlideToUnlock } from '@/components/ui/slide-to-unlock';
import { useSettings } from '@/contexts/SettingsContext';

const CITIES_DATA = {
  palestine: {
    label: 'فلسطين 🇵🇸',
    regions: {
      west_bank: {
        label: 'الضفة الغربية',
        cities: [
          'رام الله', 'البيرة', 'نابلس', 'الخليل', 'بيت لحم', 'جنين', 'طولكرم', 'قلقيلية', 
          'سلفيت', 'أريحا', 'طوباس', 'بيت جالا', 'بيت ساحور', 'دورا', 'يطا', 'الظاهرية',
          'حلحول', 'سعير', 'بني نعيم', 'قباطية', 'عرابة', 'سيلة الحارثية', 'يعبد', 'برقين',
          'عنبتا', 'كفر قدوم', 'بيتا', 'حوارة', 'عصيرة الشمالية', 'عزون', 'كفل حارس',
          'دير استيا', 'بديا', 'الزبابدة', 'طمون'
        ]
      },
      jerusalem: {
        label: 'القدس',
        cities: [
          'القدس', 'أبو ديس', 'العيزرية', 'السواحرة', 'صور باهر', 'بيت حنينا', 'شعفاط',
          'العيسوية', 'سلوان', 'جبل المكبر', 'بيت صفافا'
        ]
      },
      inside: {
        label: 'الداخل (48)',
        cities: [
          'حيفا', 'الناصرة', 'عكا', 'أم الفحم', 'الطيبة', 'باقة الغربية', 'كفر قاسم',
          'يافا', 'اللد', 'الرملة', 'شفاعمرو', 'سخنين', 'طمرة', 'كفر كنا', 'عرابة',
          'الطيرة', 'كفر قرع', 'قلنسوة', 'جت', 'يافة الناصرة', 'المغار', 'طرعان',
          'كابول', 'دير الأسد', 'بئر المكسور', 'جلجولية', 'كفر مندا',
          'البعنة', 'دير حنا', 'عيلوط', 'ترشيحا', 'المزرعة', 'معليا', 'فسوطة',
          'حرفيش', 'الجديدة-المكر', 'يركا', 'أبو سنان', 'جسر الزرقاء', 'الفريديس',
          'عين ماهل', 'البقيعة', 'كسرى-سميع', 'الرينة', 'عرعرة', 'بسمة طبعون'
        ]
      }
    }
  },
  egypt: {
    label: 'مصر 🇪🇬',
    cities: [
      'القاهرة', 'الإسكندرية', 'الجيزة', 'شبرا الخيمة', 'بورسعيد', 'السويس', 'المحلة الكبرى',
      'الأقصر', 'أسوان', 'المنصورة', 'طنطا', 'الفيوم', 'الزقازيق', 'أسيوط', 'دمياط',
      'الإسماعيلية', 'كفر الشيخ', 'قنا', 'بني سويف', 'سوهاج', 'المنيا', 'شرم الشيخ', 'الغردقة'
    ]
  },
  saudi: {
    label: 'السعودية 🇸🇦',
    cities: [
      'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران',
      'الطائف', 'تبوك', 'بريدة', 'خميس مشيط', 'أبها', 'القطيف', 'الجبيل', 'حائل',
      'نجران', 'الهفوف', 'جيزان', 'ينبع', 'عرعر', 'سكاكا', 'القنفذة', 'رابغ'
    ]
  },
  jordan: {
    label: 'الأردن 🇯🇴',
    cities: [
      'عمان', 'إربد', 'الزرقاء', 'العقبة', 'السلط', 'مادبا', 'الكرك', 'جرش', 'معان',
      'عجلون', 'الطفيلة', 'الرمثا', 'المفرق'
    ]
  },
  uae: {
    label: 'الإمارات 🇦🇪',
    cities: [
      'دبي', 'أبو ظبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة', 'أم القيوين', 'العين'
    ]
  },
  other: {
    label: 'دولة أخرى 🌍',
    cities: []
  }
};

const checkoutSchema = z.object({
  name: z.string().trim().min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' }).max(100),
  phone: z.string().trim().min(10, { message: 'رقم الهاتف غير صحيح' }).max(20),
  city: z.string().min(1, { message: 'يرجى اختيار المدينة' }),
  address: z.string().trim().min(10, { message: 'العنوان يجب أن يكون 10 أحرف على الأقل' }).max(500),
});

// Progress steps component
const CheckoutProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { label: 'السلة', icon: ShoppingBag },
    { label: 'المعلومات', icon: Phone },
    { label: 'التأكيد', icon: CheckCircle2 },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
            index <= currentStep 
              ? "bg-primary text-primary-foreground shadow-lg" 
              : "bg-muted text-muted-foreground"
          )}>
            <step.icon className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "w-8 h-1 mx-2 rounded-full transition-all duration-500",
              index < currentStep ? "bg-primary" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
};

// Feature badges component with enhanced animations - now dynamic
const FeatureBadges = ({ badges, enabled }: { badges?: any[]; enabled?: boolean }) => {
  if (enabled === false) return null;
  
  const defaultBadges = [
    { icon: 'truck', label: 'توصيل سريع', enabled: true },
    { icon: 'shield', label: 'دفع آمن', enabled: true },
    { icon: 'clock', label: '24/7 دعم', enabled: true },
    { icon: 'gift', label: 'هدايا مجانية', enabled: true },
  ];
  
  const badgeList = badges || defaultBadges;
  const activeBadges = badgeList.filter(b => b.enabled !== false);
  
  const iconMap: Record<string, { icon: any; color: string; bg: string }> = {
    truck: { icon: Truck, color: 'text-blue-500', bg: 'bg-blue-500/10 hover:bg-blue-500/20' },
    shield: { icon: Shield, color: 'text-green-500', bg: 'bg-green-500/10 hover:bg-green-500/20' },
    clock: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10 hover:bg-orange-500/20' },
    gift: { icon: Gift, color: 'text-pink-500', bg: 'bg-pink-500/10 hover:bg-pink-500/20' },
  };
  
  if (activeBadges.length === 0) return null;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {activeBadges.map((feature, i) => {
        const iconInfo = iconMap[feature.icon] || iconMap.gift;
        const IconComponent = iconInfo.icon;
        
        return (
          <div 
            key={i} 
            className={cn(
              "flex items-center gap-2 p-3 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 group cursor-pointer",
              "hover:shadow-lg hover:-translate-y-1",
              iconInfo.bg
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-inner">
              <IconComponent className={cn("h-4 w-4 transition-all group-hover:scale-125", iconInfo.color)} />
            </div>
            <span className="text-xs font-bold">{feature.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, specialOffers, regularItems } = useCart();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [storePhone, setStorePhone] = useState('');
  const [deliveryPrices, setDeliveryPrices] = useState({
    west_bank: 20,
    jerusalem: 50,
    inside: 70,
  });
  const [selectedDelivery, setSelectedDelivery] = useState<'west_bank' | 'jerusalem' | 'inside'>('west_bank');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
  });
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [dialogStep, setDialogStep] = useState<'copy' | 'contact'>('copy');
  const [isScrolled, setIsScrolled] = useState(false);

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('970');
  
  // Social media
  const [socialMedia, setSocialMedia] = useState({
    whatsapp: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    snapchat: '',
  });
  
  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  
  // Gift system state
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [selectedGift, setSelectedGift] = useState<{ id: string; name: string; image_url: string | null; price: number } | null>(null);
  const [giftSkipped, setGiftSkipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [useSlideButton, setUseSlideButton] = useState(true);
  // Track scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch active gift offers
  const { data: activeGiftOffer } = useQuery({
    queryKey: ['active-gift-offer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_offers')
        .select('*')
        .eq('is_active', true)
        .order('minimum_amount', { ascending: false })
        .limit(1)
        .single();
      if (error) return null;
      return data;
    },
  });

  // Fetch gift products for active offer
  const { data: giftProducts } = useQuery({
    queryKey: ['gift-products', activeGiftOffer?.id],
    queryFn: async () => {
      if (!activeGiftOffer) return [];
      const { data, error } = await supabase
        .from('gift_products')
        .select(`
          product_id,
          products (id, name, image_url, price)
        `)
        .eq('gift_offer_id', activeGiftOffer.id);
      if (error) return [];
      return data
        .map((gp: any) => gp.products)
        .filter((p: any) => p !== null);
    },
    enabled: !!activeGiftOffer,
  });

  // Check if eligible for gift
  const isEligibleForGift = activeGiftOffer && total >= activeGiftOffer.minimum_amount;
  const remainingForGift = activeGiftOffer ? Math.max(0, activeGiftOffer.minimum_amount - total) : 0;

  useEffect(() => {
    const fetchSettings = async () => {
      setSettingsLoading(true);
      setSettingsError(null);
      
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('store_phone, delivery_west_bank, delivery_jerusalem, delivery_inside, whatsapp_number, whatsapp_country_code, social_whatsapp, social_instagram, social_facebook, social_tiktok, social_snapchat')
          .maybeSingle();
        
        if (error) {
          console.error('Settings fetch error:', error);
          setSettingsError('فشل في تحميل إعدادات المتجر. يرجى تحديث الصفحة.');
          return;
        }
        
        if (!data) {
          setSettingsError('لم يتم العثور على إعدادات المتجر.');
          return;
        }
        
        if (data.store_phone) {
          setStorePhone(data.store_phone);
        }
        setDeliveryPrices({
          west_bank: (data as any).delivery_west_bank || 20,
          jerusalem: (data as any).delivery_jerusalem || 50,
          inside: (data as any).delivery_inside || 70,
        });
        // WhatsApp settings
        if ((data as any).whatsapp_number) {
          let number = (data as any).whatsapp_number;
          // Remove leading zero if present
          if (number.startsWith('0')) {
            number = number.substring(1);
          }
          setWhatsappNumber(number);
        }
        if ((data as any).whatsapp_country_code) {
          setWhatsappCountryCode((data as any).whatsapp_country_code);
        }
        // Social media
        setSocialMedia({
          whatsapp: (data as any).social_whatsapp || '',
          instagram: (data as any).social_instagram || '',
          facebook: (data as any).social_facebook || '',
          tiktok: (data as any).social_tiktok || '',
          snapchat: (data as any).social_snapchat || '',
        });
      } catch (err) {
        console.error('Settings fetch exception:', err);
        setSettingsError('حدث خطأ أثناء تحميل الإعدادات. يرجى تحديث الصفحة.');
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setPromoLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error || !data) {
        toast({
          title: 'كود غير صالح',
          description: 'الكود غير موجود أو منتهي الصلاحية',
          variant: 'destructive',
        });
        return;
      }
      
      setAppliedPromo({
        code: data.code,
        discount: data.discount_percentage,
      });
      toast({
        title: '✓ تم تطبيق الكود',
        description: `خصم ${data.discount_percentage}% على طلبك`,
      });
    } catch (error) {
      console.error('Error applying promo code:', error);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  const discountAmount = appliedPromo ? (total * appliedPromo.discount) / 100 : 0;
  const totalAfterDiscount = total - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: 'السلة فارغة',
        description: 'يرجى إضافة منتجات إلى السلة أولاً',
        variant: 'destructive',
      });
      return;
    }

    // Validate form data
    try {
      checkoutSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'خطأ في البيانات',
          description: error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Check rate limit before processing order
      const rateLimit = await checkOrderRateLimit(formData.phone);
      if (!rateLimit.allowed) {
        toast({
          title: 'تم تجاوز الحد المسموح',
          description: `يمكنك إرسال ${5} طلبات فقط كل ${rateLimit.waitMinutes} دقيقة. يرجى المحاولة لاحقاً.`,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Record this order attempt
      await recordOrderAttempt(formData.phone);
      const deliveryCost = deliveryPrices[selectedDelivery];
      const discountAmt = appliedPromo ? (total * appliedPromo.discount) / 100 : 0;
      const totalAfterDisc = total - discountAmt;
      const totalWithDelivery = totalAfterDisc + deliveryCost;
      
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          total_amount: totalWithDelivery,
          status: 'Pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        selected_options: item.selected_options,
        price_at_purchase: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Send Telegram notification (don't block on failure)
      const deliveryAreaNames: Record<string, string> = {
        west_bank: 'الضفة الغربية',
        jerusalem: 'القدس',
        inside: 'الداخل (48)',
      };
      
      supabase.functions.invoke('send-telegram-notification', {
        body: {
          orderId: order.id,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerCity: formData.city,
          customerAddress: formData.address,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            selectedOptions: item.selected_options,
          })),
          deliveryArea: deliveryAreaNames[selectedDelivery],
          deliveryCost: deliveryCost,
          totalAmount: totalWithDelivery,
        },
      }).then(result => {
        console.log('Telegram notification result:', result);
      }).catch(err => {
        console.error('Telegram notification error:', err);
      });

      // 4. Format message for display
      let message = `🛍️ طلب جديد #${order.id.substring(0, 8)}\n\n`;
      message += `👤 الاسم: ${formData.name}\n`;
      message += `📱 الهاتف: ${formData.phone}\n`;
      message += `🏙️ المدينة: ${formData.city}\n`;
      message += `📍 العنوان: ${formData.address}\n\n`;
      
      // Special Offers
      if (specialOffers.length > 0) {
        message += `🎯 العروض الخاصة:\n`;
        specialOffers.forEach((item) => {
          message += `• ${item.name}`;
          if (item.special_offer?.products) {
            message += ` (${item.special_offer.products.map(p => p.name).join(' + ')})`;
          }
          message += ` × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ₪\n`;
        });
        message += `\n`;
      }
      
      // Regular Products
      if (regularItems.length > 0) {
        message += `📦 المنتجات:\n`;
        regularItems.forEach((item) => {
          message += `• ${item.name}`;
          if (item.selected_options.size) message += ` (مقاس: ${item.selected_options.size})`;
          if (item.selected_options.color) message += ` (لون: ${item.selected_options.color})`;
          message += ` × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ₪\n`;
        });
      }
      
      if (selectedGift) {
        message += `\n🎁 هدية مجانية: ${selectedGift.name}\n`;
      }
      if (appliedPromo) {
        message += `\n🏷️ كود الخصم: ${appliedPromo.code} (-${appliedPromo.discount}%)\n`;
        message += `💵 الخصم: -${discountAmt.toFixed(2)} ₪\n`;
      }
      message += `\n🚚 التوصيل (${deliveryAreaNames[selectedDelivery]}): ${deliveryCost.toFixed(2)} ₪\n`;
      message += `💰 المجموع الكلي: ${totalWithDelivery.toFixed(2)} ₪`;

      // 4. Show order details and call option
      if (!storePhone) {
        toast({
          title: 'خطأ',
          description: 'لم يتم تعيين رقم الهاتف في الإعدادات',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      setOrderMessage(message);
      setShowConfetti(true);
      setShowOrderDialog(true);
      
      // Save order ID to localStorage for this device
      const myOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
      myOrders.push(order.id);
      localStorage.setItem('my_orders', JSON.stringify(myOrders));
      
      toast({
        title: '✓ تم حفظ الطلب بنجاح',
        description: 'الآن يمكنك الاتصال لإتمام الطلب',
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error?.message || error?.code || 'خطأ غير معروف';
      toast({
        title: 'حدث خطأ',
        description: `يرجى المحاولة مرة أخرى. التفاصيل: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAndContinue = () => {
    navigator.clipboard.writeText(orderMessage);
    toast({
      title: '✓ تم النسخ',
      description: 'تم نسخ تفاصيل الطلب',
    });
    setDialogStep('contact');
  };

  const handleContactAndFinish = () => {
    // Open WhatsApp with the message
    if (whatsappNumber) {
      const fullNumber = `${whatsappCountryCode}${whatsappNumber}`;
      const encodedMessage = encodeURIComponent(orderMessage);
      window.open(`https://wa.me/${fullNumber}?text=${encodedMessage}`, '_blank');
    }
    clearCart();
    setShowOrderDialog(false);
    setDialogStep('copy');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 relative overflow-hidden" dir="rtl">
      {/* Floating Particles Background */}
      <FloatingParticles particleCount={15} />
      
      {/* Bouncing Balls Background */}
      <BouncingBalls 
        ballCount={4} 
        minRadius={30} 
        maxRadius={60} 
        speed={0.5}
        className="opacity-20"
      />
      
      {/* Confetti on Order Success */}
      <ConfettiEffect active={showConfetti} duration={4000} particleCount={80} />
      
      {/* Sticky Header */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-transparent"
      )}>
        <PublicHeader onCartOpen={() => {}} />
      </div>
      
      {/* Spacer for fixed header */}
      <div className="h-16" />
      
      {/* Success Dialog with Confetti Animation */}
      <AlertDialog open={showOrderDialog} onOpenChange={(open) => {
        setShowOrderDialog(open);
        if (!open) setDialogStep('copy');
      }}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 animate-in zoom-in-95 duration-300" dir="rtl">
          {/* Success Header with Animation */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center text-white relative overflow-hidden">
            {/* Sparkle decorations */}
            <div className="absolute top-2 left-4 animate-pulse">
              <Sparkles className="h-6 w-6 text-white/50" />
            </div>
            <div className="absolute bottom-2 right-4 animate-pulse delay-150">
              <Sparkles className="h-5 w-5 text-white/40" />
            </div>
            
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-white">
              ✓ تم حفظ طلبك بنجاح!
            </AlertDialogTitle>
            <p className="text-white/80 mt-2 text-sm">
              شكراً لثقتك بنا 💚
            </p>
          </div>
          
          <div className="p-6">
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-right">
                <p className="text-muted-foreground text-center mb-4">
                  اضغط على الزر أدناه للتواصل معنا عبر واتساب لإتمام الطلب
                </p>
                <div className="bg-muted/50 p-4 rounded-xl whitespace-pre-wrap text-foreground font-arabic text-sm leading-relaxed max-h-[200px] overflow-y-auto border">
                  {orderMessage}
                </div>
              </div>
            </AlertDialogDescription>

            {/* قسم التواصل مع السوشل ميديا */}
            <OrderSuccessSocialLinks
              socialMedia={socialMedia}
              whatsappNumber={whatsappNumber}
              whatsappCountryCode={whatsappCountryCode}
              iconStyle={((settings as any)?.social_icon_style || 'rounded') as 'rounded' | 'square' | 'minimal'}
              storeName={settings?.store_name}
            />
          </div>
          
          <AlertDialogFooter className="p-6 pt-0">
            <AlertDialogAction asChild>
              <Button
                onClick={handleContactAndFinish}
                size="lg"
                className="w-full gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                <MessageCircle className="h-6 w-6" />
                إغلاق والعودة للرئيسية
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container py-8 max-w-5xl">
        {/* Back Button with animation */}
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-muted group transition-all duration-300" 
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          رجوع للسلة
        </Button>

        {/* Settings Loading State with improved animation */}
        {settingsLoading && (
          <div className="text-center py-16 animate-in fade-in duration-500">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground text-lg">جاري تحميل الإعدادات...</p>
            <p className="text-muted-foreground/60 text-sm mt-2">يرجى الانتظار لحظات</p>
          </div>
        )}

        {/* Settings Error State */}
        {settingsError && !settingsLoading && (
          <div className="text-center py-16 animate-in fade-in duration-500">
            <div className="bg-destructive/10 text-destructive p-8 rounded-2xl max-w-md mx-auto border border-destructive/20">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="font-bold text-xl mb-2">خطأ في التحميل</p>
              <p className="mb-6">{settingsError}</p>
              <Button 
                size="lg" 
                onClick={() => window.location.reload()}
                className="transition-all duration-300 hover:scale-105"
              >
                تحديث الصفحة
              </Button>
            </div>
          </div>
        )}

        {/* Main Content - only show when settings loaded successfully */}
        {!settingsLoading && !settingsError && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Exclusive Offer Badge */}
            <div className="flex justify-center mb-6">
              <ExclusiveOfferBadge
                label="عرض خاص"
                description="توصيل مجاني للطلبات فوق 200₪!"
                variant="success"
              />
            </div>
            
            {/* Progress Steps */}
            <CheckoutProgress currentStep={1} />
            
            {/* Feature Badges */}
            <FeatureBadges 
              badges={(settings as any)?.checkout_badges} 
              enabled={(settings as any)?.checkout_badges_enabled !== false} 
            />
            
            <div className="grid lg:grid-cols-5 gap-8">
              <GlowingCard className="lg:col-span-3" borderGlow hoverEffect>
                <div className="p-6 md:p-8">
                  <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    إتمام الطلب
                  </h1>
                
                {/* Gift Notification Banner */}
                {activeGiftOffer && giftProducts && giftProducts.length > 0 && (
                  <GiftNotificationBanner
                    currentAmount={total}
                    minimumAmount={activeGiftOffer.minimum_amount}
                    remainingAmount={remainingForGift}
                  />
                )}

                {/* Gift Selection Dialog */}
                <GiftSelectionDialog
                  open={showGiftDialog}
                  onOpenChange={setShowGiftDialog}
                  giftProducts={giftProducts || []}
                  minimumAmount={activeGiftOffer?.minimum_amount || 0}
                  onSelectGift={(gift) => {
                    setSelectedGift(gift);
                    setShowGiftDialog(false);
                    toast({
                      title: '🎁 تم اختيار الهدية',
                      description: `تمت إضافة "${gift.name}" كهدية مجانية`,
                    });
                  }}
                  onSkip={() => {
                    setGiftSkipped(true);
                    setShowGiftDialog(false);
                  }}
                />

                {/* Selected Gift Display with animation */}
                {selectedGift && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                      <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-700 dark:text-green-400">هديتك: {selectedGift.name}</p>
                      <p className="text-xs text-green-600/70 dark:text-green-500/70">ستضاف مجاناً مع طلبك</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGiftDialog(true)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-800"
                    >
                      تغيير
                    </Button>
                  </div>
                )}

                {/* Show gifts based on display mode */}
                {isEligibleForGift && !selectedGift && !giftSkipped && giftProducts && giftProducts.length > 0 && (
                  (settings as any)?.gift_display_mode === 'inline' ? (
                    <GiftProductsDisplay
                      products={giftProducts}
                      selectedGift={selectedGift}
                      onSelectGift={(gift) => {
                        setSelectedGift(gift);
                        toast({ title: '🎁 تم اختيار الهدية', description: `تمت إضافة "${gift.name}" كهدية مجانية` });
                      }}
                      minimumAmount={activeGiftOffer?.minimum_amount || 0}
                      currentAmount={total}
                    />
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mb-4 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
                      onClick={() => setShowGiftDialog(true)}
                    >
                      <Gift className="h-4 w-4 transition-transform group-hover:scale-110" />
                      اختر هديتك المجانية
                      <Sparkles className="h-4 w-4 animate-pulse" />
                    </Button>
                  )
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <div className="space-y-2 group">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      الاسم الكامل *
                    </Label>
                    <Input
                      id="name"
                      placeholder="أدخل اسمك الكامل"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      maxLength={100}
                      className="h-12 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
                    />
                  </div>
                  
                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      maxLength={20}
                      className="h-12 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
                    />
                  </div>
                  
                  {/* City Field */}
                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة / البلد *</Label>
                    <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                      <SelectTrigger id="city" className="w-full h-12 transition-all duration-300 focus:ring-2 focus:ring-primary/20 hover:border-primary/50">
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border max-h-[300px]">
                        {/* Palestine */}
                        <SelectGroup>
                          <SelectLabel className="text-muted-foreground font-bold text-base">{CITIES_DATA.palestine.label}</SelectLabel>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-muted-foreground font-semibold pr-4">{CITIES_DATA.palestine.regions.west_bank.label}</SelectLabel>
                          {CITIES_DATA.palestine.regions.west_bank.cities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-muted-foreground font-semibold pr-4">{CITIES_DATA.palestine.regions.jerusalem.label}</SelectLabel>
                          {CITIES_DATA.palestine.regions.jerusalem.cities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-muted-foreground font-semibold pr-4">{CITIES_DATA.palestine.regions.inside.label}</SelectLabel>
                          {CITIES_DATA.palestine.regions.inside.cities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectGroup>
                        
                        {/* Egypt */}
                        <SelectGroup>
                          <SelectLabel className="text-muted-foreground font-bold text-base border-t mt-2 pt-2">{CITIES_DATA.egypt.label}</SelectLabel>
                          {CITIES_DATA.egypt.cities.map((city) => (
                            <SelectItem key={`eg-${city}`} value={`مصر - ${city}`}>{city}</SelectItem>
                          ))}
                        </SelectGroup>
                        
                        {/* Saudi Arabia */}
                        <SelectGroup>
                          <SelectLabel className="text-muted-foreground font-bold text-base border-t mt-2 pt-2">{CITIES_DATA.saudi.label}</SelectLabel>
                          {CITIES_DATA.saudi.cities.map((city) => (
                            <SelectItem key={`sa-${city}`} value={`السعودية - ${city}`}>{city}</SelectItem>
                          ))}
                        </SelectGroup>
                        
                        {/* Jordan */}
                        <SelectGroup>
                          <SelectLabel className="text-muted-foreground font-bold text-base border-t mt-2 pt-2">{CITIES_DATA.jordan.label}</SelectLabel>
                          {CITIES_DATA.jordan.cities.map((city) => (
                            <SelectItem key={`jo-${city}`} value={`الأردن - ${city}`}>{city}</SelectItem>
                          ))}
                        </SelectGroup>
                        
                        {/* UAE */}
                        <SelectGroup>
                          <SelectLabel className="text-muted-foreground font-bold text-base border-t mt-2 pt-2">{CITIES_DATA.uae.label}</SelectLabel>
                          {CITIES_DATA.uae.cities.map((city) => (
                            <SelectItem key={`ae-${city}`} value={`الإمارات - ${city}`}>{city}</SelectItem>
                          ))}
                        </SelectGroup>
                        
                        {/* Other */}
                        <SelectGroup>
                          <SelectLabel className="text-muted-foreground font-bold text-base border-t mt-2 pt-2">{CITIES_DATA.other.label}</SelectLabel>
                          <SelectItem value="دولة أخرى">أخرى (سأكتب في العنوان)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Address Field */}
                  <div className="space-y-2">
                    <Label htmlFor="address">عنوان التوصيل التفصيلي *</Label>
                    <Textarea
                      id="address"
                      placeholder="أدخل الحي، الشارع، رقم المنزل، أو أي تفاصيل إضافية"
                      rows={4}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      maxLength={500}
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 resize-none"
                    />
                  </div>
                  
                  {/* Delivery Zone Selection with enhanced styling */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      منطقة التوصيل *
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { key: 'west_bank', label: 'الضفة الغربية', price: deliveryPrices.west_bank },
                        { key: 'jerusalem', label: 'القدس', price: deliveryPrices.jerusalem },
                        { key: 'inside', label: 'الداخل (48)', price: deliveryPrices.inside },
                      ].map((zone) => (
                        <button
                          key={zone.key}
                          type="button"
                          onClick={() => setSelectedDelivery(zone.key as 'west_bank' | 'jerusalem' | 'inside')}
                          className={cn(
                            "p-4 rounded-xl border-2 text-right transition-all duration-300 group",
                            selectedDelivery === zone.key
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                selectedDelivery === zone.key 
                                  ? "border-primary bg-primary" 
                                  : "border-muted-foreground"
                              )}>
                                {selectedDelivery === zone.key && (
                                  <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <span className="font-semibold">{zone.label}</span>
                            </div>
                            <span className={cn(
                              "font-bold px-3 py-1 rounded-full text-sm transition-all",
                              selectedDelivery === zone.key
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {zone.price.toFixed(2)} ₪
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Estimated delivery time */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <Clock className="h-4 w-4" />
                      <span>وقت التوصيل المتوقع: 2-5 أيام عمل</span>
                    </div>
                  </div>
                  
                  {/* Promo Code with enhanced styling */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      كود الخصم
                    </Label>
                    {appliedPromo ? (
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-300 dark:border-green-700 animate-in fade-in duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <span className="font-bold text-green-700 dark:text-green-400">
                              {appliedPromo.code}
                            </span>
                            <span className="text-green-600 dark:text-green-500 text-sm mr-2">
                              (-{appliedPromo.discount}%)
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removePromoCode}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          إزالة
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="أدخل كود الخصم"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="flex-1 h-12 transition-all duration-300 focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={applyPromoCode}
                          disabled={promoLoading || !promoCode.trim()}
                          className="h-12 px-6 transition-all duration-300 hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                        >
                          {promoLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'تطبيق'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Submit Button with enhanced styling */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                        إتمام الطلب
                      </>
                    )}
                  </Button>
                  
                  {/* Social Media Links with enhanced styling */}
                  <div className="pt-6 border-t">
                    <p className="text-center text-sm text-muted-foreground mb-4">
                      تواصل معنا عبر
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {whatsappNumber && (
                        <a
                          href={`https://wa.me/${whatsappCountryCode}${whatsappNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        >
                          <MessageCircle className="h-6 w-6" />
                        </a>
                      )}
                      {socialMedia.instagram && (
                        <a
                          href={`https://instagram.com/${socialMedia.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-90 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        >
                          <Instagram className="h-6 w-6" />
                        </a>
                      )}
                      {socialMedia.facebook && (
                        <a
                          href={`https://facebook.com/${socialMedia.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        >
                          <Facebook className="h-6 w-6" />
                        </a>
                      )}
                      {socialMedia.tiktok && (
                        <a
                          href={`https://tiktok.com/@${socialMedia.tiktok}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-black hover:bg-gray-800 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        >
                          <SiTiktok className="h-6 w-6" />
                        </a>
                      )}
                      {socialMedia.snapchat && (
                        <a
                          href={`https://snapchat.com/add/${socialMedia.snapchat}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        >
                          <SiSnapchat className="h-6 w-6" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Help Link */}
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                      onClick={() => {
                        if (whatsappNumber) {
                          window.open(`https://wa.me/${whatsappCountryCode}${whatsappNumber}?text=${encodeURIComponent('مرحباً، لدي استفسار حول الطلب')}`, '_blank');
                        }
                      }}
                    >
                      <HelpCircle className="h-4 w-4" />
                      هل تحتاج مساعدة؟
                    </button>
                  </div>
                </form>
                </div>
              </GlowingCard>

              {/* Order Summary - Sticky on desktop */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-24">
                  <div className="bg-card rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      ملخص الطلب
                      <span className="text-sm font-normal text-muted-foreground mr-auto">
                        ({items.length} منتج)
                      </span>
                    </h2>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {/* Special Offers Section */}
                      {specialOffers.length > 0 && (
                        <div className="space-y-2">
                          {specialOffers.map((item, index) => (
                            <div 
                              key={item.id} 
                              className="rounded-xl p-3 animate-in fade-in slide-in-from-right-2"
                              style={{ 
                                backgroundColor: item.special_offer?.background_color || '#7c3aed',
                                color: item.special_offer?.text_color || '#ffffff',
                                animationDelay: `${index * 50}ms` 
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                  <Sparkles className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm">🎯 {item.name}</p>
                                  {item.special_offer?.products && (
                                    <p className="text-xs opacity-80 mt-0.5">
                                      {item.special_offer.products.map(p => p.name).join(' • ')}
                                    </p>
                                  )}
                                </div>
                                <p className="font-bold text-sm whitespace-nowrap">
                                  {(item.price * item.quantity).toFixed(2)} ₪
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Regular Items */}
                      {regularItems.map((item, index) => (
                        <div 
                          key={item.id} 
                          className="flex gap-3 pb-3 border-b last:border-0 animate-in fade-in slide-in-from-right-2"
                          style={{ animationDelay: `${(specialOffers.length + index) * 50}ms` }}
                        >
                          {item.image_url && (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.selected_options.size && `${item.selected_options.size}`}
                              {item.selected_options.size && item.selected_options.color && ' • '}
                              {item.selected_options.color && `${item.selected_options.color}`}
                              {' × '}{item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-sm whitespace-nowrap">
                            {(item.price * item.quantity).toFixed(2)} ₪
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Selected Gift in Summary */}
                    {selectedGift && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Gift className="h-4 w-4" />
                        <span className="text-sm font-medium">🎁 {selectedGift.name}</span>
                        <span className="text-xs mr-auto">مجاناً</span>
                      </div>
                    )}
                    
                    <div className="space-y-2 pt-4 mt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">المجموع الفرعي</span>
                        <span>{total.toFixed(2)} ₪</span>
                      </div>
                      {appliedPromo && (
                        <div className="flex justify-between text-sm text-green-600 animate-in fade-in duration-300">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            الخصم ({appliedPromo.discount}%)
                          </span>
                          <span>-{discountAmount.toFixed(2)} ₪</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          التوصيل
                        </span>
                        <span>{deliveryPrices[selectedDelivery].toFixed(2)} ₪</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold pt-4 mt-4 border-t-2 border-primary/20">
                      <span>المجموع الكلي</span>
                      <span className="text-primary text-xl">{(totalAfterDiscount + deliveryPrices[selectedDelivery]).toFixed(2)} ₪</span>
                    </div>
                    
                    {/* Trust badges */}
                    <div className="mt-6 pt-4 border-t space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>طلب آمن ومحمي 100%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4 text-blue-500" />
                        <span>توصيل سريع لجميع المناطق</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 text-orange-500" />
                        <span>دعم على مدار الساعة</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
