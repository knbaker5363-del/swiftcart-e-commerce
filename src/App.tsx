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
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { SetupGuard } from "@/components/SetupGuard";
import AnimatedEffects from "@/components/AnimatedEffects";
import FaviconManager from "@/components/FaviconManager";
import LoadingScreen from "@/components/LoadingScreen";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Favorites from "./pages/Favorites";
import MyOrders from "./pages/MyOrders";
import Deals from "./pages/Deals";
import AllProducts from "./pages/AllProducts";
import Brands from "./pages/Brands";
import Category from "./pages/Category";
import Auth from "./pages/Auth";
import Setup from "./pages/Setup";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import AdminGifts from "./pages/admin/AdminGifts";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import NotFound from "./pages/NotFound";

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
  <QueryClientProvider client={queryClient}>
    <ConfigProvider>
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
                    <Routes>
                      {/* Setup Route */}
                      <Route path="/setup" element={<Setup />} />

                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/my-orders" element={<MyOrders />} />
                      <Route path="/deals" element={<Deals />} />
                      <Route path="/products" element={<AllProducts />} />
                      <Route path="/brands" element={<Brands />} />
                      <Route path="/category/:id" element={<Category />} />
                      <Route path="/auth" element={<Auth />} />

                      {/* Admin Routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="brands" element={<AdminBrands />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="promo-codes" element={<AdminPromoCodes />} />
                        <Route path="gifts" element={<AdminGifts />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                      </Route>

                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TooltipProvider>
                </FavoritesProvider>
              </CartProvider>
            </SettingsProvider>
          </AuthProvider>
        </SetupGuard>
      </BrowserRouter>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
