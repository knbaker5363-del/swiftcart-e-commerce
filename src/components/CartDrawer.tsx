import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from './ui/sheet';
import { Button } from './ui/button';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onOpenChange }) => {
  const { items, updateQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col" dir="rtl">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="text-2xl">سلة التسوق</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-6 min-h-0">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              سلة التسوق فارغة
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-lg border bg-card shadow-card"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      {item.selected_options.size && (
                        <span>المقاس: {item.selected_options.size}</span>
                      )}
                      {item.selected_options.color && (
                        <span className="mr-2">
                          اللون: {item.selected_options.color}
                        </span>
                      )}
                    </div>
                    <p className="text-primary font-semibold mt-1">
                      {item.price.toFixed(2)} ₪
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 mr-auto text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <SheetFooter className="border-t pt-4 flex-shrink-0">
            <div className="w-full space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>المجموع:</span>
                <span className="text-primary">{total.toFixed(2)} ₪</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
              >
                إتمام الطلب
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};