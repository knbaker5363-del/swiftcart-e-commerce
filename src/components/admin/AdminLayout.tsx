import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { LogOut, Package, FolderOpen, ShoppingBag, Settings, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { to: '/admin/products', icon: Package, label: 'المنتجات' },
    { to: '/admin/categories', icon: FolderOpen, label: 'التصنيفات' },
    { to: '/admin/brands', icon: Award, label: 'العلامات التجارية' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'الطلبات' },
    { to: '/admin/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Sidebar */}
      <aside className="fixed right-0 top-0 h-full w-64 bg-card border-l shadow-card z-50">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            لوحة التحكم
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>

        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                'hover:bg-muted'
              )}
              activeClassName="bg-primary text-primary-foreground hover:bg-primary"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="mr-64 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;