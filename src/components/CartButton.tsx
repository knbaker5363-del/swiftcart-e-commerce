import { ShoppingCart, ShoppingBag, Package, Briefcase, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';

interface CartButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

// Cart icon mapping
const cartIcons = {
  cart: ShoppingCart,
  bag: ShoppingBag,
  package: Package,
  briefcase: Briefcase,
  gift: Gift,
};

const CartButton = ({ onClick, className = '', size = 'sm', variant = 'secondary' }: CartButtonProps) => {
  const { settings } = useSettings();
  
  const iconStyle = (settings as any)?.cart_icon_style || 'cart';
  const buttonText = (settings as any)?.cart_button_text || '';
  
  const Icon = cartIcons[iconStyle as keyof typeof cartIcons] || ShoppingCart;

  return (
    <Button
      onClick={onClick}
      className={`gap-1.5 text-xs px-3 py-1.5 h-auto ${className}`}
      size={size}
      variant={variant}
    >
      <Icon className="h-3.5 w-3.5" />
      {buttonText && <span>{buttonText}</span>}
    </Button>
  );
};

export default CartButton;