import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface SpecialOffer {
  id: string;
  name: string;
  image_url: string | null;
  background_color: string;
}

const HomeSpecialOffers = () => {
  const { settings } = useSettings();
  const showHomeSpecialOffers = (settings as any)?.show_home_special_offers !== false;
  const offersShape = (settings as any)?.home_offers_shape || 'circles';
  
  const { data: offers, isLoading } = useQuery({
    queryKey: ['home-special-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_offers')
        .select('id, name, image_url, background_color')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(3);
      if (error) throw error;
      return data as SpecialOffer[];
    },
    enabled: showHomeSpecialOffers
  });

  if (!showHomeSpecialOffers) return null;
  if (isLoading) {
    return (
      <div className="flex justify-center gap-3 py-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-muted animate-pulse rounded-full" />
        ))}
      </div>
    );
  }
  if (!offers || offers.length === 0) return null;

  // Display based on merchant's setting
  const displayAsCircles = offersShape === 'circles';

  return (
    <div className="flex justify-center gap-5 sm:gap-6 py-5">
      {displayAsCircles ? (
        // 3 Circles Layout
        offers.slice(0, 3).map((offer) => (
          <Link
            key={offer.id}
            to={`/special-offer/${offer.id}`}
            className="group relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex-shrink-0"
          >
            {offer.image_url ? (
              <img
                src={offer.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ background: offer.background_color || 'hsl(var(--primary))' }}
              >
                <Package className="h-10 w-10 sm:h-12 sm:w-12 text-white/50" />
              </div>
            )}
            {/* Hover Glow */}
            <div 
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: `0 0 30px ${offer.background_color || 'hsl(var(--primary))'}` }}
            />
          </Link>
        ))
      ) : (
        // 2 Squares Layout
        offers.slice(0, 2).map((offer) => (
          <Link
            key={offer.id}
            to={`/special-offer/${offer.id}`}
            className="group relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex-shrink-0"
          >
            {offer.image_url ? (
              <img
                src={offer.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ background: offer.background_color || 'hsl(var(--primary))' }}
              >
                <Package className="h-12 w-12 sm:h-14 sm:w-14 text-white/50" />
              </div>
            )}
            {/* Hover Glow */}
            <div 
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: `0 0 30px ${offer.background_color || 'hsl(var(--primary))'}` }}
            />
          </Link>
        ))
      )}
    </div>
  );
};

export default HomeSpecialOffers;
