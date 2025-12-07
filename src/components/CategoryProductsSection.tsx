import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ShoppingCart, ChevronLeft } from 'lucide-react';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface CategoryProductsSectionProps {
  category: {
    id: string;
    name: string;
  };
}

export const CategoryProductsSection = ({ category }: CategoryProductsSectionProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ['category-products-home', category.id],
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
            is_active
          )
        `)
        .eq('category_id', category.id)
        .limit(6);
      
      if (error) throw error;
      return data
        .map(item => item.products)
        .filter(product => product && product.is_active);
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

  if (isLoading) {
    return (
      <section className="py-8 bg-muted/30">
        <div className="container">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{category.name}</h2>
          <Link to={`/category/${category.id}`}>
            <Button variant="ghost" className="gap-2">
              عرض المزيد
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product: any) => {
            const mainImage = product.image_url || '';
            const additionalImages = Array.isArray(product.additional_images)
              ? (product.additional_images.filter((img): img is string => typeof img === 'string'))
              : [];

            return (
              <Card
                key={product.id}
                className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative">
                  <Link to={`/product/${product.id}`} className="block h-40 overflow-hidden">
                    <ProductImageCarousel
                      mainImage={mainImage}
                      additionalImages={additionalImages}
                      productName={product.name}
                    />
                  </Link>
                  
                  {product.discount_percentage > 0 && (
                    <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground hover:bg-destructive text-xs px-2 py-0.5">
                      -{product.discount_percentage}%
                    </Badge>
                  )}

                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-2 left-2 p-1.5 bg-background/80 hover:bg-background rounded-full transition-colors"
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

                <div className="p-3 space-y-2">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-base font-bold text-primary">
                    {product.price.toFixed(2)} ₪
                  </p>

                  {product.options && (
                    <div className="space-y-1.5">
                      {product.options.sizes && product.options.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-xs text-muted-foreground">المقاسات:</span>
                          {product.options.sizes.map((size: any, idx: number) => {
                            const sizeName = typeof size === 'string' ? size : size.name;
                            return (
                              <span key={idx} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {sizeName}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      
                      {product.options.colors && product.options.colors.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-xs text-muted-foreground">الألوان:</span>
                          <div className="flex gap-1">
                            {product.options.colors.map((color: string, idx: number) => (
                              <div
                                key={idx}
                                className="w-5 h-5 rounded-full border-2 border-border"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full h-8 text-xs"
                  >
                    <ShoppingCart className="ml-1 h-3 w-3" />
                    أضف للسلة
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};