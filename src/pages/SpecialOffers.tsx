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
import { CountdownTimer, CountdownBadge } from '@/components/ui/countdown-timer';

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
  expires_at: string | null;
  position_x: number | null;
  position_y: number | null;
}

const SpecialOffers = () => {
  useDocumentTitle('العروض الخاصة');
  const [cartOpen, setCartOpen] = useState(false);
  const { settings } = useSettings();
  
  // Read from settings, default to true (show badges)
  const showBadges = (settings as any)?.show_offer_badges !== false;

  const { data: offers, isLoading } = useQuery({
    queryKey: ['special-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      // Filter out expired offers
      const now = new Date();
      return (data as SpecialOffer[]).filter(offer => 
        !offer.expires_at || new Date(offer.expires_at) > now
      );
    }
  });

  const getSizeClasses = (size: string) => {
    switch (size) {
      case '2x4':
        return 'col-span-2 row-span-1 aspect-[2/1]';
      case '4x4':
        return 'col-span-2 row-span-2 aspect-square';
      case 'circle':
        return 'col-span-1 row-span-1 aspect-square rounded-full';
      case '2x2':
      default:
        return 'col-span-1 row-span-1 aspect-square';
    }
  };

  const getMobileSizeClasses = (size: string) => {
    switch (size) {
      case '2x4':
      case '4x4':
        return 'col-span-2 aspect-[16/10]';
      default:
        return 'col-span-1 aspect-[4/5]';
    }
  };

  const getOfferBadge = (offer: SpecialOffer) => {
    if (!showBadges) return null;
    
    if (offer.offer_type === 'bundle' && offer.required_quantity) {
      return (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10 flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs md:text-sm font-bold shadow-lg animate-pulse">
          <Flame className="h-3 w-3 md:h-4 md:w-4" />
          اختر {offer.required_quantity}
        </div>
      );
    }
    return (
      <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10 flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs md:text-sm font-bold shadow-lg">
        <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
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

      {/* Offers Grid - Visual Editor Style */}
      <section className="py-6 md:py-8 container px-3 md:px-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted animate-pulse rounded-xl md:rounded-2xl aspect-square" />
            ))}
          </div>
        ) : offers && offers.length > 0 ? (
          <>
            {/* Desktop Grid */}
            <div 
              className="hidden md:grid gap-4 mx-auto"
              style={{
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridAutoRows: '140px',
                maxWidth: '700px',
              }}
            >
              {offers.map((offer) => {
                const isCircle = offer.size === 'circle';
                const is4x4 = offer.size === '4x4';
                const is2x4 = offer.size === '2x4';
                const colSpan = (is4x4 || is2x4) ? 2 : 1;
                const rowSpan = is4x4 ? 2 : 1;
                
                return (
                  <Link
                    key={offer.id}
                    to={`/special-offer/${offer.id}`}
                    className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                      isCircle ? 'rounded-full' : 'rounded-2xl'
                    }`}
                    style={{
                      gridColumn: `span ${colSpan}`,
                      gridRow: `span ${rowSpan}`,
                      background: offer.image_url ? undefined : `linear-gradient(135deg, ${offer.background_color}, ${offer.background_color}cc)`,
                    }}
                  >
                    {getOfferBadge(offer)}
                    {offer.image_url ? (
                      <img src={offer.image_url} alt={offer.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: offer.background_color }}>
                        <Package className="h-20 w-20 opacity-30" style={{ color: offer.text_color }} />
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col items-center justify-end text-center p-3 pb-4 ${isCircle ? 'rounded-full' : ''}`}>
                      <h3 className="font-bold text-base mb-1 text-white leading-tight line-clamp-2">{offer.name}</h3>
                      {offer.condition_text && !isCircle && (
                        <p className="text-xs text-white/80 mb-2 line-clamp-1">{offer.condition_text}</p>
                      )}
                      {offer.expires_at && (
                        <div className="mb-3">
                          <CountdownTimer expiresAt={offer.expires_at} size="sm" showLabels={false} />
                        </div>
                      )}
                      {offer.bundle_price ? (
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-1.5 rounded-full text-white font-bold text-sm">
                          <Zap className="h-4 w-4" />
                          {offer.required_quantity} بـ {offer.bundle_price}₪
                        </div>
                      ) : offer.price ? (
                        <div className="inline-block bg-primary px-4 py-1.5 rounded-full font-bold text-sm text-white">
                          {offer.price}₪
                        </div>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Grid - 2 columns */}
            <div className="grid md:hidden grid-cols-2 gap-3">
              {offers.map((offer) => {
                const isCircle = offer.size === 'circle';
                
                return (
                  <Link
                    key={offer.id}
                    to={`/special-offer/${offer.id}`}
                    className={`group relative overflow-hidden transition-all duration-300 aspect-square ${
                      isCircle ? 'rounded-full' : 'rounded-xl'
                    }`}
                    style={{
                      background: offer.image_url ? undefined : `linear-gradient(135deg, ${offer.background_color}, ${offer.background_color}cc)`,
                    }}
                  >
                    {getOfferBadge(offer)}
                    {offer.image_url ? (
                      <img src={offer.image_url} alt={offer.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: offer.background_color }}>
                        <Package className="h-12 w-12 opacity-30" style={{ color: offer.text_color }} />
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col items-center justify-end text-center p-2 pb-3 ${isCircle ? 'rounded-full' : ''}`}>
                      <h3 className="font-bold text-xs mb-1 text-white leading-tight line-clamp-2">{offer.name}</h3>
                      {offer.expires_at && (
                        <div className="mb-2 scale-75">
                          <CountdownTimer expiresAt={offer.expires_at} size="sm" showLabels={false} />
                        </div>
                      )}
                      {offer.bundle_price ? (
                        <div className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-1 rounded-full text-white font-bold text-[10px]">
                          <Zap className="h-3 w-3" />
                          {offer.required_quantity} بـ {offer.bundle_price}₪
                        </div>
                      ) : offer.price ? (
                        <div className="inline-block bg-primary px-2 py-1 rounded-full font-bold text-[10px] text-white">
                          {offer.price}₪
                        </div>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
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
