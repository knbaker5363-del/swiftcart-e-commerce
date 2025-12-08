import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ShoppingCart, FolderOpen, ArrowRight } from 'lucide-react';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/hooks/use-toast';
import ProductQuickView from '@/components/ProductQuickView';
import { useSettings } from '@/contexts/SettingsContext';

const Category = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const { settings } = useSettings();

  // Get hero banner color from settings
  const heroBannerColor = (settings as any)?.hero_banner_color || '#000000';
  const isDarkTheme = settings?.theme === 'dark' || settings?.theme === 'night';

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

  // Text color - always black except for dark themes
  const textColorClass = isDarkTheme ? 'text-white' : 'text-foreground';
  const headerTextClass = isDarkTheme ? 'text-white' : 'text-black';

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

      {/* Hero Banner with Background */}
      <section className="relative overflow-hidden">
        {/* Background - Dynamic color from settings */}
        <div className="absolute inset-0" style={{ backgroundColor: heroBannerColor }} />
        
        {/* Content */}
        <div className="container relative py-12 md:py-16">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="gap-2 text-white hover:bg-white/20 mb-4"
          >
            <ArrowRight className="h-4 w-4" />
            رجوع
          </Button>
          
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FolderOpen className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {category?.name || 'التصنيف'}
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                تصفح جميع منتجات {category?.name} • {products?.length || 0} منتج
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
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
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
                    className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
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
                        <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2">
                          -{product.discount_percentage}%
                        </Badge>
                      )}

                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background rounded-full transition-colors"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isFavorite(product.id)
                              ? 'fill-destructive text-destructive'
                              : 'text-foreground'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-3 flex flex-col flex-grow text-center">
                      {/* Price */}
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {hasDiscount ? (
                          <>
                            <span className="text-xs text-muted-foreground line-through">{product.price.toFixed(0)} ₪</span>
                            <span className="text-base font-bold text-primary">{discountedPrice.toFixed(0)} ₪</span>
                          </>
                        ) : (
                          <span className="text-base font-bold text-primary">{product.price.toFixed(0)} ₪</span>
                        )}
                      </div>

                      {/* Product Name */}
                      <div onClick={() => handleProductClick(product)} className="cursor-pointer mb-2">
                        <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      {/* Sizes */}
                      {options?.sizes && options.sizes.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 mb-2">
                          {options.sizes.map((size: any, idx: number) => {
                            const sizeName = typeof size === 'string' ? size : size.name;
                            return (
                              <span key={idx} className="text-[10px] px-2 py-0.5 border border-border rounded-md bg-background">
                                {sizeName}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Colors */}
                      {options?.colors && options.colors.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 mb-2">
                          {options.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-5 h-5 rounded border border-border"
                              style={{ backgroundColor: getColorValue(color) }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <Button 
                        onClick={() => handleProductClick(product)}
                        className="w-auto px-6 mx-auto mt-auto"
                        size="sm"
                        variant="secondary"
                      >
                        <ShoppingCart className="h-4 w-4" />
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