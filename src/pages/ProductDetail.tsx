import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
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
  const [quantity, setQuantity] = useState(1);

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

  const options = product?.options as any;

  const handleAddToCart = () => {
    if (!product) return;
    
    if (options?.sizes && !selectedSize) {
      toast({
        title: 'يرجى اختيار المقاس',
        variant: 'destructive',
      });
      return;
    }
    
    if (options?.colors && !selectedColor) {
      toast({
        title: 'يرجى اختيار اللون',
        variant: 'destructive',
      });
      return;
    }

    addItem({
      id: '',
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity,
      selected_options: {
        size: selectedSize,
        color: selectedColor,
      },
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
            {/* Product Image */}
            <div className="relative overflow-hidden rounded-lg shadow-card bg-gradient-card">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">لا توجد صورة</p>
                </div>
              )}
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
                <p className="text-3xl font-bold text-primary mt-4">
                  {product.price.toFixed(2)} ₪
                </p>
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
              {options?.sizes && Array.isArray(options.sizes) && options.sizes.length > 0 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">المقاس</Label>
                  <ToggleGroup 
                    type="single" 
                    value={selectedSize} 
                    onValueChange={setSelectedSize}
                    className="justify-start"
                  >
                    {options.sizes.map((size: string) => (
                      <ToggleGroupItem
                        key={size}
                        value={size}
                        aria-label={`Select size ${size}`}
                        className="px-6 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        {size}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              )}

              {/* Color Options */}
              {options?.colors && Array.isArray(options.colors) && options.colors.length > 0 && (
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
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-medium">{color}</span>
                        </div>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
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