import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getIconByName } from '@/lib/categoryIcons';
import { Grid3X3, Package, Sparkles, Percent, Clock, Tags } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface CategoriesSidebarProps {
  onItemClick?: () => void;
}

const CategoriesSidebar = ({ onItemClick }: CategoriesSidebarProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [categoriesRes, brandsRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('brands').select('*').order('name', { ascending: true })
      ]);
      
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (brandsRes.data) setBrands(brandsRes.data);
    };
    fetchData();
  }, []);

  const quickLinks = [
    { to: '/all-products', label: 'عرض كل المنتجات', icon: Package, color: 'bg-primary text-primary-foreground' },
    { to: '/deals', label: 'عروض وخصومات لفترة محدودة', icon: Percent, color: 'text-primary' },
  ];

  return (
    <div className="h-full flex flex-col bg-card rounded-xl border shadow-card overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* Categories */}
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              onClick={onItemClick}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ backgroundColor: category.bg_color || 'hsl(var(--primary) / 0.1)' }}
              >
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : category.icon_name ? (
                  <RenderCategoryIcon iconName={category.icon_name} className="h-5 w-5 text-primary" />
                ) : (
                  <Grid3X3 className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <span className="font-medium text-sm group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </Link>
          ))}

          {/* Divider */}
          <div className="my-3 border-t border-border" />

          {/* Quick Links */}
          {quickLinks.map((link, idx) => (
            <Link
              key={idx}
              to={link.to}
              onClick={onItemClick}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                idx === 0 ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-muted'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${idx === 0 ? 'bg-primary' : 'bg-muted'}`}>
                <link.icon className={`h-5 w-5 ${idx === 0 ? 'text-primary-foreground' : 'text-primary'}`} />
              </div>
              <span className={`font-medium text-sm ${idx === 0 ? 'text-primary' : ''}`}>
                {link.label}
              </span>
            </Link>
          ))}

          {/* Brands Section */}
          {brands.length > 0 && (
            <>
              <div className="my-3 border-t border-border" />
              
              <Link
                to="/brands"
                onClick={onItemClick}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors mb-2"
              >
                <Tags className="h-5 w-5" />
                <span className="font-bold text-sm">العلامات التجارية</span>
              </Link>

              <div className="space-y-1">
                {brands.slice(0, 8).map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/brands?brand=${brand.id}`}
                    onClick={onItemClick}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center overflow-hidden flex-shrink-0">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <span className="text-xs font-bold">{brand.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">
                      {brand.name}
                    </span>
                  </Link>
                ))}
                
                {brands.length > 8 && (
                  <Link
                    to="/brands"
                    onClick={onItemClick}
                    className="block text-center text-sm text-primary hover:underline py-2"
                  >
                    عرض الكل ({brands.length})
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CategoriesSidebar;
