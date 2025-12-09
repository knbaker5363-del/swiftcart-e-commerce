import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductQuickView from '@/components/ProductQuickView';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSettings } from '@/contexts/SettingsContext';
import { usePageView } from '@/hooks/useAnalytics';
import BackgroundPattern from '@/components/BackgroundPattern';
import SocialFooter from '@/components/SocialFooter';
import SearchBar from '@/components/SearchBar';
import SEOManager from '@/components/SEOManager';
import HeroSection from '@/components/HeroSection';
import AnnouncementBar from '@/components/AnnouncementBar';
import { ClassicLayout, CategoryRowsLayout, PremiumLayout } from '@/components/layouts';

const Home = () => {
  useDocumentTitle();
  usePageView('/');
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { settings } = useSettings();
  const categoryDisplayStyle = (settings?.category_display_style || 'grid') as string;
  const storeLayoutStyle = (settings as any)?.store_layout_style || 'classic';

  const getColorValue = (color: string) => {
    const colorMap: Record<string, string> = {
      'أبيض': '#FFFFFF', 'أسود': '#000000', 'أحمر': '#FF0000',
      'أزرق': '#0000FF', 'أخضر': '#00FF00', 'أصفر': '#FFFF00',
      'برتقالي': '#FFA500', 'بني': '#8B4513', 'رمادي': '#808080',
      'زهري': '#FFC0CB', 'بنفسجي': '#800080', 'كحلي': '#000080',
    };
    return color.startsWith('#') ? color : colorMap[color] || color;
  };

  const getCategoryDisplayConfig = () => {
    try {
      const parsed = JSON.parse(categoryDisplayStyle);
      if (typeof parsed === 'object') {
        return { style: parsed.style || 'slider', shape: parsed.shape || 'square', displayType: parsed.displayType || 'image', size: parsed.size || 'large' };
      }
    } catch {}
    return { style: 'slider', shape: 'square', displayType: 'image', size: 'large' };
  };

  const categoryConfig = getCategoryDisplayConfig();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
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
      const { data, error, count } = await supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true).order('created_at', { ascending: false }).range(from, to);
      if (error) throw error;
      return { data, count };
    }
  });

  const totalPages = products?.count ? Math.ceil(products.count / productsPerPage) : 1;

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const renderLayout = () => {
    switch (storeLayoutStyle) {
      case 'category-rows':
        return (
          <CategoryRowsLayout
            categories={categories || []}
            onProductClick={handleProductClick}
            getColorValue={getColorValue}
          />
        );
      case 'premium':
        return (
          <PremiumLayout
            products={products?.data || []}
            isLoadingProducts={productsLoading}
            onProductClick={handleProductClick}
            getColorValue={getColorValue}
          />
        );
      default:
        return (
          <ClassicLayout
            categories={categories || []}
            categoriesLoading={categoriesLoading}
            products={products?.data || []}
            isLoadingProducts={productsLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onProductClick={handleProductClick}
            getColorValue={getColorValue}
            categoryConfig={categoryConfig}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background relative" dir="rtl">
      <SEOManager />
      <BackgroundPattern />
      <AnnouncementBar />
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      <section className="py-3 bg-muted/30">
        <div className="container"><SearchBar /></div>
      </section>

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

      <HeroSection />

      <div className="container">
        {renderLayout()}
      </div>

      {selectedProduct && (
        <ProductQuickView product={selectedProduct} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
      )}

      <SocialFooter />
    </div>
  );
};

export default Home;
