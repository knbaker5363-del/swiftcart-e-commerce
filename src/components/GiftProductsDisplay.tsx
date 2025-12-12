import { useState } from 'react';
import { Gift, Check, Sparkles, Shuffle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { weightedRandomSelection } from '@/lib/weightedRandom';

interface GiftProduct {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  weight?: number;
}

interface GiftProductsDisplayProps {
  products: GiftProduct[];
  selectedGift: GiftProduct | null;
  onSelectGift: (gift: GiftProduct) => void;
  minimumAmount: number;
  currentAmount: number;
  giftType?: 'choice' | 'random';
}

export const GiftProductsDisplay = ({
  products,
  selectedGift,
  onSelectGift,
  minimumAmount,
  currentAmount,
  giftType = 'choice',
}: GiftProductsDisplayProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [tempSelection, setTempSelection] = useState<GiftProduct | null>(null);
  const isEligible = currentAmount >= minimumAmount;
  
  if (!isEligible || products.length === 0) return null;

  const handleRandomSelect = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Animate through products
    let iterations = 0;
    const maxIterations = 12;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * products.length);
      setTempSelection(products[randomIndex]);
      iterations++;
      
      if (iterations >= maxIterations) {
        clearInterval(interval);
        // Final weighted selection
        const productsWithWeight = products.map(p => ({
          ...p,
          weight: p.weight || 100
        }));
        const finalGift = weightedRandomSelection(productsWithWeight);
        if (finalGift) {
          setTempSelection(finalGift);
          onSelectGift(finalGift);
        }
        setIsSpinning(false);
      }
    }, 120);
  };

  // Random gift type - show spin button
  if (giftType === 'random') {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shuffle className="h-5 w-5 text-purple-500" />
          <h3 className="font-bold text-lg">هديتك العشوائية</h3>
          <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
        </div>
        
        {!selectedGift ? (
          <Card className="p-6 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200">
            {isSpinning ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {products.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className={cn(
                        "aspect-square rounded-lg overflow-hidden transition-all duration-100",
                        tempSelection?.id === product.id && "ring-2 ring-yellow-400 scale-105"
                      )}
                    >
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Gift className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-purple-600 font-medium animate-pulse">جاري الاختيار...</p>
              </div>
            ) : (
              <>
                <Gift className="h-12 w-12 mx-auto mb-3 text-purple-500" />
                <p className="text-muted-foreground mb-4">اضغط لاكتشاف هديتك العشوائية!</p>
                <Button 
                  onClick={handleRandomSelect}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90"
                >
                  <Shuffle className="h-4 w-4" />
                  اكتشف هديتك
                </Button>
              </>
            )}
          </Card>
        ) : (
          <Card className="p-4 ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center gap-4">
              {selectedGift.image_url ? (
                <img
                  src={selectedGift.image_url}
                  alt={selectedGift.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <Gift className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-bold text-lg">{selectedGift.name}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="line-through">{selectedGift.price} ₪</span>
                  <span className="text-green-600 font-bold mr-2">مجاناً</span>
                </p>
              </div>
              <Check className="h-6 w-6 text-purple-600" />
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Choice gift type - show all products
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg">اختر هديتك المجانية</h3>
        <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map((product) => {
          const isSelected = selectedGift?.id === product.id;
          
          return (
            <Card
              key={product.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300 overflow-hidden group",
                "hover:shadow-lg hover:-translate-y-1",
                isSelected && "ring-2 ring-primary shadow-lg bg-primary/5"
              )}
              onClick={() => onSelectGift(product)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              
              {/* Product image */}
              <div className="aspect-square bg-muted/50 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gift className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Product name */}
              <div className="p-3 text-center">
                <p className="font-semibold text-sm line-clamp-2">{product.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="line-through">{product.price} ₪</span>
                  <span className="text-green-600 font-bold mr-2">مجاناً</span>
                </p>
              </div>
              
              {/* Hover effect */}
              <div className={cn(
                "absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-300",
                "group-hover:opacity-100",
                isSelected && "opacity-100 bg-primary/5"
              )} />
            </Card>
          );
        })}
      </div>
      
      {selectedGift && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-700 dark:text-green-400">
            تم اختيار: {selectedGift.name}
          </span>
        </div>
      )}
    </div>
  );
};
