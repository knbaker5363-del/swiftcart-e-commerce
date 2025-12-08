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
import { ArrowRight, Phone, Copy, MessageCircle, Tag, Instagram, Facebook, Gift, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { SiTiktok, SiSnapchat } from 'react-icons/si';
import { GiftSelectionDialog } from '@/components/GiftSelectionDialog';
import { GiftNotificationBanner } from '@/components/GiftNotificationBanner';
import { checkOrderRateLimit, recordOrderAttempt } from '@/lib/rateLimiter';

const PALESTINIAN_CITIES = {
  west_bank: [
    'رام الله', 'البيرة', 'نابلس', 'الخليل', 'بيت لحم', 'جنين', 'طولكرم', 'قلقيلية', 
    'سلفيت', 'أريحا', 'طوباس', 'بيت جالا', 'بيت ساحور', 'دورا', 'يطا', 'الظاهرية',
    'حلحول', 'سعير', 'بني نعيم', 'قباطية', 'عرابة', 'سيلة الحارثية', 'يعبد', 'برقين',
    'عنبتا', 'كفر قدوم', 'بيتا', 'حوارة', 'عصيرة الشمالية', 'عزون', 'كفل حارس',
    'دير استيا', 'بديا', 'الزبابدة', 'طمون'
  ],
  jerusalem: [
    'القدس', 'أبو ديس', 'العيزرية', 'السواحرة', 'صور باهر', 'بيت حنينا', 'شعفاط',
    'العيسوية', 'سلوان', 'جبل المكبر', 'بيت صفافا'
  ],
  inside: [
    'حيفا', 'الناصرة', 'عكا', 'أم الفحم', 'الطيبة', 'باقة الغربية', 'كفر قاسم',
    'يافا', 'اللد', 'الرملة', 'شفاعمرو', 'سخنين', 'طمرة', 'كفر كنا', 'عرابة',
    'الطيرة', 'كفر قرع', 'قلنسوة', 'جت', 'يافة الناصرة', 'المغار', 'طرعان',
    'كابول', 'دير الأسد', 'بئر المكسور', 'جلجولية', 'الطيبة', 'كفر مندا',
    'البعنة', 'دير حنا', 'عيلوط', 'ترشيحا', 'المزرعة', 'معليا', 'فسوطة',
    'حرفيش', 'الجديدة-المكر', 'يركا', 'أبو سنان', 'جسر الزرقاء', 'الفريديس',
    'عين ماهل', 'ام الفحم', 'البقيعة', 'كسرى-سميع', 'الرينة', 'عرعرة', 'بسمة طبعون'
  ]
};

const checkoutSchema = z.object({
  name: z.string().trim().min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' }).max(100),
  phone: z.string().trim().min(10, { message: 'رقم الهاتف غير صحيح' }).max(20),
  city: z.string().min(1, { message: 'يرجى اختيار المدينة' }),
  address: z.string().trim().min(10, { message: 'العنوان يجب أن يكون 10 أحرف على الأقل' }).max(500),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
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
        title: 'تم تطبيق الكود',
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
      
      message += `📦 المنتجات:\n`;
      items.forEach((item) => {
        message += `• ${item.name}`;
        if (item.selected_options.size) message += ` (مقاس: ${item.selected_options.size})`;
        if (item.selected_options.color) message += ` (لون: ${item.selected_options.color})`;
        message += ` × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ₪\n`;
      });
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
      setShowOrderDialog(true);
      
      // Save order ID to localStorage for this device
      const myOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
      myOrders.push(order.id);
      localStorage.setItem('my_orders', JSON.stringify(myOrders));
      
      toast({
        title: 'تم حفظ الطلب بنجاح',
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
      title: 'تم النسخ',
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
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => {}} />
      
      <AlertDialog open={showOrderDialog} onOpenChange={(open) => {
        setShowOrderDialog(open);
        if (!open) setDialogStep('copy');
      }}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">تفاصيل الطلب</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-right">
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-foreground font-arabic text-base leading-relaxed">
                  {orderMessage}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 justify-center">
            <AlertDialogAction asChild>
              <Button
                onClick={handleContactAndFinish}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4" />
                تواصل معنا
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowRight className="ml-2 h-4 w-4" />
          رجوع
        </Button>

        {/* Settings Loading State */}
        {settingsLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل الإعدادات...</p>
          </div>
        )}

        {/* Settings Error State */}
        {settingsError && !settingsLoading && (
          <div className="text-center py-12">
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md mx-auto">
              <p className="font-bold mb-2">خطأ في التحميل</p>
              <p className="mb-4">{settingsError}</p>
              <Button onClick={() => window.location.reload()}>
                تحديث الصفحة
              </Button>
            </div>
          </div>
        )}

        {/* Main Content - only show when settings loaded successfully */}
        {!settingsLoading && !settingsError && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <h1 className="text-3xl font-bold mb-6">إتمام الطلب</h1>
            
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
              }}
              onSkip={() => {
                setGiftSkipped(true);
                setShowGiftDialog(false);
              }}
            />

            {/* Selected Gift Display */}
            {selectedGift && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <Gift className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-semibold text-green-700">هديتك: {selectedGift.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGiftDialog(true)}
                  className="text-green-600"
                >
                  تغيير
                </Button>
              </div>
            )}

            {/* Show gift button if eligible but not selected */}
            {isEligibleForGift && !selectedGift && !giftSkipped && giftProducts && giftProducts.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full mb-4 gap-2 border-primary text-primary"
                onClick={() => setShowGiftDialog(true)}
              >
                <Gift className="h-4 w-4" />
                اختر هديتك المجانية
              </Button>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم الكامل *</Label>
                <Input
                  id="name"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  maxLength={20}
                />
              </div>
              <div>
                <Label htmlFor="city">المدينة *</Label>
                <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                  <SelectTrigger id="city" className="w-full">
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border max-h-[300px]">
                    <SelectGroup>
                      <SelectLabel className="text-muted-foreground font-semibold">الضفة الغربية</SelectLabel>
                      {PALESTINIAN_CITIES.west_bank.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel className="text-muted-foreground font-semibold">القدس</SelectLabel>
                      {PALESTINIAN_CITIES.jerusalem.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel className="text-muted-foreground font-semibold">الداخل (48)</SelectLabel>
                      {PALESTINIAN_CITIES.inside.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="address">عنوان التوصيل التفصيلي *</Label>
                <Textarea
                  id="address"
                  placeholder="أدخل الحي، الشارع، رقم المنزل، أو أي تفاصيل إضافية"
                  rows={4}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  maxLength={500}
                />
              </div>
              
              <div>
                <Label>منطقة التوصيل *</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDelivery('west_bank')}
                    className={`p-4 rounded-lg border-2 text-right transition-all ${
                      selectedDelivery === 'west_bank'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">الضفة الغربية</span>
                      <span className="text-primary font-bold">{deliveryPrices.west_bank.toFixed(2)} ₪</span>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedDelivery('jerusalem')}
                    className={`p-4 rounded-lg border-2 text-right transition-all ${
                      selectedDelivery === 'jerusalem'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">القدس</span>
                      <span className="text-primary font-bold">{deliveryPrices.jerusalem.toFixed(2)} ₪</span>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedDelivery('inside')}
                    className={`p-4 rounded-lg border-2 text-right transition-all ${
                      selectedDelivery === 'inside'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">الداخل (48)</span>
                      <span className="text-primary font-bold">{deliveryPrices.inside.toFixed(2)} ₪</span>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Promo Code */}
              <div className="space-y-2">
                <Label>كود الخصم</Label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-400">
                        {appliedPromo.code} (-{appliedPromo.discount}%)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removePromoCode}
                      className="text-red-500 hover:text-red-700"
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
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={applyPromoCode}
                      disabled={promoLoading || !promoCode.trim()}
                    >
                      {promoLoading ? 'جاري...' : 'تطبيق'}
                    </Button>
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                <Phone className="ml-2 h-5 w-5" />
                {loading ? 'جاري الحفظ...' : 'إتمام الطلب'}
              </Button>
              
              {/* Social Media Links */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t flex-wrap">
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappCountryCode}${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </a>
                )}
                {socialMedia.instagram && (
                  <a
                    href={`https://instagram.com/${socialMedia.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-90 text-white transition-opacity"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
                {socialMedia.facebook && (
                  <a
                    href={`https://facebook.com/${socialMedia.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                {socialMedia.tiktok && (
                  <a
                    href={`https://tiktok.com/@${socialMedia.tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-black hover:bg-gray-800 text-white transition-colors"
                  >
                    <SiTiktok className="h-6 w-6" />
                  </a>
                )}
                {socialMedia.snapchat && (
                  <a
                    href={`https://snapchat.com/add/${socialMedia.snapchat}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black transition-colors"
                  >
                    <SiSnapchat className="h-6 w-6" />
                  </a>
                )}
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold mb-4">ملخص الطلب</h2>
            <Card className="p-6 shadow-card bg-gradient-card">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm pb-2 border-b">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">
                        {item.selected_options.size && `مقاس: ${item.selected_options.size}`}
                        {item.selected_options.color && ` • لون: ${item.selected_options.color}`}
                      </p>
                      <p className="text-muted-foreground">الكمية: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      {(item.price * item.quantity).toFixed(2)} ₪
                    </p>
                  </div>
                ))}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>المجموع الفرعي:</span>
                    <span>{total.toFixed(2)} ₪</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>الخصم ({appliedPromo.discount}%):</span>
                      <span>-{discountAmount.toFixed(2)} ₪</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>التوصيل:</span>
                    <span>{deliveryPrices[selectedDelivery].toFixed(2)} ₪</span>
                  </div>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t-2">
                  <span>المجموع الكلي:</span>
                  <span className="text-primary">{(totalAfterDiscount + deliveryPrices[selectedDelivery]).toFixed(2)} ₪</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;