import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const AdminOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ['order-items', selectedOrder?.id],
    enabled: !!selectedOrder,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, products(name, image_url)')
        .eq('order_id', selectedOrder.id);
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'تم تحديث حالة الطلب' });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Pending: 'secondary',
      Processing: 'default',
      Shipped: 'default',
      Delivered: 'default',
      Cancelled: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status === 'Pending' && 'قيد الانتظار'}
        {status === 'Processing' && 'قيد المعالجة'}
        {status === 'Shipped' && 'تم الشحن'}
        {status === 'Delivered' && 'تم التسليم'}
        {status === 'Cancelled' && 'ملغي'}
      </Badge>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">إدارة الطلبات</h1>

      <div className="grid gap-4">
        {orders?.map((order) => (
          <Card key={order.id} className="p-4 shadow-card cursor-pointer hover:shadow-card-hover transition-shadow"
            onClick={() => setSelectedOrder(order)}>
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{order.customer_name}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  📱 {order.customer_phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  📍 {order.customer_address}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  📅 {format(new Date(order.created_at), 'PPp', { locale: ar })}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-bold text-primary">
                  {order.total_amount.toFixed(2)} ₪
                </p>
                <Select
                  value={order.status}
                  onValueChange={(status) => {
                    updateStatusMutation.mutate({ id: order.id, status });
                  }}
                >
                  <SelectTrigger className="mt-2 w-40" onClick={(e) => e.stopPropagation()}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">قيد الانتظار</SelectItem>
                    <SelectItem value="Processing">قيد المعالجة</SelectItem>
                    <SelectItem value="Shipped">تم الشحن</SelectItem>
                    <SelectItem value="Delivered">تم التسليم</SelectItem>
                    <SelectItem value="Cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">العميل</p>
                  <p className="font-semibold">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الهاتف</p>
                  <p className="font-semibold">{selectedOrder.customer_phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">العنوان</p>
                  <p className="font-semibold">{selectedOrder.customer_address}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">المنتجات</h3>
                <div className="space-y-3">
                  {orderItems?.map((item: any) => (
                    <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                      {item.products?.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.products?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.selected_options?.size && `مقاس: ${item.selected_options.size}`}
                          {item.selected_options?.color && ` • لون: ${item.selected_options.color}`}
                        </p>
                        <p className="text-sm">
                          الكمية: {item.quantity} × {item.price_at_purchase.toFixed(2)} ₪
                        </p>
                      </div>
                      <p className="font-semibold">
                        {(item.quantity * item.price_at_purchase).toFixed(2)} ₪
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                <span className="text-lg font-semibold">المجموع الكلي</span>
                <span className="text-2xl font-bold text-primary">
                  {selectedOrder.total_amount.toFixed(2)} ₪
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;