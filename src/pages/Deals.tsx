import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, ArrowRight } from 'lucide-react';
import ProductQuickView from '@/components/ProductQuickView';
import { useSettings } from '@/contexts/SettingsContext';
import ProductGrid from '@/components/ProductGrid';

const Deals = () => {
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { settings } = useSettings();
  const heroBannerColor = (settings as any)?.hero_banner_color || '#000000';
  const backButtonText = (settings as any)?.back_button_text || 'رجوع';

  const getColorValue = (color: string) => {
    const colorMap: Record<string, string> = {
      'أبيض': '#FFFFFF',
      'أسود': '#000000',
      'أحمر': '#FF0000',
      'أزرق': '#0000FF',
      'أخضر': '#00FF00',
      'أصفر': '#FFFF00',
      'برتقالي': '#FFA500',
      'بني': '#8B4513',
      'رمادي': '#808080',
      'زهري': '#FFC0CB',
      'بنفسجي': '#800080',
      'كحلي': '#000080',
      'أزرق غامق': '#00008B',
    };
    return color.startsWith('#') ? color : (colorMap[color] || color);
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['deals-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_active', true)
        .gt('discount_percentage', 0)
        .order('discount_percentage', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: heroBannerColor }} />
        
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container relative py-12 md:py-16">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="gap-2 text-white hover:bg-white/20 mb-4"
          >
            <ArrowRight className="h-4 w-4" />
            {backButtonText}
          </Button>
          
          <div className="flex flex-col items-center justify-center gap-4 animate-fade-in text-center">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Tag className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                العروض الخاصة
              </h1>
              <p className="text-white/80 text-base md:text-lg max-w-md mx-auto">
                أفضل الخصومات على منتجاتنا المميزة • {products?.length || 0} عرض
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <ProductGrid
              products={products}
              onProductClick={handleProductClick}
              getColorValue={getColorValue}
            />
          ) : (
            <div className="text-center py-20">
              <Tag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">لا توجد عروض حالياً</h3>
              <p className="text-muted-foreground mb-6">
                تابعنا للحصول على أفضل العروض والخصومات
              </p>
              <Link to="/">
                <Button>العودة للصفحة الرئيسية</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Dialog */}
      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
        />
      )}
    </div>
  );
};

export default Deals;
