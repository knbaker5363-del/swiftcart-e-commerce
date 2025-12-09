import { useState } from 'react';
import { Gift, Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GiftProduct {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
}

interface GiftProductsDisplayProps {
  products: GiftProduct[];
  selectedGift: GiftProduct | null;
  onSelectGift: (gift: GiftProduct) => void;
  minimumAmount: number;
  currentAmount: number;
}

export const GiftProductsDisplay = ({
  products,
  selectedGift,
  onSelectGift,
  minimumAmount,
  currentAmount,
}: GiftProductsDisplayProps) => {
  const isEligible = currentAmount >= minimumAmount;
  
  if (!isEligible || products.length === 0) return null;

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