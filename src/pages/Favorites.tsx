import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import ProductQuickView from '@/components/ProductQuickView';

const Favorites = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  // Helper function to convert color names to hex values
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

  const handleToggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(productId);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      <div className="container py-8">
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: favorites.length }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              products?.map((product) => {
                const options = product.options as any;
                const additionalImages = (product.additional_images as string[]) || [];
                const discount = product.discount_percentage || 0;
                const hasDiscount = discount > 0;
                const originalPrice = hasDiscount ? product.price / (1 - discount / 100) : product.price;

                return (
                  <div key={product.id} onClick={() => handleProductClick(product)} className="cursor-pointer">
                    <Card className="overflow-hidden bg-card shadow-card hover:shadow-card-hover transition-all duration-300 group relative h-full flex flex-col text-xs">
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <Badge className="absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground text-[10px] px-1.5">
                          -{discount}%
                        </Badge>
                      )}

                      {/* Favorite Icon */}
                      <button
                        onClick={(e) => handleToggleFavorite(e, product.id)}
                        className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-destructive hover:bg-destructive/90 shadow-md transition-all"
                      >
                        <Heart className="w-3.5 h-3.5 text-white fill-white" />
                      </button>

                      {/* Product Image */}
                      <ProductImageCarousel
                        mainImage={product.image_url || ''}
                        additionalImages={additionalImages}
                        productName={product.name}
                      />

                      {/* Product Info */}
                      <div className="p-2 flex flex-col flex-grow text-center">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                          {product.name}
                        </h3>

                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <span className="text-sm font-bold text-primary">
                            {product.price.toFixed(0)} ₪
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              {originalPrice.toFixed(0)} ₪
                            </span>
                          )}
                        </div>

                        {/* Colors */}
                        {options?.colors && Array.isArray(options.colors) && options.colors.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-1 mt-auto">
                            {options.colors.slice(0, 4).map((color: string, idx: number) => (
                              <div
                                key={idx}
                                className="w-4 h-4 rounded-full border border-border"
                                style={{ backgroundColor: getColorValue(color) }}
                                title={color}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })
            )}
          </div>
        )}
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