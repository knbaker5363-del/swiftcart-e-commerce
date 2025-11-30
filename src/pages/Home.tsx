import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

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
                const discount = Math.floor(Math.random() * 30) + 10; // خصم عشوائي بين 10-40%
                const originalPrice = product.price / (1 - discount / 100);
                
                const handleQuickAdd = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  addItem({
                    id: '',
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                    quantity: 1,
                    selected_options: {},
                  });
                  
                  toast({
                    title: 'تم إضافة المنتج إلى السلة',
                  });
                };
                
                return (
                  <Card key={product.id} className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 group relative">
                    <Link to={`/product/${product.id}`}>
                      {/* Discount Badge */}
                      <Badge className="absolute top-2 right-2 z-10 bg-green-500 hover:bg-green-600 text-white font-bold">
                        -{discount}%
                      </Badge>
                      
                      {/* Favorite Icon */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute top-2 left-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                      >
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      {/* Product Image */}
                      <div className="relative overflow-hidden bg-gray-50">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-56 bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">لا توجد صورة</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-4">
                        {/* Category */}
                        <p className="text-xs text-gray-500 mb-1">
                          {product.categories?.name}
                        </p>
                        
                        {/* Product Name */}
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>
                        
                        {/* Prices */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-gray-400 line-through">
                            {originalPrice.toFixed(0)} ر.س
                          </span>
                          <span className="text-xl font-bold text-green-600">
                            {product.price.toFixed(0)} ر.س
                          </span>
                        </div>
                        
                        {/* Size Options */}
                        {options?.sizes && Array.isArray(options.sizes) && options.sizes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {options.sizes.slice(0, 5).map((size: string) => (
                              <button
                                key={size}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-gray-900 hover:bg-gray-50 transition-colors"
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Add to Cart Button */}
                        <Button
                          onClick={handleQuickAdd}
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 ml-2" />
                          أضف للسلة
                        </Button>
                      </div>
                    </Link>
                  </Card>
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