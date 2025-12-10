import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Grid3X3, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import CategoriesSidebar from './CategoriesSidebar';

interface PublicHeaderProps {
  onCartOpen: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  onCartOpen
}) => {
  const {
    items
  } = useCart();
  const {
    favorites
  } = useFavorites();
  const {
    settings
  } = useSettings();
  const {
    user,
    isAdmin,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = favorites.length;
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  
  // Admin button visibility is now based on actual auth state, not localStorage
  // This prevents revealing admin panel existence to non-admins
  const showAdminButton = user !== null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const headerLogoPosition = (settings as any)?.header_logo_position || 'right';
  const logoShape = (settings as any)?.logo_shape || 'circle';
  const logoShapeClass = logoShape === 'circle' ? 'rounded-full' : 'rounded-lg';
  const showHeaderLogo = (settings as any)?.show_header_logo !== false;
  const showHeaderStoreName = (settings as any)?.show_header_store_name !== false;
  const storeNameImageUrl = (settings as any)?.store_name_image_url;

  // Logo component for header
  const HeaderLogo = () => {
    // If both are hidden, return null
    if (!showHeaderLogo && !showHeaderStoreName) return null;
    
    return (
      <Link to="/" className="flex items-center gap-3 shrink-0">
        {/* Logo icon - only show if showHeaderLogo is true */}
        {showHeaderLogo && (
          <>
            {settings?.logo_url ? (
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${logoShapeClass} overflow-hidden border-2 border-primary/20 shrink-0`}>
                <img src={settings.logo_url} alt={settings.store_name || 'شعار المتجر'} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${logoShapeClass} bg-primary flex items-center justify-center shrink-0`}>
                <span className="text-base sm:text-xl font-bold text-primary-foreground">
                  {settings?.store_name?.charAt(0) || 'م'}
                </span>
              </div>
            )}
          </>
        )}
        {/* Store name/image - only show if showHeaderStoreName is true */}
        {showHeaderStoreName && (
          <>
            {storeNameImageUrl ? (
              <img 
                src={storeNameImageUrl} 
                alt={settings?.store_name || 'اسم المتجر'} 
                className="max-h-12 sm:max-h-16 object-contain"
              />
            ) : (
              <h1 className={`text-lg sm:text-2xl font-bold truncate max-w-[140px] sm:max-w-none ${settings?.store_name_black ? 'text-foreground' : 'bg-gradient-primary bg-clip-text text-transparent'}`}>
                {settings?.store_name || 'متجري'}
              </h1>
            )}
          </>
        )}
      </Link>
    );
  };

  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left side - Categories button (mobile/tablet only) */}
        <div className="flex items-center gap-1 lg:hidden">
          <Sheet open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 bg-background">
              <SheetHeader className="p-4 pb-3 border-b">
                <SheetTitle className="text-right pr-8">القائمة</SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100vh-80px)] overflow-y-auto">
                <CategoriesSidebar onItemClick={() => setCategoriesOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo - positioned based on settings */}
        <div className={`flex-1 flex ${headerLogoPosition === 'center' ? 'justify-center' : headerLogoPosition === 'left' ? 'justify-end' : 'justify-start'}`}>
          <HeaderLogo />
        </div>
        
        {/* Right side - Cart, Favorites, and Admin button */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Admin/User button - Only show when user is logged in */}
          {showAdminButton && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border">
                <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && <DropdownMenuItem onClick={() => navigate('/admin/products')}>
                    لوحة الإدارة
                  </DropdownMenuItem>}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Link to="/favorites">
            <Button variant="ghost" size="icon" className="relative overflow-visible">
              <Heart className="h-6 w-6" />
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -left-2 min-w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center z-10">
                  {favoritesCount}
                </span>
              )}
            </Button>
          </Link>
          <Button variant="outline" size="icon" className="relative overflow-visible" onClick={onCartOpen}>
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -left-2 min-w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center z-10">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>;
};