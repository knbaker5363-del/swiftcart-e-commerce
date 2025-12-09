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
import { Heart, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import CartButton from '@/components/CartButton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryRowsLayoutProps {
  categories: any[];
  onProductClick: (product: any) => void;
  getColorValue: (color: string) => string;
}

const CategoryRowsLayout = ({
  categories,
  onProductClick,
  getColorValue
}: CategoryRowsLayoutProps) => {
  const { settings } = useSettings();

  const productsPerRow = (settings as any)?.layout_products_per_category_row || 6;
  const isScrollable = (settings as any)?.layout_category_row_scrollable !== false;
  const showViewAll = (settings as any)?.layout_show_category_view_all !== false;

  return (
    <div className="space-y-8">
      {/* Deals Bar */}
      <DealsBar />

      {/* Brands Button */}
      {settings?.show_brands_button !== false && <BrandsButton />}

      {/* Category Rows */}
      {categories.map((category) => (
        <CategoryRow
          key={category.id}
          category={category}
          productsPerRow={productsPerRow}
          isScrollable={isScrollable}
          showViewAll={showViewAll}
          onProductClick={onProductClick}
          getColorValue={getColorValue}
        />
      ))}
    </div>
  );
};

interface CategoryRowProps {
  category: any;
  productsPerRow: number;
  isScrollable: boolean;
  showViewAll: boolean;
  onProductClick: (product: any) => void;
  getColorValue: (color: string) => string;
}

const CategoryRow = ({
  category,
  productsPerRow,
  isScrollable,
  showViewAll,
  onProductClick,
  getColorValue
}: CategoryRowProps) => {
  const { settings } = useSettings();
  const { isEnabled } = useVisualEffects();
  const { toggleFavorite, isFavorite } = useFavorites();

  const { data: products, isLoading } = useQuery({
    queryKey: ['category-products', category.id, productsPerRow],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', category.id)
        .eq('is_active', true)
        .limit(productsPerRow);
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-48 flex-shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  const cardSize = (settings as any)?.card_size || 'medium';
  const getCardPadding = () => {
    switch (cardSize) {
      case 'small': return 'p-2';
      case 'large': return 'p-4';
      default: return 'p-3';
    }
  };

  const ProductCard = ({ product }: { product: any }) => {
    const discountedPrice = product.discount_percentage
      ? product.price * (1 - product.discount_percentage / 100)
      : null;

    const mainImage = product.image_url || '/placeholder.svg';
    const additionalImages = Array.isArray(product.additional_images) ? product.additional_images : [];

    return (
      <Card
        className={`${getCardPadding()} cursor-pointer transition-all duration-300 hover:shadow-lg flex-shrink-0 w-40 sm:w-48 ${
          isEnabled('product_hover_lift') ? 'hover:-translate-y-1' : ''
        } ${isEnabled('card_glass_effect') ? 'bg-card/80 backdrop-blur-sm' : 'bg-card'}`}
        onClick={() => onProductClick(product)}
      >
        <div className="relative">
          <ProductImageCarousel 
            mainImage={mainImage}
            additionalImages={additionalImages}
            productName={product.name} 
          />
          
          {/* Favorite Button */}
          <button
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              }`}
            />
          </button>

          {/* Discount Badge */}
          {product.discount_percentage > 0 && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
              -{product.discount_percentage}%
            </div>
          )}
        </div>

        <div className="mt-2 space-y-1 text-center">
          <h3 className="text-sm font-bold line-clamp-1">{product.name}</h3>
          
          <div className="flex items-center justify-center gap-2">
            {discountedPrice ? (
              <>
                <span className="text-sm font-bold text-primary">
                  ₪{discountedPrice.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  ₪{product.price}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-primary">₪{product.price}</span>
            )}
          </div>

          <CartButton onClick={(e) => e.stopPropagation()} />
        </div>
      </Card>
    );
  };

  return (
    <section className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          {category.image_url && (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          {category.name}
        </h2>
        {showViewAll && (
          <Link to={`/category/${category.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              عرض الكل
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Products Row */}
      {isScrollable ? (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.slice(0, productsPerRow).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategoryRowsLayout;
