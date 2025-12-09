import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSettings } from '@/contexts/SettingsContext';
import BackgroundPattern from '@/components/BackgroundPattern';
import Breadcrumb from '@/components/Breadcrumb';
import ProductGrid from '@/components/ProductGrid';
import ProductQuickView from '@/components/ProductQuickView';
import { Sparkles } from 'lucide-react';

const SpecialOfferDetail = () => {
  const { id } = useParams();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { settings } = useSettings();

  const { data: offer, isLoading: offerLoading } = useQuery({
    queryKey: ['special-offer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['special-offer-products', id],
    queryFn: async () => {
      const { data: offerProducts, error: opError } = await supabase
        .from('special_offer_products')
        .select('product_id')
        .eq('offer_id', id);
      
      if (opError) throw opError;
      if (!offerProducts || offerProducts.length === 0) return [];

      const productIds = offerProducts.map(op => op.product_id);
      const { data: products, error: pError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)
        .eq('is_active', true);
      
      if (pError) throw pError;
      return products;
    },
    enabled: !!id
  });

  useDocumentTitle(offer?.name || 'العرض الخاص');

  const getColorValue = (color: string) => {
    const colorMap: Record<string, string> = {
      'أبيض': '#FFFFFF', 'أسود': '#000000', 'أحمر': '#FF0000',
      'أزرق': '#0000FF', 'أخضر': '#00FF00', 'أصفر': '#FFFF00',
      'برتقالي': '#FFA500', 'بني': '#8B4513', 'رمادي': '#808080',
      'زهري': '#FFC0CB', 'بنفسجي': '#800080', 'كحلي': '#000080',
    };
    return color.startsWith('#') ? color : colorMap[color] || color;
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  if (offerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      <BackgroundPattern />
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Hero Banner with Offer Image */}
      <section className="relative">
        {offer?.image_url && (
          <div className="w-full h-48 md:h-72 overflow-hidden">
            <img
              src={offer.image_url}
              alt={offer.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        )}
        <div 
          className={`${offer?.image_url ? 'absolute bottom-0 left-0 right-0' : ''} py-6 md:py-8`}
          style={{ backgroundColor: offer?.image_url ? 'transparent' : ((settings as any)?.hero_banner_color || '#000000') }}
        >
          <div className="container">
            <Breadcrumb 
              items={[
                { label: 'العروض الخاصة', href: '/special-offers' },
                { label: offer?.name || '' }
              ]} 
              className="text-white/70 mb-3"
            />
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
              <div>
                <h1 className="text-xl md:text-3xl font-bold">{offer?.name}</h1>
                {offer?.condition_text && (
                  <p className="text-white/80 mt-1">{offer.condition_text}</p>
                )}
              </div>
            </div>
            {offer?.price && (
              <div className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-lg">
                {offer.price} ₪
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      {offer?.description && (
        <section className="py-6 container">
          <div className="bg-muted/50 rounded-xl p-4 border">
            <p className="text-foreground">{offer.description}</p>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="py-8 container">
        <h2 className="text-xl font-bold mb-6">منتجات هذا العرض</h2>
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted animate-pulse rounded-xl h-64" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <ProductGrid
            products={products}
            onProductClick={handleProductClick}
            getColorValue={getColorValue}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد منتجات مرتبطة بهذا العرض</p>
          </div>
        )}
      </section>

      {selectedProduct && (
        <ProductQuickView 
          product={selectedProduct} 
          open={quickViewOpen} 
          onOpenChange={setQuickViewOpen} 
        />
      )}
    </div>
  );
};

export default SpecialOfferDetail;
