import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';

const Favorites = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                const discountSeed = parseInt(product.id.split('-')[0], 16) % 30 + 10;
                const discount = discountSeed;
                const originalPrice = product.price / (1 - discount / 100);

                return (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 group relative h-full">
                      {/* Discount Badge */}
                      <Badge className="absolute top-3 right-3 z-10 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-3 py-1">
                        -{discount}%
                      </Badge>

                      {/* Favorite Icon - Active */}
                      <button
                        onClick={(e) => handleToggleFavorite(e, product.id)}
                        className="absolute top-3 left-3 z-10 p-2 rounded-full bg-red-500 hover:bg-red-600 shadow-md transition-all hover:scale-110"
                      >
                        <Heart className="w-5 h-5 text-white fill-white" />
                      </button>

                      {/* Product Image Carousel */}
                      <ProductImageCarousel
                        mainImage={product.image_url || ''}
                        additionalImages={additionalImages}
                        productName={product.name}
                      />

                      {/* Product Info */}
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                          {product.categories?.name}
                        </p>

                        <h3 className="font-bold text-gray-900 text-lg line-clamp-2 min-h-[3.5rem] leading-tight">
                          {product.name}
                        </h3>

                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-green-600">
                            {product.price.toFixed(0)} ₪
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {originalPrice.toFixed(0)} ر.س
                          </span>
                        </div>

                        {/* Colors */}
                        {options?.colors && Array.isArray(options.colors) && options.colors.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {options.colors.slice(0, 4).map((color: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-200"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;