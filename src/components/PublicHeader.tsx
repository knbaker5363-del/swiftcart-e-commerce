import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface PublicHeaderProps {
  onCartOpen: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ onCartOpen }) => {
  const { items } = useCart();
  const { favorites } = useFavorites();
  const { settings } = useSettings();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = favorites.length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const headerLogoPosition = (settings as any)?.header_logo_position || 'right';
  const logoShape = (settings as any)?.logo_shape || 'circle';
  const logoShapeClass = logoShape === 'circle' ? 'rounded-full' : 'rounded-lg';

  // Logo component for header
  const HeaderLogo = () => (
    <Link 
      to="/" 
      className={`flex items-center gap-2 shrink-0 ${headerLogoPosition === 'center' ? 'absolute left-1/2 -translate-x-1/2' : 'me-auto'}`}
    >
      {settings?.logo_url ? (
        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${logoShapeClass} overflow-hidden border-2 border-primary/20 shrink-0`}>
          <img
            src={settings.logo_url}
            alt={settings.store_name || 'شعار المتجر'}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${logoShapeClass} bg-primary flex items-center justify-center shrink-0`}>
          <span className="text-sm sm:text-lg font-bold text-primary-foreground">
            {settings?.store_name?.charAt(0) || 'م'}
          </span>
        </div>
      )}
      <h1 
        className={`text-base sm:text-xl font-bold truncate max-w-[120px] sm:max-w-none ${
          settings?.store_name_black 
            ? 'text-foreground' 
            : 'bg-gradient-primary bg-clip-text text-transparent'
        }`}
      >
        {settings?.store_name || 'متجري'}
      </h1>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between relative">
        {/* Logo - positioned based on settings */}
        {headerLogoPosition === 'right' && <HeaderLogo />}
        {headerLogoPosition === 'center' && <HeaderLogo />}
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/favorites">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <Badge
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600"
                >
                  {favoritesCount}
                </Badge>
              )}
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

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin/products')}>
                    لوحة الإدارة
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};