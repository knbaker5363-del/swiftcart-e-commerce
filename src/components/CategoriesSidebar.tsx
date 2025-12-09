import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getIconByName } from '@/lib/categoryIcons';
import { Grid3X3, Package, Sparkles, Percent, ChevronLeft, Tags, ShoppingBag } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaSnapchatGhost, FaTiktok } from 'react-icons/fa';

interface Category {
  id: string;
  name: string;
  image_url?: string | null;
  icon_name?: string | null;
  bg_color?: string | null;
}

interface Brand {
  id: string;
  name: string;
  logo_url?: string | null;
}

const RenderCategoryIcon = ({
  iconName,
  className
}: {
  iconName: string;
  className?: string;
}) => {
  const IconComponent = getIconByName(iconName);
  if (!IconComponent) {
    return <Grid3X3 className={className} />;
  }
  return <IconComponent className={className} />;
};

interface CategoryDisplayConfig {
  style: 'slider' | 'grid' | 'sidebar';
  shape: 'square' | 'circle';
  displayType: 'image' | 'icon';
  size: 'small' | 'large';
}

interface CategoriesSidebarProps {
  onItemClick?: () => void;
}

const CategoriesSidebar = ({ onItemClick }: CategoriesSidebarProps) => {
  const { settings } = useSettings();
  const [categories, setCategories] = useState<Category[]>(() => {
    // Load from localStorage immediately
    const cached = localStorage.getItem('cached_categories');
    return cached ? JSON.parse(cached) : [];
  });
  const [brands, setBrands] = useState<Brand[]>(() => {
    // Load from localStorage immediately
    const cached = localStorage.getItem('cached_brands');
    return cached ? JSON.parse(cached) : [];
  });

  const getCategoryConfig = (): CategoryDisplayConfig => {
    try {
      const parsed = JSON.parse(settings?.category_display_style || '{}');
      if (typeof parsed === 'object') {
        return {
          style: parsed.style || 'sidebar',
          shape: parsed.shape || 'square',
          displayType: parsed.displayType || 'image',
          size: parsed.size || 'large'
        };
      }
    } catch {
      // fallback
    }
    return { style: 'sidebar', shape: 'square', displayType: 'image', size: 'large' };
  };

  const categoryConfig = getCategoryConfig();

  useEffect(() => {
    const fetchData = async () => {
      const [categoriesRes, brandsRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('brands').select('*').order('name', { ascending: true })
      ]);
      
      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
        localStorage.setItem('cached_categories', JSON.stringify(categoriesRes.data));
      }
      if (brandsRes.data) {
        setBrands(brandsRes.data);
        localStorage.setItem('cached_brands', JSON.stringify(brandsRes.data));
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-card to-card/95 rounded-2xl border border-border/50 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Grid3X3 className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-bold text-foreground">التصنيفات</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Categories */}
        {categories.map((category, index) => {
          const shapeClass = categoryConfig.shape === 'circle' ? 'rounded-full' : 'rounded-xl';
          const sizeClass = categoryConfig.size === 'large' ? 'w-11 h-11' : 'w-9 h-9';
          const iconSizeClass = categoryConfig.size === 'large' ? 'h-5 w-5' : 'h-4 w-4';
          
          const showImage = categoryConfig.displayType === 'image' && category.image_url;
          const showIcon = categoryConfig.displayType === 'icon' || (!category.image_url && category.icon_name);

          return (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              onClick={onItemClick}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/5 hover:shadow-sm transition-all duration-200 group relative overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div 
                className={`${sizeClass} ${shapeClass} flex items-center justify-center overflow-hidden flex-shrink-0 relative shadow-sm ring-2 ring-border/20 group-hover:ring-primary/30 transition-all duration-200 group-hover:scale-105`}
                style={{ backgroundColor: category.bg_color || 'hsl(var(--primary) / 0.1)' }}
              >
                {showImage && category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className={`w-full h-full object-cover ${shapeClass}`}
                  />
                ) : showIcon && category.icon_name ? (
                  <RenderCategoryIcon iconName={category.icon_name} className={`${iconSizeClass} text-primary`} />
                ) : category.image_url && categoryConfig.displayType !== 'icon' ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className={`w-full h-full object-cover ${shapeClass}`}
                  />
                ) : category.icon_name ? (
                  <RenderCategoryIcon iconName={category.icon_name} className={`${iconSizeClass} text-primary`} />
                ) : (
                  <Grid3X3 className={`${iconSizeClass} text-muted-foreground`} />
                )}
              </div>
              
              <span className="font-semibold text-sm group-hover:text-primary transition-colors relative z-10 flex-1">
                {category.name}
              </span>
              
              <ChevronLeft className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:-translate-x-1 transition-all duration-200 opacity-0 group-hover:opacity-100" />
            </Link>
          );
        })}

        {/* Quick Links Section */}
        <div className="pt-3 mt-3 border-t border-border/30 space-y-2">
          <Link
            to="/products"
            onClick={onItemClick}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-l from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-200 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm text-primary flex-1">عرض كل المنتجات</span>
            <ChevronLeft className="h-4 w-4 text-primary/50 group-hover:-translate-x-1 transition-transform duration-200" />
          </Link>

          <Link
            to="/deals"
            onClick={onItemClick}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/5 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Percent className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-sm block">العروض الخاصة</span>
              <span className="text-xs text-muted-foreground">خصومات لفترة محدودة</span>
            </div>
            <div className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold animate-pulse">
              HOT
            </div>
          </Link>
        </div>

        {/* Brands Section */}
        {brands.length > 0 && (
          <div className="pt-3 mt-3 border-t border-border/30">
            <Link
              to="/brands"
              onClick={onItemClick}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-l from-muted to-muted/50 hover:from-muted/80 hover:to-muted/30 transition-all duration-200 mb-3 group"
            >
              <Tags className="h-5 w-5 text-foreground" />
              <span className="font-bold text-sm">العلامات التجارية</span>
              <span className="px-2 py-0.5 rounded-full bg-background text-xs font-medium">{brands.length}</span>
            </Link>

            <div className="space-y-1">
              {brands.slice(0, 6).map((brand, index) => (
                <Link
                  key={brand.id}
                  to={`/brands?brand=${brand.id}`}
                  onClick={onItemClick}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-background border-2 border-border/50 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-primary/30 transition-colors shadow-sm">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="w-7 h-7 object-contain"
                      />
                    ) : (
                      <span className="text-sm font-bold text-primary">{brand.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="font-medium text-sm group-hover:text-primary transition-colors flex-1">
                    {brand.name}
                  </span>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:-translate-x-1 transition-all duration-200 opacity-0 group-hover:opacity-100" />
                </Link>
              ))}
              
              {brands.length > 6 && (
                <Link
                  to="/brands"
                  onClick={onItemClick}
                  className="flex items-center justify-center gap-1 text-sm text-primary hover:text-primary/80 py-2 font-medium transition-colors"
                >
                  <span>عرض الكل ({brands.length})</span>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Social Media Links */}
        {((settings as any)?.social_whatsapp || (settings as any)?.social_instagram || 
          (settings as any)?.social_facebook || (settings as any)?.social_snapchat || 
          (settings as any)?.social_tiktok) && (
          <div className="pt-4 mt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center mb-3">تابعنا على</p>
            <div className="flex items-center justify-center gap-2">
              {(settings as any)?.social_whatsapp && (
                <a
                  href={`https://wa.me/${(settings as any).social_whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white hover:scale-110 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200"
                >
                  <FaWhatsapp className="h-5 w-5" />
                </a>
              )}
              {(settings as any)?.social_instagram && (
                <a
                  href={`https://instagram.com/${(settings as any).social_instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white hover:scale-110 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200"
                >
                  <FaInstagram className="h-5 w-5" />
                </a>
              )}
              {(settings as any)?.social_facebook && (
                <a
                  href={`https://facebook.com/${(settings as any).social_facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
                >
                  <FaFacebookF className="h-5 w-5" />
                </a>
              )}
              {(settings as any)?.social_snapchat && (
                <a
                  href={`https://snapchat.com/add/${(settings as any).social_snapchat}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-black hover:scale-110 hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-200"
                >
                  <FaSnapchatGhost className="h-5 w-5" />
                </a>
              )}
              {(settings as any)?.social_tiktok && (
                <a
                  href={`https://tiktok.com/@${(settings as any).social_tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white hover:scale-110 hover:shadow-lg hover:shadow-gray-500/30 transition-all duration-200"
                >
                  <FaTiktok className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesSidebar;
