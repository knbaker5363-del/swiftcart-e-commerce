import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import HeroSection from '@/components/HeroSection';
import DealsBar from '@/components/DealsBar';
import { Heart, ShoppingCart, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ProductImageCarousel } from '@/components/ProductImageCarousel';
import BrandsButton from '@/components/BrandsButton';
import ProductQuickView from '@/components/ProductQuickView';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSettings } from '@/contexts/SettingsContext';

const Home = () => {
  useDocumentTitle();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { settings } = useSettings();

  const { toggleFavorite, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const categoryDisplayStyle = settings?.category_display_style || 'grid';
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
      'أزرق غامق': '#00008B',
    };
    return color.startsWith('#') ? color : (colorMap[color] || color);
  };

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
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
    },
  });

  const totalPages = products?.count ? Math.ceil(products.count / productsPerPage) : 1;

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const renderCategoryItem = (category: any) => {
    if (categoryDisplayStyle === 'list') {
      return (
        <Link
          key={category.id}
          to={`/category/${category.id}`}
          className="block"
        >
          <div className="p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
            <h3 className="font-medium text-center">{category.name}</h3>
          </div>
        </Link>
      );
    }
    
    if (categoryDisplayStyle === 'icon-list') {
      return (
        <Link
          key={category.id}
          to={`/category/${category.id}`}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Grid className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-medium">{category.name}</h3>
        </Link>
      );
    }
    
    // Default: grid with images
    return (
      <Link
        key={category.id}
        to={`/category/${category.id}`}
        className="group"
      >
        <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-3">
          <div className="aspect-square mb-2">
            {category.image_url ? (
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-md" />
            )}
          </div>
          <h3 className="font-medium text-sm text-center line-clamp-1">{category.name}</h3>
        </Card>
      </Link>
    );
  };

  const getCategoryGridClass = () => {
    if (categoryDisplayStyle === 'list') {
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3";
    }
    if (categoryDisplayStyle === 'icon-list') {
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3";
    }
    return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4";
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Hero Section */}
      <HeroSection />

      {/* Categories */}
      <section className="py-8 md:py-12">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">التصنيفات</h2>
          {categoriesLoading ? (
            <div className={getCategoryGridClass()}>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 md:h-40 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className={getCategoryGridClass()}>
              {categories?.map(renderCategoryItem)}
            </div>
          )}
        </div>
      </section>

      {/* Deals Bar & Brands Button - After categories on mobile */}
      <section className="py-4 md:py-6">
        <div className="container space-y-3">
          <DealsBar />
          <BrandsButton visible={showBrandsButton} />
        </div>
      </section>

      {/* All Products */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">كافة المنتجات</h2>
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products?.data?.map((product) => {
                const additionalImages = product.additional_images as string[] | null;
                
                const options = product.options as { sizes?: string[], colors?: string[] } | null;
                const hasDiscount = (product.discount_percentage ?? 0) > 0;
                const discountedPrice = hasDiscount 
                  ? product.price * (1 - (product.discount_percentage ?? 0) / 100)
                  : product.price;

                return (
                  <Card key={product.id} className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full">
                    <div className="relative flex-shrink-0">
                      <div onClick={() => handleProductClick(product)} className="cursor-pointer">
                        <ProductImageCarousel 
                          mainImage={product.image_url || '/placeholder.svg'}
                          additionalImages={additionalImages || []}
                          productName={product.name}
                        />
                      </div>
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-sm font-bold">
                          {product.discount_percentage}% خصم
                        </div>
                      )}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            isFavorite(product.id)
                              ? 'fill-destructive text-destructive'
                              : 'text-foreground'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <div onClick={() => handleProductClick(product)} className="block mb-auto cursor-pointer">
                        <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors min-h-[3rem]">
                          {product.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {hasDiscount ? (
                          <>
                            <span className="text-lg font-bold text-primary">
                              {discountedPrice.toFixed(2)} ₪
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {product.price.toFixed(2)} ₪
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-primary">
                            {product.price.toFixed(2)} ₪
                          </span>
                        )}
                      </div>
                      
                      {options && (options.sizes || options.colors) && (
                        <div className="mb-3 space-y-2 min-h-[3rem]">
                          {options.sizes && options.sizes.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-muted-foreground">المقاسات:</span>
                              {options.sizes.slice(0, 3).map((size, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-muted rounded">
                                  {size}
                                </span>
                              ))}
                              {options.sizes.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded font-medium">
                                  +{options.sizes.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          {options.colors && options.colors.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-muted-foreground">الألوان:</span>
                              {options.colors.slice(0, 3).map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-5 h-5 rounded-full border-2 border-border"
                                  style={{ backgroundColor: getColorValue(color) }}
                                  title={color}
                                />
                              ))}
                              {options.colors.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded font-medium">
                                  +{options.colors.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => handleProductClick(product)}
                        className="w-full mt-auto text-xs md:text-sm py-3"
                      >
                        <ShoppingCart className="ml-1.5 h-4 w-4" />
                        أضف للسلة
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {!productsLoading && products?.data && products.data.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Dialog */}
      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
        />
      )}
    </div>
  );
};

export default Home;