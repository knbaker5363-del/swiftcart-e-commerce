import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles, PartyPopper } from 'lucide-react';
import { GiftIcon, GiftIconStyleType } from '@/components/ui/gift-icon';
import { useSettings } from '@/contexts/SettingsContext';
import { HiSparkles } from 'react-icons/hi2';
import { PiConfettiFill, PiStarFourFill } from 'react-icons/pi';

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
  const { settings } = useSettings();
  const giftIconStyle = ((settings as any)?.gift_icon_style || 'pink-gold') as GiftIconStyleType;

  const handleConfirm = () => {
    if (selectedGift) {
      onSelectGift(selectedGift);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0" dir="rtl">
        {/* Animated Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-4 animate-bounce">
              <HiSparkles className="h-6 w-6 text-primary-foreground/50" />
            </div>
            <div className="absolute top-8 right-8 animate-bounce" style={{ animationDelay: '0.1s' }}>
              <PiConfettiFill className="h-8 w-8 text-primary-foreground/40" />
            </div>
            <div className="absolute bottom-4 left-1/4 animate-pulse">
              <GiftIcon size="sm" style={giftIconStyle} animated={false} glowColor="transparent" />
            </div>
            <div className="absolute bottom-6 right-1/3 animate-bounce" style={{ animationDelay: '0.2s' }}>
              <PiStarFourFill className="h-5 w-5 text-primary-foreground/40" />
            </div>
            <div className="absolute top-1/2 left-8 animate-pulse" style={{ animationDelay: '0.3s' }}>
              <Sparkles className="h-4 w-4 text-primary-foreground/30" />
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="mx-auto mb-4 flex items-center justify-center animate-scale-in">
              <GiftIcon size="lg" style={giftIconStyle} animated={true} />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-3xl font-bold text-primary-foreground flex items-center justify-center gap-3">
                <HiSparkles className="h-7 w-7 text-yellow-300" />
                مبروك!
                <HiSparkles className="h-7 w-7 text-yellow-300" />
              </DialogTitle>
              <DialogDescription className="text-lg text-primary-foreground/90">
                لقد حصلت على هدية مجانية!
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 inline-block bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-primary-foreground font-semibold">
                طلبك وصل إلى {minimumAmount} ₪
              </span>
            </div>
          </div>
        </div>

        {/* Gift Selection Area */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-center mb-4 text-foreground flex items-center justify-center gap-2">
            <GiftIcon size="sm" style={giftIconStyle} animated={false} glowColor="transparent" />
            اختر هديتك المفضلة
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {giftProducts.map((product, index) => (
              <Card
                key={product.id}
                onClick={() => setSelectedGift(product)}
                className={`group p-4 cursor-pointer transition-all duration-300 hover:shadow-lg animate-fade-in ${
                  selectedGift?.id === product.id
                    ? 'ring-2 ring-primary bg-primary/10 scale-105'
                    : 'hover:bg-muted/50 hover:scale-102'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  {product.image_url ? (
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center">
                      <GiftIcon size="md" style={giftIconStyle} animated={false} />
                    </div>
                  )}
                  
                  {/* Selection indicator */}
                  {selectedGift?.id === product.id && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                      <Check className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                  
                  {/* Free badge */}
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                    <HiSparkles className="h-3 w-3" />
                    مجاني!
                  </div>
                </div>
                
                <div className="mt-3 text-center space-y-1">
                  <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    قيمتها: <span className="line-through">{product.price} ₪</span>
                  </p>
                  <p className="text-primary font-bold text-lg flex items-center justify-center gap-1">
                    مجاناً
                    <GiftIcon size="sm" style={giftIconStyle} animated={false} glowColor="transparent" className="w-5 h-5" />
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <Button
              onClick={handleConfirm}
              disabled={!selectedGift}
              size="lg"
              className="flex-1 gap-2 text-lg py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              <GiftIcon size="sm" style={giftIconStyle} animated={false} glowColor="transparent" className="w-5 h-5" />
              أريد هذه الهدية
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={onSkip} 
              className="px-6"
            >
              لا شكراً
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};