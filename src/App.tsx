import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { SetupGuard } from "@/components/SetupGuard";
import AnimatedEffects from "@/components/AnimatedEffects";
import FaviconManager from "@/components/FaviconManager";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Eagerly loaded pages (critical path)
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";

// Lazy loaded pages (non-critical)
const Favorites = lazy(() => import("./pages/Favorites"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Deals = lazy(() => import("./pages/Deals"));
const AllProducts = lazy(() => import("./pages/AllProducts"));
const Brands = lazy(() => import("./pages/Brands"));
const BrandProducts = lazy(() => import("./pages/BrandProducts"));
const Category = lazy(() => import("./pages/Category"));
const Auth = lazy(() => import("./pages/Auth"));
const SpecialOffers = lazy(() => import("./pages/SpecialOffers"));
const SpecialOfferDetail = lazy(() => import("./pages/SpecialOfferDetail"));
const CreateAdmin = lazy(() => import("./pages/CreateAdmin"));

// Lazy loaded admin pages (heavy bundle)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminBrands = lazy(() => import("./pages/admin/AdminBrands"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminPromoCodes = lazy(() => import("./pages/admin/AdminPromoCodes"));
const AdminGifts = lazy(() => import("./pages/admin/AdminGifts"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminDisplay = lazy(() => import("./pages/admin/AdminDisplay"));
const AdminAdvancedSettings = lazy(() => import("./pages/admin/AdminAdvancedSettings"));
const AdminEffects = lazy(() => import("./pages/admin/AdminEffects"));
const AdminAnnouncement = lazy(() => import("./pages/admin/AdminAnnouncement"));
const AdminSpecialOffers = lazy(() => import("./pages/admin/AdminSpecialOffers"));

// Suspense fallback for lazy loaded components
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      <p className="text-muted-foreground text-sm">جاري التحميل...</p>
    </div>
  </div>
);

const AnimatedEffectsWrapper = () => {
  const { settings } = useSettings();
  return <AnimatedEffects effect={settings?.animation_effect || null} />;
};

const FaviconWrapper = () => {
  return <FaviconManager />;
};

const LoadingWrapper = () => {
  return <LoadingScreen />;
};

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <SupabaseProvider>
          <BrowserRouter>
            <SetupGuard>
            <AuthProvider>
              <SettingsProvider>
                <CartProvider>
                  <FavoritesProvider>
                    <TooltipProvider>
                    <LoadingWrapper />
                    <AnimatedEffectsWrapper />
                    <FaviconWrapper />
                    <Toaster />
                    <Sonner />
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Setup Routes */}
                        <Route path="/setup" element={<Setup />} />
                        <Route path="/create-admin" element={<CreateAdmin />} />

                        {/* Public Routes - Critical (eager) */}
                        <Route path="/" element={<Home />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/checkout" element={<Checkout />} />

                        {/* Public Routes - Non-critical (lazy) */}
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/my-orders" element={<MyOrders />} />
                        <Route path="/deals" element={<Deals />} />
                        <Route path="/products" element={<AllProducts />} />
                        <Route path="/brands" element={<Brands />} />
                        <Route path="/brand/:id" element={<BrandProducts />} />
                        <Route path="/category/:id" element={<Category />} />
                        <Route path="/special-offers" element={<SpecialOffers />} />
                        <Route path="/special-offer/:id" element={<SpecialOfferDetail />} />
                        <Route path="/auth" element={<Auth />} />

                        {/* Admin Routes - Fully lazy loaded */}
                        <Route path="/admin123" element={<AdminLogin secretAccess />} />
                        <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                          <Route path="products" element={<AdminProducts />} />
                          <Route path="categories" element={<AdminCategories />} />
                          <Route path="brands" element={<AdminBrands />} />
                          <Route path="orders" element={<AdminOrders />} />
                          <Route path="settings" element={<AdminSettings />} />
                          <Route path="promo-codes" element={<AdminPromoCodes />} />
                          <Route path="gifts" element={<AdminGifts />} />
                          <Route path="analytics" element={<AdminAnalytics />} />
                          <Route path="display" element={<AdminDisplay />} />
                          <Route path="advanced" element={<AdminAdvancedSettings />} />
                          <Route path="effects" element={<AdminEffects />} />
                          <Route path="announcement" element={<AdminAnnouncement />} />
                          <Route path="special-offers" element={<AdminSpecialOffers />} />
                        </Route>

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    </TooltipProvider>
                  </FavoritesProvider>
                </CartProvider>
              </SettingsProvider>
            </AuthProvider>
            </SetupGuard>
          </BrowserRouter>
        </SupabaseProvider>
      </ConfigProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
