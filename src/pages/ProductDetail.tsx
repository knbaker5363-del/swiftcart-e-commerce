import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
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
                <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                <p className="text-muted-foreground">{product.categories?.name}</p>
                <p className="text-3xl font-bold text-primary mt-4">
                  {product.price.toFixed(2)} ر.س
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
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                    <div className="flex flex-wrap gap-2">
                      {options.sizes.map((size: string) => (
                        <div key={size}>
                          <RadioGroupItem
                            value={size}
                            id={`size-${size}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`size-${size}`}
                            className="flex items-center justify-center px-4 py-2 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground hover:border-primary/50"
                          >
                            {size}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Color Options */}
              {options?.colors && Array.isArray(options.colors) && options.colors.length > 0 && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">اللون</Label>
                  <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                    <div className="flex flex-wrap gap-2">
                      {options.colors.map((color: string) => (
                        <div key={color}>
                          <RadioGroupItem
                            value={color}
                            id={`color-${color}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`color-${color}`}
                            className="flex items-center justify-center px-4 py-2 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground hover:border-primary/50"
                          >
                            {color}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
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