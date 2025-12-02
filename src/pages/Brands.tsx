import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const Brands = () => {
  const [cartOpen, setCartOpen] = useState(false);

  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Header */}
      <section className="bg-gradient-primary text-primary-foreground py-12">
        <div className="container">
          <div className="flex items-center justify-center gap-4 animate-fade-in">
            <Award className="h-12 w-12" />
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">العلامات التجارية</h1>
              <p className="text-lg opacity-90">
                تسوق من أفضل العلامات التجارية العالمية
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : brands && brands.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {brands.map((brand) => (
                <Link key={brand.id} to={`/brands/${brand.id}`}>
                  <Card className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className="aspect-square p-6 flex items-center justify-center bg-white">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-card">
                      <h3 className="font-bold text-center text-lg">{brand.name}</h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">لا توجد علامات تجارية</h3>
              <p className="text-muted-foreground">سيتم إضافة العلامات التجارية قريباً</p>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-12 text-center max-w-2xl mx-auto">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">نوفر لك أفضل العلامات التجارية</h3>
              <p className="text-muted-foreground">
                نحن نعمل مع أشهر العلامات التجارية العالمية لنوفر لك منتجات عالية الجودة وأصلية بأفضل الأسعار
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Brands;