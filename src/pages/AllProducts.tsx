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
import { Heart, ShoppingCart, Package } from 'lucide-react';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

const AllProducts = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const { toast } = useToast();
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

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
      selected_options: {},
    });
    
    toast({
      title: 'تمت الإضافة',
      description: 'تم إضافة المنتج إلى السلة',
    });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        {/* Background - Dynamic color from settings */}
        <div className="absolute inset-0" style={{ backgroundColor: heroBannerColor }} />
        
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Content */}
        <div className="container relative py-12 md:py-16">
          <div className="flex flex-col items-center justify-center gap-4 animate-fade-in text-center">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Package className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                كافة المنتجات
              </h1>
              <p className="text-white/70 text-base md:text-lg max-w-md mx-auto">
                تصفح جميع منتجاتنا المتاحة • {products?.length || 0} منتج
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
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
              {products.map((product) => {
                const mainImage = product.image_url || '';
                const additionalImages = Array.isArray(product.additional_images)
                  ? (product.additional_images.filter((img): img is string => typeof img === 'string'))
                  : [];

                // Parse options - handle both old format (string[]) and new format (SizeOption[])
                let productSizes: string[] = [];
                let productColors: string[] = [];
                if (product.options && typeof product.options === 'object') {
                  const opts = product.options as Record<string, unknown>;
                  if (Array.isArray(opts.sizes)) {
                    productSizes = opts.sizes.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean);
                  }
                  if (Array.isArray(opts.colors)) {
                    productColors = opts.colors.filter((c): c is string => typeof c === 'string');
                  }
                }

                const discountedPrice = product.discount_percentage 
                  ? product.price * (1 - product.discount_percentage / 100) 
                  : null;

                return (
                  <Card
                    key={product.id}
                    className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                  >
                    {/* Category Header */}
                    {product.categories && (
                      <div className="bg-muted py-1.5 text-center">
                        <span className="text-xs font-medium text-muted-foreground">{product.categories.name}</span>
                      </div>
                    )}

                    <div className="relative">
                      <Link to={`/product/${product.id}`}>
                        <ProductImageCarousel
                          mainImage={mainImage}
                          additionalImages={additionalImages}
                          productName={product.name}
                        />
                      </Link>
                      
                      {product.discount_percentage && product.discount_percentage > 0 && (
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
                              ? 'fill-red-500 text-red-500'
                              : 'text-foreground'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-3 space-y-2 text-center">
                      {/* Price */}
                      <div className="flex items-center justify-center gap-2">
                        {discountedPrice ? (
                          <>
                            <span className="text-xs text-muted-foreground line-through">{product.price.toFixed(0)} ₪</span>
                            <span className="text-base font-bold text-primary">{discountedPrice.toFixed(0)} ₪</span>
                          </>
                        ) : (
                          <span className="text-base font-bold text-primary">{product.price.toFixed(0)} ₪</span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-sm line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Sizes */}
                      {productSizes.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1">
                          {productSizes.map((size) => (
                            <span key={size} className="text-[10px] px-2 py-0.5 border border-border rounded-md bg-background">
                              {size}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Colors */}
                      {productColors.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1">
                          {productColors.map((color) => (
                            <div
                              key={color}
                              className="w-5 h-5 rounded border border-border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-auto px-6"
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
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">
                سيتم إضافة المنتجات قريباً
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AllProducts;