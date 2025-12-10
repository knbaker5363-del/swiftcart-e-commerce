import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Sparkles, Flame, Zap, Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const HomeSpecialOffers = () => {
  const { data: offers, isLoading } = useQuery({
    queryKey: ['home-special-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(4);
      if (error) throw error;
      return data as SpecialOffer[];
    }
  });

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-8 w-24 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-square" />
          ))}
        </div>
      </section>
    );
  }

  if (!offers || offers.length === 0) return null;

  return (
    <section className="py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold">العروض الخاصة</h2>
        </div>
        <Link to="/special-offers">
          <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80">
            عرض الكل
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {offers.slice(0, 4).map((offer, index) => (
          <Link
            key={offer.id}
            to={`/special-offer/${offer.id}`}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 aspect-square"
            style={{ 
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* Animated Glow Border */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ 
                boxShadow: `0 0 25px ${offer.background_color}80, 0 0 50px ${offer.background_color}40`,
              }}
            />

            {/* Offer Badge */}
            {offer.offer_type === 'bundle' && offer.required_quantity ? (
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold shadow-lg animate-pulse">
                <Flame className="h-3 w-3" />
                اختر {offer.required_quantity}
              </div>
            ) : (
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-lg">
                <Sparkles className="h-3 w-3" />
                عرض
              </div>
            )}

            {/* Background Image or Gradient */}
            {offer.image_url ? (
              <img
                src={offer.image_url}
                alt={offer.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${offer.background_color}, ${offer.background_color}dd)` }}
              >
                <Package className="h-16 w-16 opacity-30 animate-pulse" style={{ color: offer.text_color }} />
              </div>
            )}

            {/* Gradient Overlay with Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center justify-end text-center p-3">
              <h3 className="font-bold text-sm md:text-base mb-1 text-white line-clamp-2 drop-shadow-lg">
                {offer.name}
              </h3>
              
              {/* Price Display */}
              {offer.bundle_price ? (
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg group-hover:animate-pulse group-hover:shadow-[0_0_15px_rgba(34,197,94,0.6)]">
                  <Zap className="h-3 w-3" />
                  {offer.required_quantity} بـ {offer.bundle_price}₪
                </div>
              ) : offer.price ? (
                <div className="inline-block bg-primary px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg group-hover:animate-pulse">
                  {offer.price}₪
                </div>
              ) : null}
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
              <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
            </div>

            {/* Pulsing Border on Hover */}
            <div 
              className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"
              style={{ borderColor: offer.background_color }}
            />
          </Link>
        ))}
      </div>

      {/* View All Button - Mobile Friendly */}
      {offers.length >= 4 && (
        <Link to="/special-offers" className="block mt-4">
          <Button 
            variant="outline" 
            className="w-full gap-2 h-12 text-base font-bold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
          >
            <Sparkles className="h-5 w-5" />
            عرض جميع العروض الخاصة
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </section>
  );
};

export default HomeSpecialOffers;
