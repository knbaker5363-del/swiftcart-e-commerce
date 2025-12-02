import { useState } from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const MyOrders = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال رقم الهاتف',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', phone.trim())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);

      if (!data || data.length === 0) {
        toast({
          title: 'لا توجد طلبات',
          description: 'لم يتم العثور على طلبات بهذا الرقم',
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'حدث خطأ',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'قيد الانتظار';
      case 'processing':
        return 'قيد المعالجة';
      case 'shipped':
        return 'تم الشحن';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => {}} />

      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">طلباتي</h1>

        <Card className="p-6 mb-8 shadow-card">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="أدخل رقم هاتفك"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground mt-2">
                أدخل رقم الهاتف الذي استخدمته عند إتمام الطلب
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-primary"
              disabled={loading}
            >
              <Search className="ml-2 h-5 w-5" />
              {loading ? 'جاري البحث...' : 'البحث عن طلباتي'}
            </Button>
          </form>
        </Card>

        {searched && orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">لا توجد طلبات</p>
            <p className="text-muted-foreground mt-2">
              لم يتم العثور على أي طلبات بهذا الرقم
            </p>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6 shadow-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">
                      طلب #{order.id.substring(0, 8).toUpperCase()}
                    </h3>
                    <Badge className={`${getStatusColor(order.status)} text-white flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-primary">
                    {order.total_amount.toFixed(2)} ₪
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الاسم:</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">العنوان:</span>
                  <span className="font-medium text-left max-w-[60%]">
                    {order.customer_address}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
