import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  logo_url?: string | null;
}

interface BrandsSliderProps {
  visible?: boolean;
}

const BrandsSlider = ({ visible = true }: BrandsSliderProps) => {
  const [brands, setBrands] = useState<Brand[]>(() => {
    const cached = localStorage.getItem('cached_brands');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    const fetchBrands = async () => {
      const { data } = await supabase.from('brands').select('*').order('name', { ascending: true });
      if (data) {
        setBrands(data);
        localStorage.setItem('cached_brands', JSON.stringify(data));
      }
    };
    fetchBrands();
  }, []);

  if (!visible || brands.length === 0) return null;

  return (
    <div className="py-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {brands.map((brand) => (
          <Link
            key={brand.id}
            to={`/brands?brand=${brand.id}`}
            className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group min-w-[100px]"
          >
            <div className="w-16 h-16 rounded-xl bg-background border-2 border-border/50 flex items-center justify-center overflow-hidden group-hover:border-primary/30 transition-colors shadow-sm">
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <span className="text-xl font-bold text-primary">{brand.name.charAt(0)}</span>
              )}
            </div>
            <span className="font-medium text-sm text-center group-hover:text-primary transition-colors">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BrandsSlider;
