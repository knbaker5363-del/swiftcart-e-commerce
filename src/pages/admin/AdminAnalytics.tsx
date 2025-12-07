import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, Eye, ShoppingCart, TrendingUp, Package, Trash2, Calendar } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminAnalytics = () => {
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);

  // Get unique visitors count (today)
  const { data: todayVisitors } = useQuery({
    queryKey: ['analytics-today-visitors'],
    queryFn: async () => {
      const today = new Date();
      const { count, error } = await supabase
        .from('page_views')
        .select('visitor_id', { count: 'exact', head: true })
        .gte('created_at', startOfDay(today).toISOString())
        .lte('created_at', endOfDay(today).toISOString());
      if (error) throw error;
      return count || 0;
    },
  });

  // Get unique visitors count (last 7 days)
  const { data: weeklyVisitors } = useQuery({
    queryKey: ['analytics-weekly-visitors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_views')
        .select('visitor_id')
        .gte('created_at', subDays(new Date(), 7).toISOString());
      if (error) throw error;
      const uniqueVisitors = new Set(data?.map((v) => v.visitor_id));
      return uniqueVisitors.size;
    },
  });

  // Get total page views
  const { data: totalPageViews } = useQuery({
    queryKey: ['analytics-total-views'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Get most viewed products
  const { data: mostViewedProducts } = useQuery({
    queryKey: ['analytics-most-viewed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_views')
        .select('product_id, products(id, name, image_url, price)');
      if (error) throw error;
      
      // Count views per product
      const viewCounts: Record<string, { count: number; product: any }> = {};
      data?.forEach((view: any) => {
        if (view.products) {
          const id = view.product_id;
          if (!viewCounts[id]) {
            viewCounts[id] = { count: 0, product: view.products };
          }
          viewCounts[id].count++;
        }
      });
      
      // Sort by count and return top 10
      return Object.values(viewCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });

  // Get most sold products (from order_items)
  const { data: mostSoldProducts } = useQuery({
    queryKey: ['analytics-most-sold'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('product_id, quantity, products(id, name, image_url, price)');
      if (error) throw error;
      
      // Sum quantities per product
      const salesCounts: Record<string, { count: number; product: any }> = {};
      data?.forEach((item: any) => {
        if (item.products) {
          const id = item.product_id;
          if (!salesCounts[id]) {
            salesCounts[id] = { count: 0, product: item.products };
          }
          salesCounts[id].count += item.quantity;
        }
      });
      
      // Sort by count and return top 10
      return Object.values(salesCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });

  // Get total orders
  const { data: totalOrders } = useQuery({
    queryKey: ['analytics-total-orders'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Get total revenue
  const { data: totalRevenue } = useQuery({
    queryKey: ['analytics-total-revenue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount');
      if (error) throw error;
      return data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
    },
  });

  // Get daily stats for the last 14 days with detailed info
  const { data: dailyStats } = useQuery({
    queryKey: ['analytics-daily-stats'],
    queryFn: async () => {
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const startDate = startOfDay(date).toISOString();
        const endDate = endOfDay(date).toISOString();
        
        // Get visitors
        const { data: visitorsData } = await supabase
          .from('page_views')
          .select('visitor_id')
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        const uniqueVisitors = new Set(visitorsData?.map((v) => v.visitor_id));
        
        // Get orders for this day
        const { data: ordersData } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        const ordersCount = ordersData?.length || 0;
        const revenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
        
        // Get product views
        const { count: productViews } = await supabase
          .from('product_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        days.push({
          date: date,
          dayName: format(date, 'EEEE', { locale: ar }),
          formattedDate: format(date, 'yyyy/MM/dd'),
          visitors: uniqueVisitors.size,
          orders: ordersCount,
          revenue: revenue,
          productViews: productViews || 0,
        });
      }
      return days;
    },
  });

  // Get daily visitors for the last 7 days (for chart)
  const { data: dailyVisitors } = useQuery({
    queryKey: ['analytics-daily-visitors'],
    queryFn: async () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const { data, error } = await supabase
          .from('page_views')
          .select('visitor_id')
          .gte('created_at', startOfDay(date).toISOString())
          .lte('created_at', endOfDay(date).toISOString());
        
        if (error) throw error;
        const uniqueVisitors = new Set(data?.map((v) => v.visitor_id));
        days.push({
          date: format(date, 'EEEE', { locale: ar }),
          count: uniqueVisitors.size,
        });
      }
      return days;
    },
  });

  // Reset analytics
  const handleResetAnalytics = async (type: 'views' | 'all') => {
    setIsResetting(true);
    try {
      if (type === 'views' || type === 'all') {
        await supabase.from('page_views').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('product_views').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
      
      // Invalidate all analytics queries
      queryClient.invalidateQueries({ queryKey: ['analytics-today-visitors'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-weekly-visitors'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-total-views'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-most-viewed'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-daily-visitors'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-daily-stats'] });
      
      toast.success('تم تصفير الإحصائيات بنجاح');
    } catch (error) {
      console.error('Error resetting analytics:', error);
      toast.error('حدث خطأ أثناء تصفير الإحصائيات');
    } finally {
      setIsResetting(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">الإحصائيات</h1>
            <p className="text-muted-foreground text-sm">تتبع أداء متجرك</p>
          </div>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              تصفير الإحصائيات
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد تصفير الإحصائيات</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من تصفير جميع إحصائيات الزيارات؟ لن يتم حذف الطلبات أو المبيعات.
                هذا الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse gap-2">
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleResetAnalytics('views')}
                disabled={isResetting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isResetting ? 'جاري التصفير...' : 'تصفير'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2 px-3 pt-3">
            <CardDescription className="flex items-center gap-1 text-xs">
              <Users className="h-3 w-3" />
              زوار اليوم
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <p className="text-xl sm:text-2xl font-bold text-primary">{formatNumber(todayVisitors || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 pt-3">
            <CardDescription className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              زوار الأسبوع
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <p className="text-xl sm:text-2xl font-bold text-primary">{formatNumber(weeklyVisitors || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 pt-3">
            <CardDescription className="flex items-center gap-1 text-xs">
              <ShoppingCart className="h-3 w-3" />
              إجمالي الطلبات
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <p className="text-xl sm:text-2xl font-bold text-primary">{formatNumber(totalOrders || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 pt-3">
            <CardDescription className="flex items-center gap-1 text-xs">
              <Package className="h-3 w-3" />
              إجمالي المبيعات
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <p className="text-xl sm:text-2xl font-bold text-primary truncate">
              {formatNumber(Math.round(totalRevenue || 0))} ₪
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            إحصائيات كل يوم
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right p-3 font-medium">اليوم</th>
                  <th className="text-center p-3 font-medium">التاريخ</th>
                  <th className="text-center p-3 font-medium">الزوار</th>
                  <th className="text-center p-3 font-medium">المشاهدات</th>
                  <th className="text-center p-3 font-medium">الطلبات</th>
                  <th className="text-center p-3 font-medium">المبيعات</th>
                </tr>
              </thead>
              <tbody>
                {dailyStats?.map((day, index) => (
                  <tr key={index} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-medium">{day.dayName}</td>
                    <td className="p-3 text-center text-muted-foreground text-xs">{day.formattedDate}</td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 text-primary font-bold">
                        <Users className="h-3 w-3" />
                        {day.visitors}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {day.productViews}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                        {day.orders}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-green-600">
                      {day.revenue > 0 ? `${formatNumber(day.revenue)} ₪` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Daily Visitors Chart (Simple Bar) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5" />
            الزوار خلال الأسبوع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-40">
            {dailyVisitors?.map((day, index) => {
              const maxCount = Math.max(...(dailyVisitors?.map((d) => d.count) || [1]), 1);
              const height = (day.count / maxCount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-primary">{day.count}</span>
                  <div
                    className="w-full bg-primary rounded-t-md transition-all duration-300"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground text-center">{day.date}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Products Tabs */}
      <Tabs defaultValue="viewed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="viewed">الأكثر زيارة</TabsTrigger>
          <TabsTrigger value="sold">الأكثر مبيعاً</TabsTrigger>
        </TabsList>

        <TabsContent value="viewed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5" />
                المنتجات الأكثر زيارة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mostViewedProducts && mostViewedProducts.length > 0 ? (
                <div className="space-y-3">
                  {mostViewedProducts.map((item, index) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      {item.product.image_url && (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.price} ₪</p>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold text-primary">{item.count}</p>
                        <p className="text-[10px] text-muted-foreground">زيارة</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد بيانات حتى الآن
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sold">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                المنتجات الأكثر مبيعاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mostSoldProducts && mostSoldProducts.length > 0 ? (
                <div className="space-y-3">
                  {mostSoldProducts.map((item, index) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      {item.product.image_url && (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.price} ₪</p>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold text-primary">{item.count}</p>
                        <p className="text-[10px] text-muted-foreground">مبيع</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد مبيعات حتى الآن
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إحصائيات إضافية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-xl sm:text-2xl font-bold text-primary">{formatNumber(totalPageViews || 0)}</p>
              <p className="text-xs text-muted-foreground">إجمالي مشاهدات الصفحات</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {formatNumber(mostViewedProducts?.reduce((sum, item) => sum + item.count, 0) || 0)}
              </p>
              <p className="text-xs text-muted-foreground">إجمالي مشاهدات المنتجات</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
