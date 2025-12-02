import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const BrandsSection = () => {
  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">البراندات الخاصة بنا</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6">البراندات الخاصة بنا</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/brands/${brand.id}`}
              className="group"
            >
              <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-3">
                <div className="aspect-square mb-2 flex items-center justify-center bg-background">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm text-center line-clamp-1">{brand.name}</h3>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
