import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import CategoriesSlider from '@/components/CategoriesSlider';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import DealsBar from '@/components/DealsBar';
import BrandsButton from '@/components/BrandsButton';
import BrandsSlider from '@/components/BrandsSlider';
import OffersButton from '@/components/OffersButton';
import ProductGrid from '@/components/ProductGrid';
import HomeSpecialOffers from '@/components/HomeSpecialOffers';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Flame, TrendingUp, ArrowDownNarrowWide, Percent, Clock, Sparkles } from 'lucide-react';

type SortOption = 'newest' | 'cheapest' | 'expensive' | 'discount' | 'popular';

const sortOptions: { value: SortOption; label: string; icon: any }[] = [
  { value: 'newest', label: 'الأحدث', icon: Clock },
  { value: 'popular', label: 'الأكثر مبيعاً', icon: TrendingUp },
  { value: 'cheapest', label: 'الأرخص', icon: ArrowDownNarrowWide },
  { value: 'discount', label: 'خصومات', icon: Percent },
];

interface ClassicLayoutProps {
  categories: any[];
  categoriesLoading: boolean;
  products: any[];
  isLoadingProducts: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onProductClick: (product: any) => void;
  getColorValue: (color: string) => string;
  categoryConfig: { 
    style: string;
    shape: string;
    displayType: string;
    size: string;
  };
}

const ClassicLayout = ({
  categories,
  categoriesLoading,
  products,
  isLoadingProducts,
  currentPage,
  totalPages,
  onPageChange,
  onProductClick,
  getColorValue,
  categoryConfig
}: ClassicLayoutProps) => {
  const { settings } = useSettings();
  const isSidebarMode = categoryConfig.style === 'sidebar';
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Sort products based on selected option
  const sortedProducts = [...(products || [])].sort((a, b) => {
    switch (sortBy) {
      case 'cheapest':
        const priceA = a.discount_percentage ? a.price * (1 - a.discount_percentage / 100) : a.price;
        const priceB = b.discount_percentage ? b.price * (1 - b.discount_percentage / 100) : b.price;
        return priceA - priceB;
      case 'expensive':
        const pA = a.discount_percentage ? a.price * (1 - a.discount_percentage / 100) : a.price;
        const pB = b.discount_percentage ? b.price * (1 - b.discount_percentage / 100) : b.price;
        return pB - pA;
      case 'discount':
        return (b.discount_percentage || 0) - (a.discount_percentage || 0);
      case 'popular':
        // Sort by created_at as proxy for popularity (can be enhanced with actual sales data)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="flex gap-6">
      {/* Desktop Sidebar */}
      {isSidebarMode && (
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <CategoriesSidebar />
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Categories Slider/Grid */}
        <section className={`py-6 md:py-8 ${isSidebarMode ? 'lg:hidden' : ''}`}>
          <h2 className="text-xl font-bold mb-4">التصنيفات</h2>
          <CategoriesSlider
            categories={categories}
            isLoading={categoriesLoading}
            displayStyle={categoryConfig.style === 'sidebar' ? 'slider' : categoryConfig.style as 'grid' | 'slider'}
            settings={{
              shape: categoryConfig.shape as 'square' | 'circle',
              displayType: categoryConfig.displayType as 'image' | 'icon',
              size: categoryConfig.size as 'small' | 'large'
            }}
          />
        </section>

        {/* Brands Button - Full Width */}
        <section className={`py-2 md:py-3 ${isSidebarMode ? 'lg:hidden' : ''}`}>
          <BrandsButton visible={settings?.show_brands_button !== false} />
        </section>

        {/* Brands Slider */}
        <BrandsSlider visible={(settings as any)?.show_brands_slider === true} />

        {/* Deals & Offers Buttons - Side by Side */}
        <section className={`py-2 md:py-3 ${isSidebarMode ? 'lg:hidden' : ''}`}>
          <div className="flex gap-3">
            <DealsBar />
            <OffersButton />
          </div>
        </section>

        {/* Special Offers */}
        <HomeSpecialOffers />

        {/* All Products */}
        <section className="py-8 lg:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">كافة المنتجات</h2>
            
            {/* Sort/Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                const isActive = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                      transition-all duration-300 border-2
                      ${isActive 
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105' 
                        : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:border-primary/30'
                      }
                    `}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : sortedProducts && sortedProducts.length > 0 ? (
            <ProductGrid
              products={sortedProducts}
              onProductClick={onProductClick}
              getColorValue={getColorValue}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد منتجات</p>
            </div>
          )}

          {/* Pagination */}
          {!isLoadingProducts && products && products.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => onPageChange(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ClassicLayout;
