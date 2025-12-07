import { useSettings } from '@/contexts/SettingsContext';
import { ShoppingCart, ShoppingBag, Package, Briefcase, Gift, Heart, Menu, Search, MapPin } from 'lucide-react';

const cartIconOptions: Record<string, any> = {
  cart: ShoppingCart,
  bag: ShoppingBag,
  package: Package,
  briefcase: Briefcase,
  gift: Gift,
};

interface StorePreviewProps {
  theme?: string;
  accentColor?: string;
  fontFamily?: string;
  cartIcon?: string;
  cartButtonText?: string;
  logoShape?: string;
  headerLogoPosition?: string;
  animationEffect?: string;
}

const StorePreview = ({ 
  theme,
  accentColor,
  fontFamily,
  cartIcon = 'cart',
  cartButtonText = 'إضافة للسلة',
  logoShape = 'circle',
  headerLogoPosition = 'right',
  animationEffect = 'none'
}: StorePreviewProps) => {
  const { settings } = useSettings();
  
  const CartIcon = cartIconOptions[cartIcon] || ShoppingCart;
  const logoShapeClass = logoShape === 'circle' ? 'rounded-full' : 'rounded-lg';
  
  return (
    <div className="border-2 border-border rounded-xl overflow-hidden bg-background shadow-lg" dir="rtl">
      {/* Mini Header */}
      <div className="bg-card border-b border-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Menu className="h-4 w-4 text-muted-foreground" />
          <div className={`w-8 h-8 ${logoShapeClass} bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold`}>
            {settings?.store_name?.charAt(0) || 'م'}
          </div>
          {headerLogoPosition === 'right' && (
            <span className="text-sm font-bold">{settings?.store_name || 'متجري'}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Heart className="h-4 w-4 text-muted-foreground" />
          <div className="relative">
            <CartIcon className="h-4 w-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-primary-foreground text-[8px] rounded-full flex items-center justify-center">2</span>
          </div>
        </div>
      </div>

      {/* Mini Hero */}
      <div className="p-3 bg-muted/30">
        <div className="flex gap-2">
          <div className="flex-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg h-20 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">بانر المتجر</span>
          </div>
          <div className="w-16 bg-card rounded-lg p-2 flex flex-col items-center justify-center text-center border">
            <div className={`w-8 h-8 ${logoShapeClass} bg-primary/20 mb-1`}></div>
            <span className="text-[8px] font-bold truncate w-full">{settings?.store_name || 'متجري'}</span>
            <div className="flex items-center gap-0.5 text-[6px] text-muted-foreground">
              <MapPin className="h-2 w-2" />
              <span>فلسطين</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Categories */}
      <div className="p-2 flex gap-1 overflow-x-auto">
        {['ملابس', 'إلكترونيات', 'أحذية'].map((cat, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <div className="w-4 h-4 rounded bg-primary/30"></div>
            </div>
            <span className="text-[8px]">{cat}</span>
          </div>
        ))}
      </div>

      {/* Mini Products */}
      <div className="p-2 grid grid-cols-2 gap-2">
        {[1, 2].map((_, i) => (
          <div key={i} className="bg-card rounded-lg overflow-hidden border border-border">
            <div className="h-12 bg-muted flex items-center justify-center">
              <Package className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <div className="p-1.5 text-center">
              <div className="text-[10px] font-bold text-primary">99 ₪</div>
              <div className="text-[8px] truncate">منتج {i + 1}</div>
              <button className="mt-1 w-full py-0.5 bg-primary text-primary-foreground text-[8px] rounded flex items-center justify-center gap-0.5">
                <CartIcon className="h-2 w-2" />
                <span>{cartButtonText}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Animation indicator */}
      {animationEffect && animationEffect !== 'none' && (
        <div className="px-2 pb-2">
          <div className="text-[8px] text-center text-muted-foreground bg-muted/50 rounded p-1">
            🎨 تأثير {animationEffect === 'snow' ? 'الثلج' : animationEffect === 'stars' ? 'النجوم' : animationEffect === 'hearts' ? 'القلوب' : animationEffect === 'confetti' ? 'الاحتفال' : animationEffect === 'bubbles' ? 'الفقاعات' : 'الأوراق'} مفعّل
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePreview;
