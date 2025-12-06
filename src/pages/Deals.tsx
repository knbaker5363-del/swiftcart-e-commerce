import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ShoppingCart, Tag } from 'lucide-react';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import ProductQuickView from '@/components/ProductQuickView';

const Deals = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const { toast } = useToast();

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

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount / 100);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Header */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <div className="flex items-center justify-center gap-4 animate-fade-in">
            <Tag className="h-12 w-12" />
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">العروض الخاصة</h1>
              <p className="text-lg opacity-90">
                أفضل الخصومات على منتجاتنا المميزة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.map((product) => {
                const mainImage = product.image_url || '';
                const additionalImages = Array.isArray(product.additional_images)
                  ? (product.additional_images.filter((img): img is string => typeof img === 'string'))
                  : [];
                const discountedPrice = calculateDiscountedPrice(
                  product.price,
                  product.discount_percentage
                );
                const options = product.options as { sizes?: string[], colors?: string[] } | null;

                return (
                  <Card
                    key={product.id}
                    className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    <div className="relative">
                      <div onClick={() => handleProductClick(product)} className="cursor-pointer">
                        <ProductImageCarousel
                          mainImage={mainImage}
                          additionalImages={additionalImages}
                          productName={product.name}
                        />
                      </div>
                      
                      {/* Discount Badge */}
                      <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground hover:bg-destructive text-xs px-1.5 py-0.5">
                        خصم {product.discount_percentage}%
                      </Badge>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background rounded-full transition-colors"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isFavorite(product.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-foreground'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-3 flex flex-col flex-grow">
                      <div onClick={() => handleProductClick(product)} className="cursor-pointer mb-1">
                        <h3 className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      {product.categories && (
                        <Badge variant="secondary" className="text-xs w-fit mb-1">
                          {product.categories.name}
                        </Badge>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-base font-bold text-primary">
                          {discountedPrice.toFixed(2)} ₪
                        </p>
                        <p className="text-xs text-muted-foreground line-through">
                          {product.price.toFixed(2)} ₪
                        </p>
                      </div>

                      {/* Options: Sizes & Colors */}
                      {options && (options.sizes || options.colors) && (
                        <div className="mb-2 space-y-1">
                          {options.sizes && options.sizes.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {options.sizes.slice(0, 2).map((size, idx) => (
                                <span key={idx} className="text-xs px-1.5 py-0.5 bg-muted rounded">
                                  {size}
                                </span>
                              ))}
                              {options.sizes.length > 2 && (
                                <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded font-medium">
                                  +{options.sizes.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                          {options.colors && options.colors.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {options.colors.slice(0, 4).map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-4 h-4 rounded-full border border-border"
                                  style={{ backgroundColor: getColorValue(color) }}
                                  title={color}
                                />
                              ))}
                              {options.colors.length > 4 && (
                                <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded font-medium">
                                  +{options.colors.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <Button
                        onClick={() => handleProductClick(product)}
                        className="w-full mt-auto text-xs py-2"
                        size="sm"
                      >
                        <ShoppingCart className="ml-1 h-3.5 w-3.5" />
                        أضف للسلة
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
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
