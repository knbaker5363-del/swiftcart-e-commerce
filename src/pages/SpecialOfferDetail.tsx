import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSettings } from '@/contexts/SettingsContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import BackgroundPattern from '@/components/BackgroundPattern';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Sparkles, ShoppingCart, Check, Package, Flame, X } from 'lucide-react';

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

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
}

const SpecialOfferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const { settings } = useSettings();
  const { addSpecialOffer } = useCart();

  const { data: offer, isLoading: offerLoading } = useQuery({
    queryKey: ['special-offer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as SpecialOffer;
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
        .select('id, name, image_url, price')
        .in('id', productIds)
        .eq('is_active', true);
      
      if (pError) throw pError;
      return products as Product[];
    },
    enabled: !!id
  });

  useDocumentTitle(offer?.name || 'العرض الخاص');

  const toggleProductSelection = (product: Product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    
    if (isSelected) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
    } else {
      if (offer?.required_quantity && selectedProducts.length >= offer.required_quantity) {
        toast({
          title: 'تم الوصول للحد الأقصى',
          description: `يمكنك اختيار ${offer.required_quantity} منتجات فقط`,
          variant: 'destructive',
        });
        return;
      }
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const handleAddToCart = () => {
    if (!offer) return;
    
    if (offer.offer_type === 'bundle' && offer.required_quantity) {
      if (selectedProducts.length !== offer.required_quantity) {
        toast({
          title: 'اختر المنتجات المطلوبة',
          description: `يجب اختيار ${offer.required_quantity} منتجات`,
          variant: 'destructive',
        });
        return;
      }
    }

    addSpecialOffer({
      offer_id: offer.id,
      offer_name: offer.name,
      bundle_price: offer.bundle_price || offer.price || 0,
      products: selectedProducts.map(p => ({
        id: p.id,
        name: p.name,
        image_url: p.image_url || undefined,
      })),
      background_color: offer.background_color,
      text_color: offer.text_color,
    });

    toast({
      title: '✓ تمت الإضافة للسلة',
      description: `${offer.name} مع ${selectedProducts.length} منتجات`,
    });

    setSelectedProducts([]);
    setCartOpen(true);
  };

  if (offerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const requiredQuantity = offer?.required_quantity || 0;
  const selectedCount = selectedProducts.length;
  const canAddToCart = offer?.offer_type !== 'bundle' || selectedCount === requiredQuantity;

  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      <BackgroundPattern />
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Hero Banner with Offer Color */}
      <section 
        className="relative"
        style={{ backgroundColor: offer?.background_color || '#7c3aed' }}
      >
        {offer?.image_url && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={offer.image_url}
              alt={offer.name}
              className="w-full h-full object-cover opacity-30"
            />
          </div>
        )}
        <div className="relative py-8 md:py-12">
          <div className="container">
            <Breadcrumb 
              items={[
                { label: 'العروض الخاصة', href: '/special-offers' },
                { label: offer?.name || '' }
              ]} 
              className="mb-4 text-white/70"
            />
            
            <div className="flex items-start gap-4" style={{ color: offer?.text_color }}>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                {offer?.offer_type === 'bundle' ? (
                  <Flame className="h-7 w-7" />
                ) : (
                  <Sparkles className="h-7 w-7" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl font-bold mb-2">{offer?.name}</h1>
                {offer?.condition_text && (
                  <p className="opacity-80 text-lg">{offer.condition_text}</p>
                )}
              </div>
            </div>

            {/* Price Badge */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {offer?.bundle_price ? (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-xl font-bold" style={{ color: offer?.text_color }}>
                  <Package className="h-5 w-5" />
                  {requiredQuantity} منتجات بـ {offer.bundle_price}₪ فقط
                </div>
              ) : offer?.price ? (
                <div className="inline-block bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-xl font-bold" style={{ color: offer?.text_color }}>
                  {offer.price}₪
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Selection Counter - Sticky */}
      {offer?.offer_type === 'bundle' && requiredQuantity > 0 && (
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b shadow-sm">
          <div className="container py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300"
                  style={{ 
                    backgroundColor: canAddToCart ? '#22c55e' : offer?.background_color,
                    color: canAddToCart ? 'white' : offer?.text_color 
                  }}
                >
                  {selectedCount}/{requiredQuantity}
                </div>
                <div>
                  <p className="font-bold">
                    {canAddToCart ? '✓ تم الاختيار!' : `اختر ${requiredQuantity - selectedCount} منتجات إضافية`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProducts.map(p => p.name).join(' • ') || 'لم يتم اختيار أي منتج بعد'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="gap-2 transition-all duration-300"
                style={{ 
                  backgroundColor: canAddToCart ? '#22c55e' : undefined,
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                إضافة للسلة
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {offer?.description && (
        <section className="py-6 container">
          <div className="bg-muted/50 rounded-xl p-4 border">
            <p className="text-foreground whitespace-pre-line">{offer.description}</p>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-8 container">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          {offer?.offer_type === 'bundle' ? 'اختر منتجاتك' : 'منتجات هذا العرض'}
        </h2>
        
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted animate-pulse rounded-xl h-64" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProductSelection(product)}
                  className={`relative group text-right rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                    isSelected 
                      ? 'border-green-500 ring-2 ring-green-500/30 scale-[1.02]' 
                      : 'border-border hover:border-primary/50 hover:shadow-lg'
                  }`}
                >
                  {/* Selection Indicator */}
                  <div className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected 
                      ? 'bg-green-500 text-white scale-110' 
                      : 'bg-white/90 text-muted-foreground border'
                  }`}>
                    {isSelected ? <Check className="h-4 w-4" /> : <span className="text-sm">{selectedProducts.findIndex(p => p.id === product.id) + 1 || ''}</span>}
                  </div>

                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-300 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 bg-card">
                    <p className="font-bold text-sm truncate">{product.name}</p>
                    <p className="text-muted-foreground text-sm line-through">{product.price}₪</p>
                  </div>

                  {/* Selection Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد منتجات مرتبطة بهذا العرض</p>
          </div>
        )}
      </section>

      {/* Fixed Bottom Bar for Mobile */}
      {offer?.offer_type === 'bundle' && requiredQuantity > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg p-4 md:hidden">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ 
                backgroundColor: canAddToCart ? '#22c55e' : offer?.background_color,
                color: canAddToCart ? 'white' : offer?.text_color 
              }}
            >
              {selectedCount}/{requiredQuantity}
            </div>
            <Button 
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="flex-1 h-12 gap-2 text-lg"
              style={{ 
                backgroundColor: canAddToCart ? '#22c55e' : undefined,
              }}
            >
              <ShoppingCart className="h-5 w-5" />
              {canAddToCart ? `إضافة بـ ${offer?.bundle_price}₪` : `اختر ${requiredQuantity - selectedCount} أخرى`}
            </Button>
          </div>
        </div>
      )}

      {/* Spacer for fixed bottom bar */}
      {offer?.offer_type === 'bundle' && <div className="h-24 md:hidden" />}
    </div>
  );
};

export default SpecialOfferDetail;
