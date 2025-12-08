import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';

const Brands = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { settings } = useSettings();
  const heroBannerColor = (settings as any)?.hero_banner_color || '#000000';

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
              <Award className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                العلامات التجارية
              </h1>
              <p className="text-white/70 text-base md:text-lg max-w-md mx-auto">
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
                <Link key={brand.id} to={`/brand/${brand.id}`}>
                  <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer">
                    <div className="aspect-square p-6 flex items-center justify-center bg-white">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-full h-full object-contain"
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