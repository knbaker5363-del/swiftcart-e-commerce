import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ShoppingCart, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const getColorValue = (color: string) => {
    const colorMap: Record<string, string> = {
      'أبيض': '#FFFFFF',
      'أسود': '#000000',
      'أحمر': '#FF0000',
      'أزرق': '#0000FF',
      'أخضر': '#00FF00',
      'أصفر': '#FFFF00',
      'برتقالي': '#FFA500',
      'بني': '#8B4513',
      'رمادي': '#808080',
      'زهري': '#FFC0CB',
      'بنفسجي': '#800080',
      'كحلي': '#000080',
      'أزرق غامق': '#00008B',
    };
    return color.startsWith('#') ? color : (colorMap[color] || color);
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Size option type for new pricing structure
  interface SizeOption {
    name: string;
    price_type: 'base' | 'fixed' | 'addition';
    price_value: number | null;
  }

  interface AddOnOption {
    name: string;
    price: number;
  }

  const rawOptions = product?.options as { sizes?: (string | SizeOption)[], colors?: string[], addons?: AddOnOption[] } | null;
  
  // Normalize sizes to always be SizeOption objects
  const normalizedSizes: SizeOption[] = (rawOptions?.sizes || []).map((size) => {
    if (typeof size === 'string') {
      return { name: size, price_type: 'base' as const, price_value: null };
    }
    return size as SizeOption;
  });
  
  const options = {
    sizes: normalizedSizes,
    colors: rawOptions?.colors || [],
    addons: rawOptions?.addons || []
  };

  const toggleAddon = (addonName: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonName) 
        ? prev.filter(a => a !== addonName)
        : [...prev, addonName]
    );
  };

  // Calculate addons total
  const getAddonsTotal = () => {
    return selectedAddons.reduce((total, addonName) => {
      const addon = options.addons.find(a => a.name === addonName);
      return total + (addon?.price || 0);
    }, 0);
  };

  // Calculate price based on selected size and addons
  const calculatePrice = () => {
    if (!product) return 0;
    const basePrice = product.price;
    const hasDiscount = (product.discount_percentage ?? 0) > 0;
    const addonsTotal = getAddonsTotal();
    
    if (selectedSize && options.sizes.length > 0) {
      const sizeOption = options.sizes.find(s => s.name === selectedSize);
      if (sizeOption) {
        let sizePrice = basePrice;
        if (sizeOption.price_type === 'fixed' && sizeOption.price_value !== null) {
          sizePrice = sizeOption.price_value;
        } else if (sizeOption.price_type === 'addition' && sizeOption.price_value !== null) {
          sizePrice = basePrice + sizeOption.price_value;
        }
        const discountedPrice = hasDiscount ? sizePrice * (1 - (product.discount_percentage ?? 0) / 100) : sizePrice;
        return discountedPrice + addonsTotal;
      }
    }
    
    const discountedBase = hasDiscount ? basePrice * (1 - (product.discount_percentage ?? 0) / 100) : basePrice;
    return discountedBase + addonsTotal;
  };

  const getOriginalPrice = () => {
    if (!product) return 0;
    const basePrice = product.price;
    if (selectedSize && options.sizes.length > 0) {
      const sizeOption = options.sizes.find(s => s.name === selectedSize);
      if (sizeOption) {
        if (sizeOption.price_type === 'fixed' && sizeOption.price_value !== null) {
          return sizeOption.price_value;
        } else if (sizeOption.price_type === 'addition' && sizeOption.price_value !== null) {
          return basePrice + sizeOption.price_value;
        }
      }
    }
    return basePrice;
  };

  const currentPrice = calculatePrice();
  const originalPrice = getOriginalPrice();
  const hasDiscount = product ? (product.discount_percentage ?? 0) > 0 : false;

  const handleAddToCart = () => {
    if (!product) return;
    
    if (options.sizes.length > 0 && !selectedSize) {
      toast({
        title: 'يرجى اختيار المقاس',
        variant: 'destructive',
      });
      return;
    }
    
    if (options.colors.length > 0 && !selectedColor) {
      toast({
        title: 'يرجى اختيار اللون',
        variant: 'destructive',
      });
      return;
    }

    const selectedOptions: Record<string, string | string[]> = {};
    if (selectedSize) selectedOptions.size = selectedSize;
    if (selectedColor) selectedOptions.color = selectedColor;
    if (selectedAddons.length > 0) selectedOptions.addons = selectedAddons;

    addItem({
      id: '',
      product_id: product.id,
      name: product.name,
      price: currentPrice,
      image_url: product.image_url,
      quantity,
      selected_options: selectedOptions,
    });

    toast({
      title: 'تم إضافة المنتج إلى السلة',
    });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          رجوع
        </Button>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image Carousel */}
            <div className="sticky top-24 h-fit">
              <div className="relative overflow-hidden rounded-lg shadow-card bg-muted aspect-square">
                {product.image_url ? (
                  <ProductImageCarousel
                    mainImage={product.image_url}
                    additionalImages={product.additional_images as string[] || []}
                    productName={product.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد صورة</p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-4xl font-bold flex-1">{product.name}</h1>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full ${
                      isFavorite(product.id)
                        ? 'bg-red-500 hover:bg-red-600 border-red-500'
                        : ''
                    }`}
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        isFavorite(product.id)
                          ? 'text-white fill-white'
                          : ''
                      }`}
                    />
                  </Button>
                </div>
                <p className="text-muted-foreground">{product.categories?.name}</p>
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <span className="text-3xl font-bold text-primary">
                    {currentPrice.toFixed(2)} ₪
                  </span>
                  {(hasDiscount || originalPrice !== currentPrice) && originalPrice !== currentPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {originalPrice.toFixed(2)} ₪
                    </span>
                  )}
                </div>
              </div>

              {product.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">الوصف</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Size Options */}
              {options.sizes.length > 0 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">المقاس</Label>
                  <ToggleGroup 
                    type="single" 
                    value={selectedSize} 
                    onValueChange={setSelectedSize}
                    className="justify-start flex-wrap"
                  >
                    {options.sizes.map((size, index) => {
                      const sizeName = size.name;
                      const hasPricing = size.price_type !== 'base' && size.price_value !== null;
                      return (
                        <ToggleGroupItem
                          key={`${sizeName}-${index}`}
                          value={sizeName}
                          aria-label={`Select size ${sizeName}`}
                          className="px-6 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex flex-col h-auto"
                        >
                          <span>{sizeName}</span>
                          {hasPricing && (
                            <span className="text-xs opacity-80">
                              {size.price_type === 'fixed' ? `${size.price_value} ₪` : `+${size.price_value} ₪`}
                            </span>
                          )}
                        </ToggleGroupItem>
                      );
                    })}
                  </ToggleGroup>
                </div>
              )}

              {/* Color Options */}
              {options.colors.length > 0 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">اللون</Label>
                  <ToggleGroup 
                    type="single" 
                    value={selectedColor} 
                    onValueChange={setSelectedColor}
                    className="justify-start gap-3"
                  >
                    {options.colors.map((color: string) => (
                      <ToggleGroupItem
                        key={color}
                        value={color}
                        aria-label={`Select color ${color}`}
                        className="px-4 py-2 data-[state=on]:ring-2 data-[state=on]:ring-primary data-[state=on]:ring-offset-2"
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-6 h-6 rounded-full border-2 border-border" 
                            style={{ backgroundColor: getColorValue(color) }}
                          />
                          <span className="text-sm font-medium">{color}</span>
                        </div>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              )}

              {/* Add-ons Options */}
              {options.addons.length > 0 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">إضافات اختيارية</Label>
                  <div className="flex flex-wrap gap-2">
                    {options.addons.map((addon, index) => (
                      <Button
                        key={`${addon.name}-${index}`}
                        variant={selectedAddons.includes(addon.name) ? "default" : "outline"}
                        onClick={() => toggleAddon(addon.name)}
                        className="flex items-center gap-2"
                      >
                        <span>{addon.name}</span>
                        <span className="text-xs opacity-80">+{addon.price} ₪</span>
                      </Button>
                    ))}
                  </div>
                  {selectedAddons.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      الإضافات المختارة: {selectedAddons.join('، ')} (+{getAddonsTotal()} ₪)
                    </p>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">الكمية</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-primary shadow-button text-lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="ml-2 h-5 w-5" />
                أضف إلى السلة
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">المنتج غير موجود</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;