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
  storeName?: string;
  storeNameBlack?: boolean;
  hideHeaderStoreInfo?: boolean;
  socialMediaPosition?: string;
  showImageBorder?: boolean;
  heroBannerColor?: string;
  cardSize?: string;
  cardsPerRowMobile?: number;
  cardsPerRowDesktop?: number;
  // Category display settings
  categoryDisplayStyle?: 'slider' | 'grid' | 'sidebar';
  categoryShape?: 'square' | 'circle';
  categoryDisplayType?: 'image' | 'icon';
  categorySize?: 'small' | 'large';
}

const StorePreview = ({ 
  theme = 'default',
  accentColor = 'default',
  fontFamily = 'tajawal',
  cartIcon = 'cart',
  cartButtonText = 'إضافة للسلة',
  logoShape = 'circle',
  headerLogoPosition = 'right',
  animationEffect = 'none',
  storeName = 'متجري',
  storeNameBlack = false,
  hideHeaderStoreInfo = false,
  socialMediaPosition = 'hero',
  showImageBorder = true,
  heroBannerColor = '#000000',
  cardSize = 'medium',
  cardsPerRowMobile = 2,
  cardsPerRowDesktop = 4,
  categoryDisplayStyle = 'slider',
  categoryShape = 'square',
  categoryDisplayType = 'image',
  categorySize = 'large',
}: StorePreviewProps) => {
  
  const CartIcon = cartIconOptions[cartIcon] || ShoppingCart;
  const logoShapeClass = logoShape === 'circle' ? 'rounded-full' : 'rounded-lg';
  
  // Font family mapping
  const fontFamilyMap: Record<string, string> = {
    'tajawal': 'Tajawal, sans-serif',
    'cairo': 'Cairo, sans-serif',
    'almarai': 'Almarai, sans-serif',
    'noto-kufi': '"Noto Kufi Arabic", sans-serif',
    'ibm-plex': '"IBM Plex Sans Arabic", sans-serif',
  };

  // Card size classes
  const cardSizeClass = cardSize === 'small' ? 'h-10' : cardSize === 'large' ? 'h-16' : 'h-12';
  const cardTextSize = cardSize === 'small' ? 'text-[6px]' : cardSize === 'large' ? 'text-[10px]' : 'text-[8px]';
  const cardPriceSize = cardSize === 'small' ? 'text-[8px]' : cardSize === 'large' ? 'text-[12px]' : 'text-[10px]';
  
  return (
    <div 
      className="border-2 border-border rounded-xl overflow-hidden bg-background shadow-lg" 
      dir="rtl"
      style={{ fontFamily: fontFamilyMap[fontFamily] || fontFamilyMap['tajawal'] }}
    >
      {/* Mini Header */}
      <div className="bg-card border-b border-border p-3 flex items-center justify-between">
        {/* Left side - Menu */}
        <div className="flex items-center gap-2">
          <Menu className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* Center/Right - Logo based on position */}
        <div className={`flex items-center gap-2 ${headerLogoPosition === 'center' ? 'absolute left-1/2 -translate-x-1/2' : ''}`}>
          <div className={`w-8 h-8 ${logoShapeClass} bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold`}>
            {storeName?.charAt(0) || 'م'}
          </div>
          <span className={`text-sm font-bold ${storeNameBlack ? 'text-black' : ''}`}>
            {storeName || 'متجري'}
          </span>
        </div>
        
        {/* Right side - Icons */}
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Heart className="h-4 w-4 text-muted-foreground" />
          <div className="relative">
            <CartIcon className="h-4 w-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-primary-foreground text-[8px] rounded-full flex items-center justify-center">2</span>
          </div>
        </div>
      </div>

      {/* Mini Hero with banner color */}
      <div className="p-3 bg-muted/30">
        <div className="flex gap-2">
          <div 
            className="flex-1 rounded-lg h-20 flex items-center justify-center"
            style={{ backgroundColor: heroBannerColor }}
          >
            <span className="text-xs text-white/80">بانر المتجر</span>
          </div>
          {!hideHeaderStoreInfo && (
            <div className="w-16 bg-card rounded-lg p-2 flex flex-col items-center justify-center text-center border">
              <div className={`w-8 h-8 ${logoShapeClass} bg-primary/20 mb-1`}></div>
              <span className={`text-[8px] font-bold truncate w-full ${storeNameBlack ? 'text-black' : ''}`}>
                {storeName || 'متجري'}
              </span>
              <div className="flex items-center gap-0.5 text-[6px] text-muted-foreground">
                <MapPin className="h-2 w-2" />
                <span>فلسطين</span>
              </div>
              {socialMediaPosition === 'hero' && (
                <div className="flex gap-1 mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mini Categories - reflects category display settings */}
      <div className="p-2">
        {categoryDisplayStyle === 'sidebar' ? (
          <div className="flex gap-2">
            {/* Sidebar preview */}
            <div className="w-14 bg-card border rounded-lg p-1.5 space-y-1">
              {['ملابس', 'إلكترونيات', 'أحذية'].map((cat, i) => (
                <div key={i} className="flex items-center gap-1 p-1 rounded hover:bg-muted/50">
                  <div className={`${categorySize === 'large' ? 'w-4 h-4' : 'w-3 h-3'} ${categoryShape === 'circle' ? 'rounded-full' : 'rounded'} ${categoryDisplayType === 'icon' ? 'bg-primary/30' : 'bg-muted'} flex-shrink-0`}></div>
                  <span className="text-[5px] truncate">{cat}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 bg-muted/30 rounded-lg flex items-center justify-center">
              <span className="text-[6px] text-muted-foreground">المحتوى</span>
            </div>
          </div>
        ) : categoryDisplayStyle === 'grid' ? (
          <div className="grid grid-cols-5 gap-1">
            {['ملابس', 'إلكترونيات', 'أحذية', 'ساعات', 'حقائب'].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className={`${categorySize === 'large' ? 'w-6 h-6' : 'w-4 h-4'} ${categoryShape === 'circle' ? 'rounded-full' : 'rounded'} ${categoryDisplayType === 'icon' ? 'bg-primary/30' : 'bg-muted'} flex items-center justify-center`}>
                  {categoryDisplayType === 'icon' && <div className="w-2 h-2 rounded-full bg-primary/50"></div>}
                </div>
                <span className="text-[5px]">{cat}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-1 overflow-x-auto">
            {['ملابس', 'إلكترونيات', 'أحذية'].map((cat, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-0.5">
                <div className={`${categorySize === 'large' ? 'w-8 h-8' : 'w-6 h-6'} ${categoryShape === 'circle' ? 'rounded-full' : 'rounded-lg'} ${categoryDisplayType === 'icon' ? 'bg-primary/20' : 'bg-muted'} flex items-center justify-center`}>
                  {categoryDisplayType === 'icon' ? (
                    <div className="w-3 h-3 rounded-full bg-primary/40"></div>
                  ) : (
                    <div className="w-full h-full rounded bg-primary/10"></div>
                  )}
                </div>
                <span className="text-[6px]">{cat}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-[6px] text-center text-muted-foreground mt-1">
          {categoryDisplayStyle === 'slider' ? 'سلايدر' : categoryDisplayStyle === 'grid' ? 'شبكة' : 'قائمة جانبية'} | {categoryShape === 'circle' ? 'دائري' : 'مربع'} | {categorySize === 'large' ? 'كبير' : 'صغير'}
        </p>
      </div>

      {/* Mini Products - reflecting card settings */}
      <div className="p-2">
        <div 
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.min(cardsPerRowDesktop, 3)}, 1fr)` }}
        >
          {Array.from({ length: Math.min(cardsPerRowDesktop, 3) }).map((_, i) => (
            <div 
              key={i} 
              className={`bg-card rounded-lg overflow-hidden ${showImageBorder ? 'border border-border' : ''}`}
            >
              <div className={`${cardSizeClass} bg-muted flex items-center justify-center`}>
                <Package className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <div className={`${cardSize === 'small' ? 'p-1' : cardSize === 'large' ? 'p-2' : 'p-1.5'} text-center`}>
                <div className={`${cardPriceSize} font-bold text-primary`}>99 ₪</div>
                <div className={`${cardTextSize} truncate`}>منتج {i + 1}</div>
                <button className={`mt-1 w-full ${cardSize === 'small' ? 'py-0.5' : 'py-1'} bg-primary text-primary-foreground ${cardTextSize} rounded flex items-center justify-center gap-0.5`}>
                  <CartIcon className="h-2 w-2" />
                  <span>{cartButtonText}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[8px] text-center text-muted-foreground mt-2">
          الجوال: {cardsPerRowMobile} | الكمبيوتر: {cardsPerRowDesktop} | الحجم: {cardSize === 'small' ? 'صغير' : cardSize === 'large' ? 'كبير' : 'متوسط'}
        </p>
      </div>

      {/* Animation indicator */}
      {animationEffect && animationEffect !== 'none' && (
        <div className="px-2 pb-2">
          <div className="text-[8px] text-center text-muted-foreground bg-muted/50 rounded p-1">
            🎨 تأثير {animationEffect === 'snow' ? 'الثلج' : animationEffect === 'stars' ? 'النجوم' : animationEffect === 'hearts' ? 'القلوب' : animationEffect === 'confetti' ? 'الاحتفال' : animationEffect === 'bubbles' ? 'الفقاعات' : 'الأوراق'} مفعّل
          </div>
        </div>
      )}

      {/* Footer social media indicator */}
      {socialMediaPosition === 'footer' && (
        <div className="px-2 pb-2">
          <div className="flex justify-center gap-2 p-2 bg-muted/30 rounded">
            <div className="w-4 h-4 rounded-full bg-primary/30"></div>
            <div className="w-4 h-4 rounded-full bg-primary/30"></div>
            <div className="w-4 h-4 rounded-full bg-primary/30"></div>
            <div className="w-4 h-4 rounded-full bg-primary/30"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePreview;
