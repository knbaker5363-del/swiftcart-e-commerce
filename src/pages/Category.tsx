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
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const Category = () => {
  const { id } = useParams();
  const [cartOpen, setCartOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const { toast } = useToast();

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
            is_active
          )
        `)
        .eq('category_id', id);
      
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

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

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

                return (
                  <Card
                    key={product.id}
                    className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative">
                      <Link to={`/product/${product.id}`}>
                        <ProductImageCarousel
                          mainImage={mainImage}
                          additionalImages={additionalImages}
                          productName={product.name}
                        />
                      </Link>
                      
                      {product.discount_percentage > 0 && (
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
                              ? 'fill-red-500 text-red-500'
                              : 'text-foreground'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-3 space-y-2">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-lg font-bold text-primary">
                        {product.price.toFixed(2)} ر.س
                      </p>

                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-full"
                        size="sm"
                      >
                        <ShoppingCart className="ml-2 h-4 w-4" />
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