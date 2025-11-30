import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FavoritesContextType {
  favorites: string[]; // product IDs
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // استرجاع المفضلة من قاعدة البيانات
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // إذا لم يكن مسجل دخول، استخدم localStorage
          const localFavorites = localStorage.getItem('favorites');
          if (localFavorites) {
            setFavorites(JSON.parse(localFavorites));
          }
          setLoading(false);
          return;
        }

        setUserId(user.id);

        const { data, error } = await supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', user.id);

        if (error) throw error;

        const favoriteIds = data?.map(f => f.product_id) || [];
        setFavorites(favoriteIds);
        
        // مزامنة مع localStorage إذا كان هناك مفضلات محلية
        const localFavorites = localStorage.getItem('favorites');
        if (localFavorites) {
          const localIds = JSON.parse(localFavorites);
          // إضافة المفضلات المحلية إلى قاعدة البيانات
          for (const productId of localIds) {
            if (!favoriteIds.includes(productId)) {
              await supabase.from('favorites').insert({
                user_id: user.id,
                product_id: productId
              });
            }
          }
          localStorage.removeItem('favorites');
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    // الاستماع لتغييرات تسجيل الدخول
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadFavorites();
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleFavorite = async (productId: string) => {
    const isFav = favorites.includes(productId);

    try {
      if (!userId) {
        // إذا لم يكن مسجل دخول، استخدم localStorage
        const newFavorites = isFav
          ? favorites.filter(id => id !== productId)
          : [...favorites, productId];
        
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        
        toast({
          title: isFav ? 'تم إزالة المنتج من المفضلة' : 'تم إضافة المنتج إلى المفضلة',
        });
        return;
      }

      if (isFav) {
        // حذف من المفضلة
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) throw error;

        setFavorites(favorites.filter(id => id !== productId));
        toast({
          title: 'تم إزالة المنتج من المفضلة',
        });
      } else {
        // إضافة إلى المفضلة
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: userId,
            product_id: productId
          });

        if (error) throw error;

        setFavorites([...favorites, productId]);
        toast({
          title: 'تم إضافة المنتج إلى المفضلة',
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'حدث خطأ',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};