import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicHeader } from '@/components/PublicHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Send } from 'lucide-react';
import { z } from 'zod';

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
  const [whatsappNumber, setWhatsappNumber] = useState('');
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

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('whatsapp_country_code, whatsapp_number, delivery_west_bank, delivery_jerusalem, delivery_inside')
        .single();
      
      if (data) {
        if (data.whatsapp_number) {
          setWhatsappNumber(`${data.whatsapp_country_code}${data.whatsapp_number}`);
        }
        setDeliveryPrices({
          west_bank: (data as any).delivery_west_bank || 20,
          jerusalem: (data as any).delivery_jerusalem || 50,
          inside: (data as any).delivery_inside || 70,
        });
      }
    };
    fetchSettings();
  }, []);

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
      const deliveryCost = deliveryPrices[selectedDelivery];
      const totalWithDelivery = total + deliveryCost;
      
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

      // 3. Format WhatsApp message
      let message = `🛍️ طلب جديد #${order.id.substring(0, 8)}\n\n`;
      message += `👤 الاسم: ${formData.name}\n`;
      message += `📱 الهاتف: ${formData.phone}\n`;
      message += `🏙️ المدينة: ${formData.city}\n`;
      message += `📍 العنوان: ${formData.address}\n\n`;
      const deliveryAreaNames = {
        west_bank: 'الضفة الغربية',
        jerusalem: 'القدس',
        inside: 'الداخل (48)',
      };
      
      message += `📦 المنتجات:\n`;
      items.forEach((item) => {
        message += `• ${item.name}`;
        if (item.selected_options.size) message += ` (مقاس: ${item.selected_options.size})`;
        if (item.selected_options.color) message += ` (لون: ${item.selected_options.color})`;
        message += ` × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ₪\n`;
      });
      message += `\n🚚 التوصيل (${deliveryAreaNames[selectedDelivery]}): ${deliveryCost.toFixed(2)} ₪\n`;
      message += `💰 المجموع الكلي: ${totalWithDelivery.toFixed(2)} ₪`;

      // 4. Open WhatsApp
      if (!whatsappNumber) {
        toast({
          title: 'خطأ',
          description: 'لم يتم تعيين رقم واتساب في الإعدادات',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      const encodedMessage = encodeURIComponent(message);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const whatsappUrl = isMobile 
        ? `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`
        : `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');

      // 5. Clear cart
      clearCart();

      toast({
        title: 'تم إرسال الطلب بنجاح',
        description: 'سيتم التواصل معك قريباً',
      });

      navigate('/');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'حدث خطأ',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => {}} />

      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowRight className="ml-2 h-4 w-4" />
          رجوع
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <h1 className="text-3xl font-bold mb-6">إتمام الطلب</h1>
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
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-primary shadow-button"
                disabled={loading}
              >
                <Send className="ml-2 h-5 w-5" />
                {loading ? 'جاري الإرسال...' : 'إرسال الطلب عبر واتساب'}
              </Button>
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
                  <div className="flex justify-between text-sm">
                    <span>التوصيل:</span>
                    <span>{deliveryPrices[selectedDelivery].toFixed(2)} ₪</span>
                  </div>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t-2">
                  <span>المجموع الكلي:</span>
                  <span className="text-primary">{(total + deliveryPrices[selectedDelivery]).toFixed(2)} ₪</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;