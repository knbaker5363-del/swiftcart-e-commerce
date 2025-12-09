import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Heart, ArrowRight, Home } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import ProductQuickView from '@/components/ProductQuickView';
import CartButton from '@/components/CartButton';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import Breadcrumb from '@/components/Breadcrumb';

const BrandProducts = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { settings } = useSettings();
  const heroBannerColor = (settings as any)?.hero_banner_color || '#000000';
  const backButtonText = (settings as any)?.back_button_text || 'رجوع';

  const { data: brand, isLoading: brandLoading } = useQuery({
    queryKey: ['brand', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['brand-products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('brand_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

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
      'أزرق غامق': '#00008B'
    };
    return color.startsWith('#') ? color : colorMap[color] || color;
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const isLoading = brandLoading || productsLoading;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Hero Banner with Background */}
      <section className="relative overflow-hidden">
        {/* Background - Dynamic color from settings */}
        <div className="absolute inset-0" style={{ backgroundColor: heroBannerColor }}>
          {brand?.logo_url && (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <img 
                src={brand.logo_url} 
                alt={brand.name} 
                className="w-96 h-96 object-contain"
              />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="container relative py-12 md:py-16">
          <Breadcrumb 
            items={[
              { label: 'العلامات التجارية', href: '/brands' },
              { label: brand?.name || 'العلامة التجارية' }
            ]} 
            className="mb-6"
          />
          
          <div className="flex items-center gap-4 animate-fade-in">
            {brand?.logo_url ? (
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <img src={brand.logo_url} alt={brand.name} className="h-16 w-16 object-contain" />
              </div>
            ) : (
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Award className="h-10 w-10 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {brand?.name || 'العلامة التجارية'}
              </h1>
              {brand?.description && (
                <p className="text-white/80 text-sm md:text-base mb-1">{brand.description}</p>
              )}
              <p className="text-white/70 text-sm">
                {products?.length || 0} منتج متوفر
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">
            منتجات {brand?.name} ({products?.length || 0})
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => {
                const productOptions = product.options as { sizes?: any[]; colors?: string[] } || {};
                const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
                const discountedPrice = hasDiscount
                  ? product.price * (1 - product.discount_percentage / 100)
                  : product.price;

                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer flex flex-col"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative aspect-square">
                      <ProductImageCarousel
                        mainImage={product.image_url}
                        additionalImages={(product.additional_images as string[]) || []}
                        productName={product.name}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                      >
                        <Heart
                          className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                        />
                      </Button>
                      {hasDiscount && (
                        <Badge className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground">
                          -{product.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1 text-center gap-2">
                      <h3 className="font-bold text-sm line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold text-primary">
                          {discountedPrice.toFixed(2)} ₪
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-muted-foreground line-through">
                            {product.price.toFixed(2)} ₪
                          </span>
                        )}
                      </div>

                      {/* Colors */}
                      {productOptions.colors && productOptions.colors.length > 0 && (
                        <div className="flex justify-center gap-1 flex-wrap">
                          {productOptions.colors.slice(0, 5).map((color, idx) => (
                            <span
                              key={idx}
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: getColorValue(color) }}
                            />
                          ))}
                          {productOptions.colors.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{productOptions.colors.length - 5}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Sizes */}
                      {productOptions.sizes && productOptions.sizes.length > 0 && (
                        <div className="flex justify-center gap-1 flex-wrap">
                          {productOptions.sizes.slice(0, 4).map((size, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs px-1.5 py-0">
                              {typeof size === 'string' ? size : size.name}
                            </Badge>
                          ))}
                          {productOptions.sizes.length > 4 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              +{productOptions.sizes.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex justify-center mt-auto">
                        <CartButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product);
                          }}
                          size="sm"
                          variant="secondary"
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">
                لم يتم إضافة منتجات لهذه العلامة التجارية بعد
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      <ProductQuickView
        product={selectedProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
};

export default BrandProducts;
