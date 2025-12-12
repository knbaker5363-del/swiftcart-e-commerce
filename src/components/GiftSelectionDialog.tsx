import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles, Shuffle } from 'lucide-react';
import { GiftIcon, GiftIconStyleType } from '@/components/ui/gift-icon';
import { useSettings } from '@/contexts/SettingsContext';
import { HiSparkles } from 'react-icons/hi2';
import { PiConfettiFill, PiStarFourFill } from 'react-icons/pi';
import { weightedRandomSelection } from '@/lib/weightedRandom';

interface GiftProduct {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  weight?: number;
}

interface GiftSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftProducts: GiftProduct[];
  minimumAmount: number;
  onSelectGift: (product: GiftProduct) => void;
  onSkip: () => void;
  giftType?: 'choice' | 'random';
}

export const GiftSelectionDialog = ({
  open,
  onOpenChange,
  giftProducts,
  minimumAmount,
  onSelectGift,
  onSkip,
  giftType = 'choice',
}: GiftSelectionDialogProps) => {
  const [selectedGift, setSelectedGift] = useState<GiftProduct | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [randomResult, setRandomResult] = useState<GiftProduct | null>(null);
  const { settings } = useSettings();
  const giftIconStyle = ((settings as any)?.gift_icon_style || 'pink-gold') as GiftIconStyleType;

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedGift(null);
      setRandomResult(null);
      setIsSpinning(false);
    }
  }, [open]);

  // Auto-spin for random type
  useEffect(() => {
    if (open && giftType === 'random' && !randomResult && !isSpinning) {
      startRandomSelection();
    }
  }, [open, giftType]);

  const startRandomSelection = () => {
    setIsSpinning(true);
    
    // Simulate spinning animation
    let iterations = 0;
    const maxIterations = 15;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * giftProducts.length);
      setSelectedGift(giftProducts[randomIndex]);
      iterations++;
      
      if (iterations >= maxIterations) {
        clearInterval(interval);
        // Final selection using weighted random
        const productsWithWeight = giftProducts.map(p => ({
          ...p,
          weight: p.weight || 100
        }));
        const finalGift = weightedRandomSelection(productsWithWeight);
        setSelectedGift(finalGift);
        setRandomResult(finalGift);
        setIsSpinning(false);
      }
    }, 150);
  };

  const handleConfirm = () => {
    const giftToSelect = giftType === 'random' ? randomResult : selectedGift;
    if (giftToSelect) {
      onSelectGift(giftToSelect);
    }
    onOpenChange(false);
  };

  const isRandomMode = giftType === 'random';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0" dir="rtl">
        {/* Animated Header */}
        <div className={`relative p-8 text-center overflow-hidden ${
          isRandomMode 
            ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' 
            : 'bg-gradient-to-br from-primary via-primary/90 to-accent'
        }`}>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-4 animate-bounce">
              <HiSparkles className="h-6 w-6 text-white/50" />
            </div>
            <div className="absolute top-8 right-8 animate-bounce" style={{ animationDelay: '0.1s' }}>
              <PiConfettiFill className="h-8 w-8 text-white/40" />
            </div>
            <div className="absolute bottom-4 left-1/4 animate-pulse">
              <GiftIcon size="sm" style={giftIconStyle} animated={false} glowColor="transparent" />
            </div>
            <div className="absolute bottom-6 right-1/3 animate-bounce" style={{ animationDelay: '0.2s' }}>
              <PiStarFourFill className="h-5 w-5 text-white/40" />
            </div>
            {isRandomMode && (
              <div className="absolute top-1/2 left-8 animate-spin" style={{ animationDuration: '3s' }}>
                <Shuffle className="h-6 w-6 text-white/30" />
              </div>
            )}
          </div>
          
          <div className="relative z-10">
            <div className={`mx-auto mb-4 flex items-center justify-center ${isSpinning ? 'animate-bounce' : 'animate-scale-in'}`}>
              {isRandomMode ? (
                <div className="relative">
                  <GiftIcon size="lg" style={giftIconStyle} animated={true} />
                  {isSpinning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shuffle className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <GiftIcon size="lg" style={giftIconStyle} animated={true} />
              )}
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                <HiSparkles className="h-7 w-7 text-yellow-300" />
                {isRandomMode ? (isSpinning ? 'جاري الاختيار...' : 'مبروك!') : 'مبروك!'}
                <HiSparkles className="h-7 w-7 text-yellow-300" />
              </DialogTitle>
              <DialogDescription className="text-lg text-white/90">
                {isRandomMode 
                  ? (isSpinning ? 'عجلة الحظ تدور...' : 'تم اختيار هديتك العشوائية!')
                  : 'لقد حصلت على هدية مجانية!'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white font-semibold">
                طلبك وصل إلى {minimumAmount} ₪
              </span>
            </div>
          </div>
        </div>

        {/* Gift Selection/Display Area */}
        <div className="p-6">
          {isRandomMode ? (
            // Random mode - show result or spinning
            <div className="text-center">
              {isSpinning ? (
                <div className="grid grid-cols-3 gap-3 opacity-50">
                  {giftProducts.slice(0, 6).map((product, index) => (
                    <Card
                      key={product.id}
                      className={`p-3 transition-all duration-100 ${
                        selectedGift?.id === product.id ? 'ring-2 ring-yellow-400 scale-105 bg-yellow-50' : ''
                      }`}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                          <GiftIcon size="md" style={giftIconStyle} animated={false} />
                        </div>
                      )}
                      <p className="mt-2 text-sm font-medium line-clamp-1">{product.name}</p>
                    </Card>
                  ))}
                </div>
              ) : randomResult ? (
                <div className="animate-scale-in">
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    هديتك هي
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                  </h3>
                  <Card className="max-w-xs mx-auto p-4 ring-2 ring-primary bg-primary/10">
                    {randomResult.image_url ? (
                      <img
                        src={randomResult.image_url}
                        alt={randomResult.name}
                        className="w-full aspect-square object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-muted rounded-xl flex items-center justify-center">
                        <GiftIcon size="lg" style={giftIconStyle} animated={true} />
                      </div>
                    )}
                    <div className="mt-4 text-center">
                      <h4 className="font-bold text-lg">{randomResult.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        قيمتها: <span className="line-through">{randomResult.price} ₪</span>
                      </p>
                      <p className="text-primary font-bold text-xl mt-1">مجاناً! 🎉</p>
                    </div>
                  </Card>
                </div>
              ) : null}
            </div>
          ) : (
            // Choice mode - show all products to select
            <>
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
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <Button
              onClick={handleConfirm}
              disabled={isRandomMode ? (isSpinning || !randomResult) : !selectedGift}
              size="lg"
              className={`flex-1 gap-2 text-lg py-6 transition-opacity ${
                isRandomMode 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90' 
                  : 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
              }`}
            >
              <GiftIcon size="sm" style={giftIconStyle} animated={false} glowColor="transparent" className="w-5 h-5" />
              {isRandomMode ? 'تأكيد الهدية' : 'أريد هذه الهدية'}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={onSkip} 
              className="px-6"
              disabled={isSpinning}
            >
              لا شكراً
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
