import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Skeleton } from '@/components/ui/skeleton';
import HeroSection from '@/components/HeroSection';
import DealsBar from '@/components/DealsBar';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductQuickView from '@/components/ProductQuickView';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSettings } from '@/contexts/SettingsContext';
import { usePageView } from '@/hooks/useAnalytics';
import BackgroundPattern from '@/components/BackgroundPattern';
import SocialFooter from '@/components/SocialFooter';
import CategoriesSlider from '@/components/CategoriesSlider';
import SearchBar from '@/components/SearchBar';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import BrandsButton from '@/components/BrandsButton';
import ProductGrid from '@/components/ProductGrid';
import SEOManager from '@/components/SEOManager';

const Home = () => {
  useDocumentTitle();
  usePageView('/');
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { settings } = useSettings();
  const categoryDisplayStyle = (settings?.category_display_style || 'grid') as string;
  const showBrandsButton = settings?.show_brands_button !== false;

  const getColorValue = (color: string) => {
    const colorMap: Record<string, string> = {
      'أبيض': '#FFFFFF',
      'أسود': '#000000',
      'أحمر': '#FF0000',
      'أزرق': '#0000FF',
      'أخضر': '#00FF00',
      'أصفر': '#FFFF00',
      'برتقالي': '#FFA500',
      'بني': '#8B4513',
      'رمادي': '#808080',
      'زهري': '#FFC0CB',
      'بنفسجي': '#800080',
      'كحلي': '#000080',
      'أزرق غامق': '#00008B'
    };
    return color.startsWith('#') ? color : colorMap[color] || color;
  };

  // Parse category display config
  const getCategoryDisplayConfig = () => {
    try {
      const parsed = JSON.parse(categoryDisplayStyle);
      if (typeof parsed === 'object') {
        return {
          style: parsed.style || 'slider',
          shape: parsed.shape || 'square',
          displayType: parsed.displayType || 'image',
          size: parsed.size || 'large'
        };
      }
    } catch {
      // Legacy format handling
    }
    return {
      style: 'slider' as const,
      shape: 'square' as const,
      displayType: 'image' as const,
      size: 'large' as const
    };
  };

  const categoryConfig = getCategoryDisplayConfig();
  const isSidebarMode = categoryConfig.style === 'sidebar';

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['all-products', currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * productsPerPage;
      const to = from + productsPerPage - 1;
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data, count };
    }
  });

  const totalPages = products?.count ? Math.ceil(products.count / productsPerPage) : 1;

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      <SEOManager />
      <BackgroundPattern />
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Search Bar */}
      <section className="py-3 bg-muted/30">
        <div className="container">
          <SearchBar />
        </div>
      </section>

      {/* My Orders Button */}
      <section className="py-2">
        <div className="container">
          <Link to="/my-orders" className="block">
            <div className="w-full p-3 rounded-xl bg-black hover:bg-black/90 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
              <div className="flex items-center justify-center gap-2">
                <Package className="h-5 w-5 text-white" />
                <span className="text-base font-bold text-white">طلباتي</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content with Sidebar */}
      <div className="container">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          {isSidebarMode && (
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-20 self-start max-h-[calc(100vh-100px)]">
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
                displayStyle={categoryConfig.style === 'sidebar' ? 'slider' : categoryConfig.style}
                settings={{
                  shape: categoryConfig.shape,
                  displayType: categoryConfig.displayType,
                  size: categoryConfig.size
                }}
              />
            </section>

            {/* Deals Bar & Brands Button */}
            <section className={`py-4 md:py-6 ${isSidebarMode ? 'lg:hidden' : ''}`}>
              <div className="space-y-3">
                <DealsBar />
                <BrandsButton visible={showBrandsButton} />
              </div>
            </section>

            {/* All Products */}
            <section className="py-8 lg:py-12">
              <h2 className="text-2xl font-bold mb-6">كافة المنتجات</h2>
              {productsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                  {[...Array(12)].map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-lg" />
                  ))}
                </div>
              ) : products?.data && products.data.length > 0 ? (
                <ProductGrid
                  products={products.data}
                  onProductClick={handleProductClick}
                  getColorValue={getColorValue}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">لا توجد منتجات</p>
                </div>
              )}

              {/* Pagination */}
              {!productsLoading && products?.data && products.data.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    السابق
                  </Button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Quick View Dialog */}
      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
        />
      )}

      {/* Social Media Footer */}
      <SocialFooter />
    </div>
  );
};

export default Home;
