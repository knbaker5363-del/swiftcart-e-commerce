import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import { ShoppingCart, ShoppingBag, Package, Briefcase, Gift, Heart, AlertCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { ProductShareButtons } from '@/components/ProductShareButtons';
import { ProductSchemaMarkup } from '@/components/ProductSchemaMarkup';
import { Badge } from '@/components/ui/badge';

// Cart icon mapping
const cartIcons = {
  cart: ShoppingCart,
  bag: ShoppingBag,
  package: Package,
  briefcase: Briefcase,
  gift: Gift,
};
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { trackProductView } from '@/hooks/useAnalytics';

interface ProductQuickViewProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductQuickView = ({ product, open, onOpenChange }: ProductQuickViewProps) => {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedCustomVariants, setSelectedCustomVariants] = useState<Record<string, string>>({});

  // Get cart icon and text from settings
  const cartIconStyle = (settings as any)?.cart_icon_style || 'cart';
  const cartButtonText = (settings as any)?.cart_button_text || 'أضف للسلة';
  const CartIcon = cartIcons[cartIconStyle as keyof typeof cartIcons] || ShoppingCart;

  // Track product view when dialog opens
  useEffect(() => {
    if (open && product?.id) {
      trackProductView(product.id);
    }
  }, [open, product?.id]);

  // Return null if product is not provided - AFTER all hooks
  if (!product) return null;

  // Stock management
  const trackStock = product.track_stock || false;
  const stockQuantity = product.stock_quantity ?? null;
  const isOutOfStock = trackStock && stockQuantity !== null && stockQuantity <= 0;
  const isLowStock = trackStock && stockQuantity !== null && stockQuantity > 0 && stockQuantity < 5;
  const showStockToCustomers = (settings as any)?.show_stock_to_customers !== false;

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

  interface CustomVariantOption {
    value: string;
    price_addition: number;
  }

  interface CustomVariant {
    name: string;
    options: CustomVariantOption[];
  }

  const rawOptions = product.options as { sizes?: (string | SizeOption)[], colors?: string[], addons?: AddOnOption[], customVariants?: CustomVariant[] } | null;
  
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
    addons: rawOptions?.addons || [],
    customVariants: rawOptions?.customVariants || []
  };
  
  const hasOptions = options.sizes.length > 0 || options.colors.length > 0 || options.customVariants.length > 0;

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

  // Calculate custom variants total
  const getCustomVariantsTotal = () => {
    return Object.entries(selectedCustomVariants).reduce((total, [variantName, selectedValue]) => {
      const variant = options.customVariants.find(v => v.name === variantName);
      const option = variant?.options.find(o => o.value === selectedValue);
      return total + (option?.price_addition || 0);
    }, 0);
  };

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

  // Calculate price based on selected size and addons
  const calculatePrice = () => {
    const basePrice = product.price;
    const hasDiscount = (product.discount_percentage ?? 0) > 0;
    const addonsTotal = getAddonsTotal();
    const customVariantsTotal = getCustomVariantsTotal();
    
    if (selectedSize && options.sizes.length > 0) {
      const sizeOption = options.sizes.find(s => s.name === selectedSize);
      if (sizeOption) {
        let sizePrice = basePrice;
        if (sizeOption.price_type === 'fixed' && sizeOption.price_value !== null) {
          sizePrice = sizeOption.price_value;
        } else if (sizeOption.price_type === 'addition' && sizeOption.price_value !== null) {
          sizePrice = basePrice + sizeOption.price_value;
        }
        // Apply discount to the calculated size price, then add addons and custom variants (not discounted)
        const discountedPrice = hasDiscount ? sizePrice * (1 - (product.discount_percentage ?? 0) / 100) : sizePrice;
        return discountedPrice + addonsTotal + customVariantsTotal;
      }
    }
    
    // Default to base price with discount, then add addons and custom variants
    const discountedBase = hasDiscount ? basePrice * (1 - (product.discount_percentage ?? 0) / 100) : basePrice;
    return discountedBase + addonsTotal + customVariantsTotal;
  };

  const hasDiscount = (product.discount_percentage ?? 0) > 0;
  const currentPrice = calculatePrice();
  
  // Calculate original price (before discount) for display
  const getOriginalPrice = () => {
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
  
  const originalPrice = getOriginalPrice();

  const additionalImages = product.additional_images as string[] | null;

  const handleAddToCart = () => {
    // التحقق من اختيار الخيارات المطلوبة
    if (hasOptions) {
      if (options.sizes.length > 0 && !selectedSize) {
        toast({
          title: "يرجى اختيار المقاس",
          description: "يجب اختيار المقاس قبل إضافة المنتج للسلة",
          variant: "destructive",
        });
        return;
      }
      if (options.colors.length > 0 && !selectedColor) {
        toast({
          title: "يرجى اختيار اللون",
          description: "يجب اختيار اللون قبل إضافة المنتج للسلة",
          variant: "destructive",
        });
        return;
      }
    }

    const selectedOptions: Record<string, string | string[] | Record<string, string>> = {};
    if (selectedSize) selectedOptions.size = selectedSize;
    if (selectedColor) selectedOptions.color = selectedColor;
    if (selectedAddons.length > 0) selectedOptions.addons = selectedAddons;
    if (Object.keys(selectedCustomVariants).length > 0) selectedOptions.customVariants = selectedCustomVariants;

    addItem({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: currentPrice,
      image_url: product.image_url,
      quantity: 1,
      selected_options: selectedOptions,
    });

    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تم إضافة ${product.name} إلى سلة التسوق`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <p className="sr-only">تفاصيل المنتج</p>
        </DialogHeader>
        
        {/* Schema.org markup */}
        <ProductSchemaMarkup product={product} />

        <div className="grid md:grid-cols-2 gap-6">
          {/* صور المنتج */}
          <div className="relative">
            <ProductImageCarousel 
              mainImage={product.image_url || '/placeholder.svg'}
              additionalImages={additionalImages || []}
              productName={product.name}
            />
            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-sm font-bold">
                {product.discount_percentage}% خصم
              </div>
            )}
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
            >
              <Heart
                className={`h-6 w-6 ${
                  isFavorite(product.id)
                    ? 'fill-destructive text-destructive'
                    : 'text-foreground'
                }`}
              />
            </button>
          </div>

          {/* تفاصيل المنتج */}
          <div className="space-y-4">
            {/* الوصف - أولاً في بوكس */}
            {product.description && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">الوصف</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
            )}

            {/* السعر */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold text-primary">
                {currentPrice.toFixed(2)} ₪
              </span>
              {(hasDiscount || (selectedSize && currentPrice !== originalPrice)) && originalPrice !== currentPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {originalPrice.toFixed(2)} ₪
                </span>
              )}
              {selectedSize && options.sizes.length > 0 && (
                <span className="text-sm bg-muted px-2 py-1 rounded">
                  مقاس: {selectedSize}
                </span>
              )}
            </div>

            {/* المقاسات */}
            {options.sizes.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">المقاس *</Label>
                <div className="flex flex-wrap gap-2">
                  {options.sizes.map((size, index) => {
                    const sizeName = size.name;
                    const hasPricing = size.price_type !== 'base' && size.price_value !== null;
                    return (
                      <Button
                        key={`${sizeName}-${index}`}
                        variant={selectedSize === sizeName ? "default" : "outline"}
                        onClick={() => setSelectedSize(sizeName)}
                        className="min-w-[60px] flex flex-col h-auto py-2"
                      >
                        <span>{sizeName}</span>
                        {hasPricing && (
                          <span className="text-xs opacity-80">
                            {size.price_type === 'fixed' ? `${size.price_value} ₪` : `+${size.price_value} ₪`}
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* الألوان */}
            {options?.colors && options.colors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">اللون *</Label>
                <div className="flex flex-wrap gap-3">
                  {options.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-4 transition-all ${
                        selectedColor === color
                          ? 'border-primary scale-110'
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ backgroundColor: getColorValue(color) }}
                      title={color}
                    />
                  ))}
                </div>
                {selectedColor && (
                  <p className="text-sm text-muted-foreground">
                    اللون المختار: {selectedColor}
                  </p>
                )}
              </div>
            )}

            {/* الإضافات */}
            {options.addons && options.addons.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">إضافات اختيارية</Label>
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
                  <p className="text-sm text-muted-foreground">
                    الإضافات المختارة: {selectedAddons.join('، ')} (+{getAddonsTotal()} ₪)
                  </p>
                )}
              </div>
            )}

            {/* المتغيرات الإضافية */}
            {options.customVariants && options.customVariants.length > 0 && (
              <div className="space-y-4">
                {options.customVariants.map((variant, variantIdx) => (
                  <div key={`${variant.name}-${variantIdx}`} className="space-y-2">
                    <Label className="text-base font-semibold">{variant.name}</Label>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((opt, optIdx) => (
                        <Button
                          key={`${opt.value}-${optIdx}`}
                          variant={selectedCustomVariants[variant.name] === opt.value ? "default" : "outline"}
                          onClick={() => setSelectedCustomVariants(prev => ({
                            ...prev,
                            [variant.name]: opt.value
                          }))}
                          className="flex items-center gap-2"
                        >
                          <span>{opt.value}</span>
                          {opt.price_addition > 0 && (
                            <span className="text-xs opacity-80">+{opt.price_addition} ₪</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock Status */}
            {trackStock && stockQuantity !== null && (
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    نفد من المخزون
                  </Badge>
                ) : isLowStock ? (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-700">
                    <AlertCircle className="h-3 w-3" />
                    {showStockToCustomers ? `متبقي ${stockQuantity} فقط` : 'كمية محدودة'}
                  </Badge>
                ) : showStockToCustomers ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    متوفر ({stockQuantity})
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    متوفر
                  </Badge>
                )}
              </div>
            )}

            {/* أزرار المشاركة */}
            <div className="pt-2 border-t">
              <ProductShareButtons 
                productName={product.name}
                productImage={product.image_url}
              />
            </div>

            {/* زر الإضافة للسلة */}
            <Button 
              onClick={handleAddToCart}
              className="w-full py-6 text-lg gap-2"
              size="lg"
              disabled={isOutOfStock}
            >
              {isOutOfStock ? (
                <>
                  <AlertCircle className="h-5 w-5" />
                  نفد من المخزون
                </>
              ) : (
                <>
                  <CartIcon className="h-5 w-5" />
                  {cartButtonText}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
