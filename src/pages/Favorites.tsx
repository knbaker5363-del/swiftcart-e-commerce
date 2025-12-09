import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import ProductQuickView from '@/components/ProductQuickView';
import ProductGrid from '@/components/ProductGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/contexts/SettingsContext';
import Breadcrumb from '@/components/Breadcrumb';

const Favorites = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const { settings } = useSettings();

  // Get card display settings for skeleton grid
  const cardsPerRowMobile = (settings as any)?.cards_per_row_mobile || 2;
  const cardsPerRowDesktop = (settings as any)?.cards_per_row_desktop || 4;

  const getColorValue = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      'أحمر': '#ef4444',
      'أزرق': '#3b82f6',
      'أخضر': '#22c55e',
      'أصفر': '#eab308',
      'أسود': '#000000',
      'أبيض': '#ffffff',
      'رمادي': '#6b7280',
      'بني': '#92400e',
      'وردي': '#ec4899',
      'برتقالي': '#f97316',
      'بنفسجي': '#a855f7',
      'سماوي': '#0ea5e9',
    };
    return colorMap[colorName] || '#9ca3af';
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['favorite-products', favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .in('id', favorites);
      
      if (error) throw error;
      return data;
    },
    enabled: favorites.length > 0,
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      <div className="container py-8">
        <Breadcrumb 
          items={[{ label: 'المفضلة' }]} 
          className="mb-6 [&_*]:text-foreground [&_svg]:text-muted-foreground"
        />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">المفضلة</h1>
          <p className="text-muted-foreground">
            {favorites.length === 0
              ? 'لا توجد منتجات في المفضلة'
              : `لديك ${favorites.length} منتج في المفضلة`}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="mx-auto h-24 w-24 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">المفضلة فارغة</h2>
            <p className="text-muted-foreground mb-6">
              ابدأ بإضافة منتجات إلى المفضلة لتسهيل الوصول إليها لاحقاً
            </p>
            <Button onClick={() => navigate('/')} className="bg-gradient-primary">
              <ShoppingBag className="ml-2 h-5 w-5" />
              تصفح المنتجات
            </Button>
          </div>
        ) : isLoading ? (
          <div 
            className="grid gap-2 md:gap-3"
            style={{ 
              gridTemplateColumns: `repeat(${cardsPerRowMobile}, 1fr)` 
            }}
          >
            {Array.from({ length: favorites.length }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <ProductGrid
            products={products}
            onProductClick={handleProductClick}
            getColorValue={getColorValue}
          />
        ) : null}
      </div>

      <ProductQuickView
        product={selectedProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
};

export default Favorites;
