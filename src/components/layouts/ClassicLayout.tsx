import { useSettings } from '@/contexts/SettingsContext';
import CategoriesSlider from '@/components/CategoriesSlider';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import DealsBar from '@/components/DealsBar';
import BrandsButton from '@/components/BrandsButton';
import BrandsSlider from '@/components/BrandsSlider';
import OffersButton from '@/components/OffersButton';
import ProductGrid from '@/components/ProductGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

        {/* All Products */}
        <section className="py-8 lg:py-12">
          <h2 className="text-2xl font-bold mb-6">كافة المنتجات</h2>
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <ProductGrid
              products={products}
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
