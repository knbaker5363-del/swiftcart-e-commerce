import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSettings } from '@/contexts/SettingsContext';
import BackgroundPattern from '@/components/BackgroundPattern';
import Breadcrumb from '@/components/Breadcrumb';
import { Sparkles, Flame, Zap, Package } from 'lucide-react';
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
  offer_type: string;
  required_quantity: number;
  bundle_price: number | null;
  background_color: string;
  text_color: string;
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

  const getOfferBadge = (offer: SpecialOffer) => {
    if (offer.offer_type === 'bundle' && offer.required_quantity) {
      return (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold shadow-lg animate-pulse">
          <Flame className="h-4 w-4" />
          اختر {offer.required_quantity}
        </div>
      );
    }
    return (
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-lg">
        <Sparkles className="h-4 w-4" />
        عرض خاص
      </div>
    );
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
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
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
            {offers.map((offer, index) => (
              <Link
                key={offer.id}
                to={`/special-offer/${offer.id}`}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] ${getSizeClasses(offer.size)} ${offer.size === 'circle' ? 'rounded-full' : ''}`}
                style={{ 
                  background: offer.image_url ? undefined : `linear-gradient(135deg, ${offer.background_color}, ${offer.background_color}dd)`,
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Animated Glow Border */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"
                  style={{ 
                    boxShadow: `0 0 30px ${offer.background_color}80, 0 0 60px ${offer.background_color}40`,
                  }}
                />

                {/* Offer Badge */}
                {getOfferBadge(offer)}

                {/* Background Image or Gradient */}
                {offer.image_url ? (
                  <img
                    src={offer.image_url}
                    alt={offer.name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${offer.size === 'circle' ? 'rounded-full' : ''}`}
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: offer.background_color }}
                  >
                    <Package className="h-20 w-20 opacity-30 animate-pulse" style={{ color: offer.text_color }} />
                  </div>
                )}

                {/* Gradient Overlay - Centered Content */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 group-hover:via-black/60 transition-all duration-300 flex flex-col items-center justify-center text-center p-4 ${offer.size === 'circle' ? 'rounded-full' : ''}`}>
                  <h3 className="font-bold text-xl md:text-2xl mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-white animate-fade-in">{offer.name}</h3>
                  
                  {offer.condition_text && (
                    <p className="text-sm text-white/90 mb-3 line-clamp-2 drop-shadow-lg max-w-[90%]">{offer.condition_text}</p>
                  )}
                  
                  {/* Price Display with Pulse */}
                  {offer.bundle_price ? (
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-2 rounded-full text-white font-bold shadow-xl text-lg group-hover:animate-pulse group-hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                      <Zap className="h-5 w-5" />
                      {offer.required_quantity} بـ {offer.bundle_price}₪
                    </div>
                  ) : offer.price ? (
                    <div className="inline-block bg-primary px-5 py-2 rounded-full font-bold shadow-xl text-lg text-white group-hover:animate-pulse">
                      {offer.price}₪
                    </div>
                  ) : null}
                </div>

                {/* Hover Glow Effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  style={{ backgroundColor: offer.background_color }}
                />
                
                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                  <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                </div>

                {/* Floating Particles Effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full animate-bounce"
                      style={{
                        backgroundColor: offer.text_color,
                        opacity: 0.3,
                        left: `${20 + i * 15}%`,
                        top: `${30 + (i % 3) * 20}%`,
                        animationDelay: `${i * 200}ms`,
                        animationDuration: `${1 + i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground text-lg">لا توجد عروض خاصة حالياً</p>
            <p className="text-muted-foreground/70 text-sm mt-2">تابعنا لمعرفة أحدث العروض</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SpecialOffers;
