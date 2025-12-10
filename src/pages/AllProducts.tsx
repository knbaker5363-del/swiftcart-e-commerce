import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import Breadcrumb from '@/components/Breadcrumb';
import ProductGrid from '@/components/ProductGrid';
import ProductQuickView from '@/components/ProductQuickView';

const AllProducts = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { settings } = useSettings();
  const heroBannerColor = (settings as any)?.hero_banner_color || '#000000';

  const { data: products, isLoading } = useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getColorValue = (color: string) => {
    return color.startsWith('#') ? color : color;
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Hero Banner - Smaller */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: heroBannerColor }} />
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container relative py-6 md:py-8">
          <Breadcrumb 
            items={[{ label: 'كافة المنتجات' }]} 
            className="mb-4"
          />
          
          <div className="flex flex-col items-center justify-center gap-3 animate-fade-in text-center">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                كافة المنتجات
              </h1>
              <p className="text-white/70 text-sm md:text-base">
                تصفح جميع منتجاتنا المتاحة • {products?.length || 0} منتج
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-8">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <ProductGrid
              products={products}
              onProductClick={(product) => setSelectedProduct(product)}
              getColorValue={getColorValue}
            />
          ) : (
            <div className="text-center py-16">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground text-sm">
                سيتم إضافة المنتجات قريباً
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Product Quick View */}
      <ProductQuickView
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </div>
  );
};

export default AllProducts;
