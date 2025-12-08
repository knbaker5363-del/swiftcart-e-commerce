import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen, ArrowRight } from 'lucide-react';
import ProductQuickView from '@/components/ProductQuickView';
import { useSettings } from '@/contexts/SettingsContext';
import ProductGrid from '@/components/ProductGrid';

const Category = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { settings } = useSettings();

  const heroBannerColor = (settings as any)?.hero_banner_color || '#000000';

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

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: heroBannerColor }} />
        
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
            <ProductGrid
              products={products}
              onProductClick={handleProductClick}
              getColorValue={getColorValue}
            />
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
