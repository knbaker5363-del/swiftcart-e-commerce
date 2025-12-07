import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Package, Clock, Loader2, CheckCircle, XCircle, Truck, Trash2, Calendar } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('all');

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

  // Filter orders by date
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= todayStart && orderDate <= todayEnd;
        });
      case 'yesterday':
        const yesterday = subDays(now, 1);
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= yesterdayStart && orderDate <= yesterdayEnd;
        });
      case 'thisWeek':
        const weekStart = startOfWeek(now, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= weekStart && orderDate <= weekEnd;
        });
      case 'thisMonth':
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= monthStart && orderDate <= monthEnd;
        });
      case 'pending':
        return orders.filter(o => o.status === 'Pending');
      case 'processing':
        return orders.filter(o => o.status === 'Processing');
      case 'shipped':
        return orders.filter(o => o.status === 'Shipped');
      case 'delivered':
        return orders.filter(o => o.status === 'Delivered');
      case 'cancelled':
        return orders.filter(o => o.status === 'Cancelled');
      default:
        return orders;
    }
  }, [orders, dateFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!orders) return { thisMonth: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const thisMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });

    return {
      thisMonth: thisMonthOrders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
    };
  }, [orders]);

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

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);
      if (itemsError) throw itemsError;
      
      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      if (orderError) throw orderError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'تم حذف الطلب بنجاح' });
      setOrderToDelete(null);
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({ title: 'خطأ في حذف الطلب', variant: 'destructive' });
    }
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

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case 'today': return 'طلبات اليوم';
      case 'yesterday': return 'طلبات الأمس';
      case 'thisWeek': return 'طلبات هذا الأسبوع';
      case 'thisMonth': return 'طلبات هذا الشهر';
      case 'pending': return 'قيد الانتظار';
      case 'processing': return 'قيد المعالجة';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغية';
      default: return 'جميع الطلبات';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">إدارة الطلبات</h1>
        
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="فلترة الطلبات" />
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-lg z-50">
              <SelectItem value="all">جميع الطلبات</SelectItem>
              <SelectItem value="today">طلبات اليوم</SelectItem>
              <SelectItem value="yesterday">طلبات الأمس</SelectItem>
              <SelectItem value="thisWeek">طلبات هذا الأسبوع</SelectItem>
              <SelectItem value="thisMonth">طلبات هذا الشهر</SelectItem>
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="processing">قيد المعالجة</SelectItem>
              <SelectItem value="shipped">تم الشحن</SelectItem>
              <SelectItem value="delivered">تم التسليم</SelectItem>
              <SelectItem value="cancelled">ملغية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Card className="p-4 bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">هذا الشهر</span>
          </div>
          <p className="text-2xl font-bold">{stats.thisMonth}</p>
        </Card>
        
        <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-muted-foreground">قيد الانتظار</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </Card>
        
        <Card className="p-4 bg-blue-500/10 border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-muted-foreground">قيد المعالجة</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
        </Card>
        
        <Card className="p-4 bg-purple-500/10 border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-muted-foreground">تم الشحن</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
        </Card>
        
        <Card className="p-4 bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-muted-foreground">تم التسليم</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
        </Card>
        
        <Card className="p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-muted-foreground">ملغي</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </Card>
      </div>

      {/* Filter Label */}
      {dateFilter !== 'all' && (
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {getFilterLabel(dateFilter)} ({filteredOrders.length})
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setDateFilter('all')}>
            إلغاء الفلتر
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">لا توجد طلبات {dateFilter !== 'all' ? 'في هذه الفترة' : ''}</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="p-4 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex flex-col gap-4">
                {/* Order Info - Click to view details */}
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
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
                
                {/* Actions Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t">
                  <p className="text-2xl font-bold text-primary">
                    {order.total_amount.toFixed(2)} ₪
                  </p>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select
                      value={order.status}
                      onValueChange={(status) => {
                        updateStatusMutation.mutate({ id: order.id, status });
                      }}
                    >
                      <SelectTrigger className="flex-1 sm:w-40 bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border shadow-lg z-50">
                        <SelectItem value="Pending">قيد الانتظار</SelectItem>
                        <SelectItem value="Processing">قيد المعالجة</SelectItem>
                        <SelectItem value="Shipped">تم الشحن</SelectItem>
                        <SelectItem value="Delivered">تم التسليم</SelectItem>
                        <SelectItem value="Cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderToDelete(order.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الطلب؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف الطلب وجميع تفاصيله بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => orderToDelete && deleteOrderMutation.mutate(orderToDelete)}
            >
              حذف الطلب
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">العميل</p>
                  <p className="font-semibold">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الهاتف</p>
                  <p className="font-semibold">{selectedOrder.customer_phone}</p>
                </div>
                <div className="sm:col-span-2">
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
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.products?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.selected_options?.size && `مقاس: ${item.selected_options.size}`}
                          {item.selected_options?.color && ` • لون: ${item.selected_options.color}`}
                        </p>
                        <p className="text-sm">
                          الكمية: {item.quantity} × {item.price_at_purchase.toFixed(2)} ₪
                        </p>
                      </div>
                      <p className="font-semibold flex-shrink-0">
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