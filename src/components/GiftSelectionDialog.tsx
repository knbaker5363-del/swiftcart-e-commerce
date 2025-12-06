import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gift, Check } from 'lucide-react';

interface GiftProduct {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
}

interface GiftSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftProducts: GiftProduct[];
  minimumAmount: number;
  onSelectGift: (product: GiftProduct) => void;
  onSkip: () => void;
}

export const GiftSelectionDialog = ({
  open,
  onOpenChange,
  giftProducts,
  minimumAmount,
  onSelectGift,
  onSkip,
}: GiftSelectionDialogProps) => {
  const [selectedGift, setSelectedGift] = useState<GiftProduct | null>(null);

  const handleConfirm = () => {
    if (selectedGift) {
      onSelectGift(selectedGift);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">🎁 مبروك! لديك هدية</DialogTitle>
          <DialogDescription className="text-lg">
            لقد وصل مبلغ مشترياتك إلى {minimumAmount} ₪ - اختر هديتك المجانية!
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {giftProducts.map((product) => (
            <Card
              key={product.id}
              onClick={() => setSelectedGift(product)}
              className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedGift?.id === product.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                    <Gift className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {selectedGift?.id === product.id && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-sm text-center line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground text-center mt-1">
                قيمة: {product.price} ₪
              </p>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleConfirm}
            disabled={!selectedGift}
            className="flex-1"
          >
            <Gift className="ml-2 h-4 w-4" />
            اختيار الهدية
          </Button>
          <Button variant="outline" onClick={onSkip} className="flex-1">
            تخطي
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
