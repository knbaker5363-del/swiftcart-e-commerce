import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSettings } from '@/contexts/SettingsContext';
import BackgroundPattern from '@/components/BackgroundPattern';
import Breadcrumb from '@/components/Breadcrumb';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SpecialOffer {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  size: string;
  price: number | null;
  condition_text: string | null;
  sort_order: number;
}

const SpecialOffers = () => {
  useDocumentTitle('العروض الخاصة');
  const [cartOpen, setCartOpen] = useState(false);
  const { settings } = useSettings();

  const { data: offers, isLoading } = useQuery({
    queryKey: ['special-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as SpecialOffer[];
    }
  });

  const getSizeClasses = (size: string) => {
    switch (size) {
      case '2x4':
        return 'col-span-2 row-span-1 aspect-[2/1]';
      case '4x4':
        return 'col-span-2 row-span-2 aspect-square';
      case 'circle':
        return 'col-span-1 row-span-1 aspect-square';
      case '2x2':
      default:
        return 'col-span-1 row-span-1 aspect-square';
    }
  };

  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      <BackgroundPattern />
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Hero Banner */}
      <section 
        className="py-8 md:py-12"
        style={{ backgroundColor: (settings as any)?.hero_banner_color || '#000000' }}
      >
        <div className="container">
          <Breadcrumb 
            items={[{ label: 'العروض الخاصة' }]} 
            className="text-white/70 mb-4"
          />
          <div className="flex items-center gap-3 text-white">
            <Sparkles className="h-8 w-8" />
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">العروض الخاصة بنا</h1>
              <p className="text-white/70 mt-1">اكتشف أفضل العروض والخصومات الحصرية</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="py-8 container">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-square" />
            ))}
          </div>
        ) : offers && offers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-auto">
            {offers.map((offer) => (
              <Link
                key={offer.id}
                to={`/special-offer/${offer.id}`}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${getSizeClasses(offer.size)} ${offer.size === 'circle' ? 'rounded-full' : ''}`}
              >
                {/* Background Image */}
                {offer.image_url ? (
                  <img
                    src={offer.image_url}
                    alt={offer.name}
                    className={`w-full h-full object-cover ${offer.size === 'circle' ? 'rounded-full' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <Sparkles className="h-16 w-16 text-white/50" />
                  </div>
                )}

                {/* Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all ${offer.size === 'circle' ? 'rounded-full' : ''}`}>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg md:text-xl mb-1">{offer.name}</h3>
                    {offer.condition_text && (
                      <p className="text-sm text-white/80 mb-2">{offer.condition_text}</p>
                    )}
                    {offer.price && (
                      <div className="inline-block bg-primary px-3 py-1 rounded-full text-sm font-bold">
                        {offer.price} ₪
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Sparkles className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">لا توجد عروض خاصة حالياً</p>
            <p className="text-muted-foreground/70 text-sm mt-2">تابعنا لمعرفة أحدث العروض</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SpecialOffers;
