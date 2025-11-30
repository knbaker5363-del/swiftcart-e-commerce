import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import { useFavorites } from '@/contexts/FavoritesContext';

const Home = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-6">مرحباً بك في متجرنا</h1>
            <p className="text-xl opacity-90">
              اكتشف أفضل المنتجات بأسعار مميزة
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">التصنيفات</h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted" />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-center">{category.name}</h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">المنتجات المميزة</h2>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.map((product) => {
                const options = product.options as any;
                const additionalImages = (product.additional_images as string[]) || [];
                const discountSeed = parseInt(product.id.split('-')[0], 16) % 30 + 10;
                const discount = discountSeed;
                const originalPrice = product.price / (1 - discount / 100);
                const isProductFavorite = isFavorite(product.id);

                const handleToggleFavorite = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(product.id);
                };
                
                return (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 group relative h-full">
                      {/* Discount Badge */}
                      <Badge className="absolute top-3 right-3 z-10 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-3 py-1">
                        -{discount}%
                      </Badge>
                      
                      {/* Favorite Icon */}
                      <button
                        onClick={handleToggleFavorite}
                        className={`absolute top-3 left-3 z-10 p-2 rounded-full shadow-md transition-all hover:scale-110 ${
                          isProductFavorite
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-white/90 hover:bg-white'
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${
                            isProductFavorite
                              ? 'text-white fill-white'
                              : 'text-gray-600 hover:text-red-500'
                          }`}
                        />
                      </button>
                      
                      {/* Product Image Carousel */}
                      <ProductImageCarousel
                        mainImage={product.image_url || ''}
                        additionalImages={additionalImages}
                        productName={product.name}
                      />
                      
                      {/* Product Info */}
                      <div className="p-4 space-y-3">
                        {/* Category */}
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                          {product.categories?.name}
                        </p>
                        
                        {/* Product Name */}
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-2 min-h-[3.5rem] leading-tight">
                          {product.name}
                        </h3>
                        
                        {/* Prices */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-green-600">
                            {product.price.toFixed(0)} ر.س
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {originalPrice.toFixed(0)} ر.س
                          </span>
                        </div>
                        
                        {/* Colors Available */}
                        {options?.colors && Array.isArray(options.colors) && options.colors.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600 font-medium">الألوان المتوفرة:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {options.colors.slice(0, 4).map((color: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-200"
                                >
                                  {color}
                                </span>
                              ))}
                              {options.colors.length > 4 && (
                                <span className="px-2.5 py-1 text-xs text-gray-500">
                                  +{options.colors.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Sizes Available */}
                        {options?.sizes && Array.isArray(options.sizes) && options.sizes.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600 font-medium">المقاسات المتوفرة:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {options.sizes.slice(0, 6).map((size: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 text-xs font-medium border border-gray-300 rounded text-gray-700 hover:border-gray-900 transition-colors"
                                >
                                  {size}
                                </span>
                              ))}
                              {options.sizes.length > 6 && (
                                <span className="px-2.5 py-1 text-xs text-gray-500">
                                  +{options.sizes.length - 6}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;