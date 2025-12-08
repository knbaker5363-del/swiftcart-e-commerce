import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import CartButton from '@/components/CartButton';
import { useSettings } from '@/contexts/SettingsContext';
import { useFavorites } from '@/contexts/FavoritesContext';

interface ProductGridProps {
  products: any[];
  onProductClick: (product: any) => void;
  getColorValue: (color: string) => string;
}

const ProductGrid = ({ products, onProductClick, getColorValue }: ProductGridProps) => {
  const { settings } = useSettings();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Get card display settings
  const cardSize = (settings as any)?.card_size || 'medium';
  const cardsPerRowMobile = (settings as any)?.cards_per_row_mobile || 2;
  const cardsPerRowDesktop = (settings as any)?.cards_per_row_desktop || 4;

  // Calculate grid classes based on settings
  const getGridClasses = () => {
    const mobileClass = `grid-cols-${cardsPerRowMobile}`;
    const desktopClass = `lg:grid-cols-${cardsPerRowDesktop}`;
    // Medium breakpoint - use value between mobile and desktop
    const tabletCols = Math.min(cardsPerRowDesktop, Math.max(cardsPerRowMobile, 3));
    const tabletClass = `md:grid-cols-${tabletCols}`;
    
    return `${mobileClass} ${tabletClass} ${desktopClass}`;
  };

  // Get card padding based on size
  const getCardPadding = () => {
    switch (cardSize) {
      case 'small': return 'p-2';
      case 'large': return 'p-4';
      default: return 'p-3';
    }
  };

  // Get text sizes based on card size
  const getTextSizes = () => {
    switch (cardSize) {
      case 'small': 
        return { 
          price: 'text-sm', 
          name: 'text-xs', 
          badge: 'text-[8px]',
          colorSwatch: 'w-4 h-4'
        };
      case 'large': 
        return { 
          price: 'text-xl', 
          name: 'text-base', 
          badge: 'text-xs',
          colorSwatch: 'w-6 h-6'
        };
      default: 
        return { 
          price: 'text-base', 
          name: 'text-sm', 
          badge: 'text-[10px]',
          colorSwatch: 'w-5 h-5'
        };
    }
  };

  const textSizes = getTextSizes();

  return (
    <div className={`grid gap-2 md:gap-3 ${getGridClasses()}`}>
      {products.map((product: any) => {
        const additionalImages = product.additional_images as string[] | null;
        const options = product.options as {
          sizes?: any[];
          colors?: string[];
        } | null;
        const hasDiscount = (product.discount_percentage ?? 0) > 0;
        const discountedPrice = hasDiscount
          ? product.price * (1 - (product.discount_percentage ?? 0) / 100)
          : product.price;

        return (
          <Card
            key={product.id}
            className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full"
          >
            <div className="relative flex-shrink-0">
              <div onClick={() => onProductClick(product)} className="cursor-pointer">
                <ProductImageCarousel
                  mainImage={product.image_url || '/placeholder.svg'}
                  additionalImages={additionalImages || []}
                  productName={product.name}
                />
              </div>
              {hasDiscount && (
                <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2">
                  -{product.discount_percentage}%
                </Badge>
              )}
              <button
                onClick={() => toggleFavorite(product.id)}
                className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite(product.id)
                      ? 'fill-destructive text-destructive'
                      : 'text-foreground'
                  }`}
                />
              </button>
            </div>

            <div className={`${getCardPadding()} flex flex-col flex-grow text-center`}>
              {/* Price */}
              <div className="flex items-center justify-center gap-2 mb-1">
                {hasDiscount ? (
                  <>
                    <span className={`${cardSize === 'small' ? 'text-[10px]' : 'text-xs'} text-muted-foreground line-through`}>
                      {product.price.toFixed(0)} ₪
                    </span>
                    <span className={`${textSizes.price} font-bold text-primary`}>
                      {discountedPrice.toFixed(0)} ₪
                    </span>
                  </>
                ) : (
                  <span className={`${textSizes.price} font-bold text-primary`}>
                    {product.price.toFixed(0)} ₪
                  </span>
                )}
              </div>

              {/* Product Name */}
              <div onClick={() => onProductClick(product)} className="cursor-pointer mb-2">
                <h3 className={`font-semibold ${textSizes.name} line-clamp-2 hover:text-primary transition-colors`}>
                  {product.name}
                </h3>
              </div>

              {/* Sizes */}
              {options?.sizes && options.sizes.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mb-2">
                  {options.sizes.map((size: any, idx: number) => {
                    const sizeName = typeof size === 'string' ? size : size.name;
                    return (
                      <span
                        key={idx}
                        className={`${textSizes.badge} px-2 py-0.5 border border-border rounded-md bg-background`}
                      >
                        {sizeName}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Colors */}
              {options?.colors && options.colors.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mb-2">
                  {options.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className={`${textSizes.colorSwatch} rounded border border-border`}
                      style={{ backgroundColor: getColorValue(color) }}
                      title={color}
                    />
                  ))}
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="flex justify-center mt-auto">
                <CartButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductClick(product);
                  }}
                  size={cardSize === 'small' ? 'sm' : cardSize === 'large' ? 'default' : 'sm'}
                  variant="secondary"
                />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductGrid;
