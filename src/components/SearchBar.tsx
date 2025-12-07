import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductQuickView from './ProductQuickView';

interface SearchBarProps {
  className?: string;
}

const SearchBar = ({ className }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search-products', query],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: query.length >= 2,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
    setIsOpen(false);
    setQuery('');
  };

  const getColorValue = (color: string) => {
    const colorMap: Record<string, string> = {
      'أبيض': '#FFFFFF',
      'أسود': '#000000',
      'أحمر': '#FF0000',
      'أزرق': '#0000FF',
      'أخضر': '#00FF00',
    };
    return color.startsWith('#') ? color : colorMap[color] || color;
  };

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ابحث عن منتج..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length >= 2);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pr-10 pl-10 h-12 text-base bg-background border-2 border-border focus:border-primary transition-colors"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-background border-2 border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              جاري البحث...
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="divide-y divide-border">
              {searchResults.map((product) => {
                const options = product.options as { sizes?: string[]; colors?: string[] } | null;
                const hasDiscount = (product.discount_percentage ?? 0) > 0;
                const discountedPrice = hasDiscount 
                  ? product.price * (1 - (product.discount_percentage ?? 0) / 100) 
                  : product.price;

                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-right"
                  >
                    {/* Product Image */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0">
                      <img
                        src={product.image_url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {product.categories?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {hasDiscount ? (
                          <>
                            <span className="text-xs text-muted-foreground line-through">
                              {product.price.toFixed(0)} ₪
                            </span>
                            <span className="text-sm font-bold text-primary">
                              {discountedPrice.toFixed(0)} ₪
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {product.price.toFixed(0)} ₪
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Colors preview */}
                    {options?.colors && options.colors.length > 0 && (
                      <div className="flex gap-1 shrink-0">
                        {options.colors.slice(0, 3).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: getColorValue(color) }}
                          />
                        ))}
                        {options.colors.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{options.colors.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-muted-foreground">
              لا توجد نتائج لـ "{query}"
            </div>
          ) : null}
        </div>
      )}

      {/* Quick View Dialog */}
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

export default SearchBar;
