import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicHeader } from '@/components/PublicHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Send } from 'lucide-react';
import { z } from 'zod';

const checkoutSchema = z.object({
  name: z.string().trim().min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' }).max(100),
  phone: z.string().trim().min(10, { message: 'رقم الهاتف غير صحيح' }).max(20),
  address: z.string().trim().min(10, { message: 'العنوان يجب أن يكون 10 أحرف على الأقل' }).max(500),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

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
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          total_amount: total,
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
      message += `📍 العنوان: ${formData.address}\n\n`;
      message += `📦 المنتجات:\n`;
      items.forEach((item) => {
        message += `• ${item.name}`;
        if (item.selected_options.size) message += ` (مقاس: ${item.selected_options.size})`;
        if (item.selected_options.color) message += ` (لون: ${item.selected_options.color})`;
        message += ` × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ر.س\n`;
      });
      message += `\n💰 المجموع: ${total.toFixed(2)} ر.س`;

      // 4. Open WhatsApp
      const whatsappNumber = '966500000000'; // Replace with your WhatsApp number
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');

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
                <Label htmlFor="address">عنوان التوصيل *</Label>
                <Textarea
                  id="address"
                  placeholder="أدخل عنوان التوصيل بالتفصيل"
                  rows={4}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  maxLength={500}
                />
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
                      {(item.price * item.quantity).toFixed(2)} ر.س
                    </p>
                  </div>
                ))}
                <div className="flex justify-between text-xl font-bold pt-4 border-t-2">
                  <span>المجموع:</span>
                  <span className="text-primary">{total.toFixed(2)} ر.س</span>
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