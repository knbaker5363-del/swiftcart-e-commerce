import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import HeroSection from '@/components/HeroSection';
import DealsBar from '@/components/DealsBar';
import QuickLinks from '@/components/QuickLinks';
import { CategoryProductsSection } from '@/components/CategoryProductsSection';

const Home = () => {
  const [cartOpen, setCartOpen] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories-with-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          product_categories(product_id)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Filter categories that have at least one product
      return data?.filter(cat => cat.product_categories && cat.product_categories.length > 0) || [];
    },
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Hero Section */}
      <HeroSection />

      {/* Deals Bar */}
      <DealsBar />

      {/* Quick Links */}
      <QuickLinks />

      {/* Categories */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">التصنيفات</h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-2">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-16 object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-16 bg-muted rounded-md" />
                    )}
                    <div className="pt-2">
                      <h3 className="font-medium text-xs text-center line-clamp-1">{category.name}</h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products by Category */}
      {categories?.map((category) => (
        <CategoryProductsSection key={category.id} category={category} />
      ))}
    </div>
  );
};

export default Home;