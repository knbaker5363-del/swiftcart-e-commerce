import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ShoppingCart, FolderOpen } from 'lucide-react';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/hooks/use-toast';
import ProductQuickView from '@/components/ProductQuickView';

const Category = () => {
  const { id } = useParams();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
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

  const { data: category } = useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['category-products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select(`
          product_id,
          products (
            id,
            name,
            price,
            image_url,
            additional_images,
            discount_percentage,
            is_active,
            options
          )
        `)
        .eq('category_id', id);
      
      if (error) throw error;
      return data
        .map(item => item.products)
        .filter(product => product && product.is_active);
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

      {/* Quick View Dialog */}
      <ProductQuickView 
        product={selectedProduct} 
        open={quickViewOpen} 
        onOpenChange={setQuickViewOpen} 
      />

      {/* Header */}
      <section className="bg-gradient-primary text-primary-foreground py-12">
        <div className="container">
          <div className="flex items-center justify-center gap-4 animate-fade-in">
            <FolderOpen className="h-12 w-12" />
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">{category?.name || 'التصنيف'}</h1>
              <p className="text-lg opacity-90">
                تصفح جميع منتجات {category?.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product: any) => {
                const mainImage = product.image_url || '';
                const additionalImages = Array.isArray(product.additional_images)
                  ? (product.additional_images.filter((img): img is string => typeof img === 'string'))
                  : [];
                const options = product.options as { sizes?: string[], colors?: string[] } | null;
                const hasDiscount = product.discount_percentage > 0;
                const discountedPrice = hasDiscount 
                  ? product.price * (1 - product.discount_percentage / 100)
                  : product.price;

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
                      
                      {hasDiscount && (
                        <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground hover:bg-destructive text-sm px-2 py-1">
                          خصم {product.discount_percentage}%
                        </Badge>
                      )}

                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-2 left-2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            isFavorite(product.id)
                              ? 'fill-destructive text-destructive'
                              : 'text-foreground'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-3 flex flex-col flex-grow">
                      <div onClick={() => handleProductClick(product)} className="cursor-pointer mb-auto">
                        <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        {hasDiscount ? (
                          <>
                            <span className="text-lg font-bold text-primary">
                              {discountedPrice.toFixed(2)} ₪
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {product.price.toFixed(2)} ₪
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-primary">
                            {product.price.toFixed(2)} ₪
                          </span>
                        )}
                      </div>

                      {options && (options.sizes || options.colors) && (
                        <div className="mb-3 space-y-2 min-h-[3rem]">
                          {options.sizes && options.sizes.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">المقاسات:</span>
                              {options.sizes.slice(0, 3).map((size, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-muted rounded">
                                  {size}
                                </span>
                              ))}
                            </div>
                          )}
                          {options.colors && options.colors.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">الألوان:</span>
                              {options.colors.slice(0, 4).map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 rounded-full border-2 border-border"
                                  style={{ backgroundColor: getColorValue(color) }}
                                  title={color}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <Button 
                        onClick={() => handleProductClick(product)}
                        className="w-full mt-auto text-xs md:text-sm py-3"
                      >
                        <ShoppingCart className="ml-1.5 h-4 w-4" />
                        أضف للسلة
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">لا توجد منتجات في هذا التصنيف حالياً</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Category;