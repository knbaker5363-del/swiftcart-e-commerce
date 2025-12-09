import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/contexts/SettingsContext';
import { useVisualEffects } from '@/hooks/useVisualEffects';
import { useFavorites } from '@/contexts/FavoritesContext';
import DealsBar from '@/components/DealsBar';
import BrandsButton from '@/components/BrandsButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Eye } from 'lucide-react';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import CartButton from '@/components/CartButton';
import { useState, useRef } from 'react';

interface PremiumLayoutProps {
  products: any[];
  isLoadingProducts: boolean;
  onProductClick: (product: any) => void;
  getColorValue: (color: string) => string;
}

const PremiumLayout = ({
  products,
  isLoadingProducts,
  onProductClick,
  getColorValue
}: PremiumLayoutProps) => {
  const { settings } = useSettings();
  const { isEnabled } = useVisualEffects();
  const { toggleFavorite, isFavorite } = useFavorites();

  const enable3D = (settings as any)?.layout_enable_3d_effect !== false;
  const effectType = (settings as any)?.layout_3d_effect_type || 'rotate';
  const featuredProductId = (settings as any)?.layout_featured_product_id;

  // Get featured product
  const { data: featuredProduct } = useQuery({
    queryKey: ['featured-product', featuredProductId],
    queryFn: async () => {
      if (!featuredProductId) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', featuredProductId)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!featuredProductId
  });

  if (isLoadingProducts) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-96 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Product - Large Hero Card */}
      {featuredProduct && (
        <FeaturedProductCard
          product={featuredProduct}
          onProductClick={onProductClick}
          enable3D={enable3D}
          effectType={effectType}
        />
      )}

      {/* Deals Bar */}
      <DealsBar />

      {/* Brands Button */}
      {settings?.show_brands_button !== false && <BrandsButton />}

      {/* Premium Product Grid - Large Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products
          .filter(p => p.id !== featuredProductId)
          .map((product) => (
            <PremiumProductCard
              key={product.id}
              product={product}
              onProductClick={onProductClick}
              enable3D={enable3D}
              effectType={effectType}
            />
          ))}
      </div>
    </div>
  );
};

interface ProductCardProps {
  product: any;
  onProductClick: (product: any) => void;
  enable3D: boolean;
  effectType: string;
}

const FeaturedProductCard = ({ product, onProductClick, enable3D, effectType }: ProductCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enable3D || effectType !== 'rotate' || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const discountedPrice = product.discount_percentage
    ? product.price * (1 - product.discount_percentage / 100)
    : null;

  const mainImage = product.image_url || '/placeholder.svg';
  const additionalImages = Array.isArray(product.additional_images) ? product.additional_images : [];

  return (
    <Card
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20"
      style={{
        transform: enable3D && effectType === 'rotate'
          ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
          : undefined,
        transition: 'transform 0.1s ease-out'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onProductClick(product)}
    >
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Large Product Image */}
        <div className="relative w-full md:w-1/2 aspect-square rounded-xl overflow-hidden">
          <ProductImageCarousel 
            mainImage={mainImage}
            additionalImages={additionalImages}
            productName={product.name} 
          />
          
          {/* Discount Badge */}
          {product.discount_percentage > 0 && (
            <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg px-4 py-1 rounded-full font-bold">
              -{product.discount_percentage}%
            </div>
          )}
          
          {/* Featured Badge */}
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
            منتج مميز ⭐
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {product.name}
          </h2>
          
          {product.description && (
            <p className="text-muted-foreground text-lg line-clamp-3">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-4">
            {discountedPrice ? (
              <>
                <span className="text-3xl font-bold text-primary">
                  ₪{discountedPrice.toFixed(2)}
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  ₪{product.price}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-primary">₪{product.price}</span>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(product);
              }}
            >
              <Eye className="h-5 w-5" />
              عرض التفاصيل
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-4"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const PremiumProductCard = ({ product, onProductClick, enable3D, effectType }: ProductCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enable3D || effectType !== 'rotate' || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const discountedPrice = product.discount_percentage
    ? product.price * (1 - product.discount_percentage / 100)
    : null;

  const mainImage = product.image_url || '/placeholder.svg';
  const additionalImages = Array.isArray(product.additional_images) ? product.additional_images : [];

  return (
    <Card
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
        isHovered ? 'shadow-2xl shadow-primary/20' : 'shadow-lg'
      }`}
      style={{
        transform: enable3D && effectType === 'rotate'
          ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${isHovered ? 'scale(1.02)' : ''}`
          : isHovered ? 'scale(1.02)' : undefined,
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onProductClick(product)}
    >
      {/* Large Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProductImageCarousel 
          mainImage={mainImage}
          additionalImages={additionalImages}
          productName={product.name} 
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        
        {/* Favorite Button */}
        <button
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
            }`}
          />
        </button>

        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full font-bold">
            -{product.discount_percentage}%
          </div>
        )}

        {/* Product Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {discountedPrice ? (
                <>
                  <span className="text-xl font-bold text-primary">
                    ₪{discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ₪{product.price}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-primary">₪{product.price}</span>
              )}
            </div>
            
            <CartButton onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PremiumLayout;
