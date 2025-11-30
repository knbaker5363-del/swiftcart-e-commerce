import { ShoppingCart, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

interface PublicHeaderProps {
  onCartOpen: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ onCartOpen }) => {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 space-x-reverse">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            متجري
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/admin/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              لوحة الإدارة
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={onCartOpen}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {itemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};