import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Eye, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';

const AdminAnalytics = () => {
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

  // Get daily visitors for the last 7 days
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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">الإحصائيات</h1>
          <p className="text-muted-foreground">تتبع أداء متجرك</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              زوار اليوم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{todayVisitors || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              زوار الأسبوع
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{weeklyVisitors || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              إجمالي الطلبات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{totalOrders || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              إجمالي المبيعات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{(totalRevenue || 0).toFixed(0)} ₪</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Visitors Chart (Simple Bar) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
                  <span className="text-sm font-bold text-primary">{day.count}</span>
                  <div
                    className="w-full bg-primary rounded-t-md transition-all duration-300"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{day.date}</span>
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
              <CardTitle className="flex items-center gap-2">
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
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-lg font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </span>
                      {item.product.image_url && (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">{item.product.price} ₪</p>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold text-primary">{item.count}</p>
                        <p className="text-xs text-muted-foreground">زيارة</p>
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
              <CardTitle className="flex items-center gap-2">
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
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-lg font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </span>
                      {item.product.image_url && (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">{item.product.price} ₪</p>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold text-primary">{item.count}</p>
                        <p className="text-xs text-muted-foreground">مبيع</p>
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
          <CardTitle>إحصائيات إضافية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">{totalPageViews || 0}</p>
              <p className="text-sm text-muted-foreground">إجمالي مشاهدات الصفحات</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">
                {mostViewedProducts?.reduce((sum, item) => sum + item.count, 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground">إجمالي مشاهدات المنتجات</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
