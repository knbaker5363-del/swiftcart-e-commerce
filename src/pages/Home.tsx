import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import HeroSection from '@/components/HeroSection';
import DealsBar from '@/components/DealsBar';
import { Heart, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CartButton from '@/components/CartButton';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import BrandsButton from '@/components/BrandsButton';
import ProductQuickView from '@/components/ProductQuickView';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSettings } from '@/contexts/SettingsContext';
import { usePageView } from '@/hooks/useAnalytics';
import BackgroundPattern from '@/components/BackgroundPattern';
import SocialFooter from '@/components/SocialFooter';
import CategoriesSlider from '@/components/CategoriesSlider';
import SearchBar from '@/components/SearchBar';
import CategoriesSidebar from '@/components/CategoriesSidebar';

const Home = () => {
  useDocumentTitle();
  usePageView('/'); // Track home page visits
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const {
    settings
  } = useSettings();
  const {
    toggleFavorite,
    isFavorite
  } = useFavorites();
  const {
    addItem
  } = useCart();
  const {
    toast
  } = useToast();
  const categoryDisplayStyle = (settings?.category_display_style || 'grid') as string;
  const showBrandsButton = settings?.show_brands_button !== false;
  
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
  const {
    data: categories,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('categories').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
  const {
    data: products,
    isLoading: productsLoading
  } = useQuery({
    queryKey: ['all-products', currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * productsPerPage;
      const to = from + productsPerPage - 1;
      const {
        data,
        error,
        count
      } = await supabase.from('products').select('*', {
        count: 'exact'
      }).eq('is_active', true).order('created_at', {
        ascending: false
      }).range(from, to);
      if (error) throw error;
      return {
        data,
        count
      };
    }
  });
  const totalPages = products?.count ? Math.ceil(products.count / productsPerPage) : 1;
  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const hideHeaderStoreInfo = settings?.hide_header_store_info || false;
  
  return <div className="min-h-screen bg-background relative" dir="rtl">
      <BackgroundPattern />
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Search Bar - تحت الهيدر مباشرة */}
      <section className="py-3 bg-muted/30">
        <div className="container">
          <SearchBar />
        </div>
      </section>

      {/* My Orders Button - يظهر دائماً */}
      <section className="py-2">
        <div className="container">
          <Link to="/my-orders" className="block lg:hidden">
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
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-20 self-start max-h-[calc(100vh-100px)]">
            <CategoriesSidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Categories Slider - Mobile Only */}
            <section className="py-6 md:py-8 lg:hidden">
              <h2 className="text-xl font-bold mb-4">التصنيفات</h2>
              <CategoriesSlider 
                categories={categories} 
                isLoading={categoriesLoading} 
                displayStyle={categoryConfig.style}
                settings={{
                  shape: categoryConfig.shape,
                  displayType: categoryConfig.displayType,
                  size: categoryConfig.size
                }}
              />
            </section>

            {/* Deals Bar & Brands Button - Mobile Only */}
            <section className="py-4 md:py-6 lg:hidden">
              <div className="space-y-3">
                <DealsBar />
                <BrandsButton visible={showBrandsButton} />
              </div>
            </section>

            {/* All Products */}
            <section className="py-8 lg:py-12">
              <h2 className="text-2xl font-bold mb-6">كافة المنتجات</h2>
              {productsLoading ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                  {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
                </div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                  {products?.data?.map(product => {
                const additionalImages = product.additional_images as string[] | null;
                const options = product.options as {
                  sizes?: string[];
                  colors?: string[];
                } | null;
                const hasDiscount = (product.discount_percentage ?? 0) > 0;
                const discountedPrice = hasDiscount ? product.price * (1 - (product.discount_percentage ?? 0) / 100) : product.price;
                return <Card key={product.id} className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full text-xs">
                        
                        <div className="relative flex-shrink-0">
                          <div onClick={() => handleProductClick(product)} className="cursor-pointer">
                            <ProductImageCarousel mainImage={product.image_url || '/placeholder.svg'} additionalImages={additionalImages || []} productName={product.name} />
                          </div>
                          {hasDiscount && <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2">
                              -{product.discount_percentage}%
                            </Badge>}
                          <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors">
                            <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
                          </button>
                        </div>
                        
                        <div className="p-3 flex flex-col flex-grow text-center">
                          {/* Price */}
                          <div className="flex items-center justify-center gap-2 mb-1">
                            {hasDiscount ? <>
                                <span className="text-xs text-muted-foreground line-through">{product.price.toFixed(0)} ₪</span>
                                <span className="text-base font-bold text-primary">{discountedPrice.toFixed(0)} ₪</span>
                              </> : <span className="text-base font-bold text-primary">{product.price.toFixed(0)} ₪</span>}
                          </div>

                          {/* Product Name */}
                          <div onClick={() => handleProductClick(product)} className="cursor-pointer mb-2">
                            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                          </div>
                          
                          {/* Sizes */}
                          {options?.sizes && options.sizes.length > 0 && <div className="flex flex-wrap justify-center gap-1 mb-2">
                              {options.sizes.map((size: any, idx: number) => {
                                const sizeName = typeof size === 'string' ? size : size.name;
                                return (
                                  <span key={idx} className="text-[10px] px-2 py-0.5 border border-border rounded-md bg-background">
                                    {sizeName}
                                  </span>
                                );
                              })}
                            </div>}
                          
                          {/* Colors */}
                          {options?.colors && options.colors.length > 0 && <div className="flex flex-wrap justify-center gap-1 mb-2">
                              {options.colors.map((color, idx) => <div key={idx} className="w-5 h-5 rounded border border-border" style={{
                        backgroundColor: getColorValue(color)
                      }} title={color} />)}
                            </div>}
                          
                          {/* Add to Cart Button */}
                          <CartButton
                            onClick={e => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                            className="w-auto px-6 mx-auto mt-auto"
                            size="sm"
                            variant="secondary"
                          />
                        </div>
                      </Card>;
              })}
                </div>}
              
              {/* Pagination */}
              {!productsLoading && products?.data && products.data.length > 0 && totalPages > 1 && <div className="flex justify-center items-center gap-2 mt-8">
                  <Button variant="outline" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                    السابق
                  </Button>
                  
                  <div className="flex gap-2">
                    {Array.from({
                  length: totalPages
                }, (_, i) => i + 1).map(page => <Button key={page} variant={currentPage === page ? "default" : "outline"} onClick={() => setCurrentPage(page)} className="w-10">
                        {page}
                      </Button>)}
                  </div>
                  
                  <Button variant="outline" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                    التالي
                  </Button>
                </div>}
            </section>
          </main>
        </div>
      </div>

      {/* Quick View Dialog */}
      {selectedProduct && <ProductQuickView product={selectedProduct} open={quickViewOpen} onOpenChange={setQuickViewOpen} />}

      {/* Social Media Footer */}
      <SocialFooter />
    </div>;
};
export default Home;