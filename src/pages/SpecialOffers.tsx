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

  // Grid configuration - matches admin editor exactly
  const GRID_COLS = 4;
  const CELL_SIZE_DESKTOP = 140;
  const CELL_SIZE_MOBILE = 80;
  const GAP_DESKTOP = 16;
  const GAP_MOBILE = 10;

  // Convert size to width/height
  const getSizeFromType = (size: string): { width: number; height: number; isCircle: boolean } => {
    switch (size) {
      case '2x4':
        return { width: 2, height: 1, isCircle: false };
      case '4x4':
        return { width: 2, height: 2, isCircle: false };
      case 'circle':
        return { width: 1, height: 1, isCircle: true };
      case '2x2':
      default:
        return { width: 1, height: 1, isCircle: false };
    }
  };

  // Calculate grid positions from offers
  const getPositionedOffers = () => {
    return offers?.map((offer, index) => {
      const { width, height, isCircle } = getSizeFromType(offer.size);
      return {
        ...offer,
        col: offer.position_x ?? (index % GRID_COLS),
        row: offer.position_y ?? Math.floor(index / GRID_COLS),
        width,
        height,
        isCircle,
      };
    }) || [];
  };

  const positionedOffers = getPositionedOffers();
  const maxRow = Math.max(...positionedOffers.map(o => o.row + o.height), 2);

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

      {/* Offers Grid - Exact Match to Admin Editor */}
      <section className="py-6 md:py-8 container px-3 md:px-4">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-3 md:gap-4 mx-auto" style={{ maxWidth: `${GRID_COLS * (CELL_SIZE_DESKTOP + GAP_DESKTOP)}px` }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted animate-pulse rounded-xl md:rounded-2xl aspect-square" />
            ))}
          </div>
        ) : offers && offers.length > 0 ? (
          <>
            {/* Desktop Grid - 4 columns like admin editor */}
            <div 
              className="hidden md:block relative mx-auto"
              style={{
                width: `${GRID_COLS * (CELL_SIZE_DESKTOP + GAP_DESKTOP)}px`,
                height: `${maxRow * (CELL_SIZE_DESKTOP + GAP_DESKTOP)}px`,
              }}
            >
              {positionedOffers.map((offer) => (
                <Link
                  key={offer.id}
                  to={`/special-offer/${offer.id}`}
                  className={`group absolute overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:z-10 ${
                    offer.isCircle ? 'rounded-full' : 'rounded-2xl'
                  }`}
                  style={{
                    left: `${offer.col * (CELL_SIZE_DESKTOP + GAP_DESKTOP)}px`,
                    top: `${offer.row * (CELL_SIZE_DESKTOP + GAP_DESKTOP)}px`,
                    width: `${offer.width * CELL_SIZE_DESKTOP + (offer.width - 1) * GAP_DESKTOP}px`,
                    height: `${offer.height * CELL_SIZE_DESKTOP + (offer.height - 1) * GAP_DESKTOP}px`,
                    background: offer.image_url ? undefined : `linear-gradient(135deg, ${offer.background_color}, ${offer.background_color}dd)`,
                  }}
                >
                  {getOfferBadge(offer)}
                  {offer.image_url ? (
                    <img src={offer.image_url} alt={offer.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: offer.background_color }}>
                      <Package className="h-12 w-12 opacity-20" style={{ color: offer.text_color }} />
                    </div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-end text-center p-3 pb-4 ${offer.isCircle ? 'rounded-full' : ''}`}>
                    <h3 className="font-bold text-sm mb-1 text-white leading-tight line-clamp-2">{offer.name}</h3>
                    {offer.condition_text && !offer.isCircle && (
                      <p className="text-xs text-white/80 mb-1.5 line-clamp-1">{offer.condition_text}</p>
                    )}
                    {offer.expires_at && !offer.isCircle && (
                      <div className="mb-2 scale-75">
                        <CountdownTimer expiresAt={offer.expires_at} size="sm" showLabels={false} />
                      </div>
                    )}
                    {offer.bundle_price ? (
                      <div className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-1 rounded-full text-white font-bold text-xs">
                        <Zap className="h-3 w-3" />
                        {offer.required_quantity} بـ {offer.bundle_price}₪
                      </div>
                    ) : offer.price ? (
                      <div className="inline-block bg-primary px-2 py-1 rounded-full font-bold text-xs text-primary-foreground">
                        {offer.price}₪
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Grid - 4 columns like admin editor */}
            <div 
              className="md:hidden relative mx-auto"
              style={{
                width: `${GRID_COLS * (CELL_SIZE_MOBILE + GAP_MOBILE)}px`,
                height: `${maxRow * (CELL_SIZE_MOBILE + GAP_MOBILE)}px`,
              }}
            >
              {positionedOffers.map((offer) => (
                <Link
                  key={offer.id}
                  to={`/special-offer/${offer.id}`}
                  className={`group absolute overflow-hidden transition-all duration-300 active:scale-95 ${
                    offer.isCircle ? 'rounded-full' : 'rounded-xl'
                  }`}
                  style={{
                    left: `${offer.col * (CELL_SIZE_MOBILE + GAP_MOBILE)}px`,
                    top: `${offer.row * (CELL_SIZE_MOBILE + GAP_MOBILE)}px`,
                    width: `${offer.width * CELL_SIZE_MOBILE + (offer.width - 1) * GAP_MOBILE}px`,
                    height: `${offer.height * CELL_SIZE_MOBILE + (offer.height - 1) * GAP_MOBILE}px`,
                    background: offer.image_url ? undefined : `linear-gradient(135deg, ${offer.background_color}, ${offer.background_color}dd)`,
                  }}
                >
                  {getOfferBadge(offer)}
                  {offer.image_url ? (
                    <img src={offer.image_url} alt={offer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: offer.background_color }}>
                      <Package className="h-6 w-6 opacity-20" style={{ color: offer.text_color }} />
                    </div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col items-center justify-end text-center p-1.5 pb-2 ${offer.isCircle ? 'rounded-full' : ''}`}>
                    <h3 className="font-bold text-[10px] mb-0.5 text-white leading-tight line-clamp-2">{offer.name}</h3>
                    {offer.bundle_price ? (
                      <div className="inline-flex items-center gap-0.5 bg-gradient-to-r from-green-500 to-emerald-500 px-1.5 py-0.5 rounded-full text-white font-bold text-[8px]">
                        <Zap className="h-2 w-2" />
                        {offer.required_quantity} بـ {offer.bundle_price}₪
                      </div>
                    ) : offer.price ? (
                      <div className="inline-block bg-primary px-1.5 py-0.5 rounded-full font-bold text-[8px] text-primary-foreground">
                        {offer.price}₪
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
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
