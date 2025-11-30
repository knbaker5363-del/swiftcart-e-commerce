import { useState } from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { CartDrawer } from '@/components/CartDrawer';
import { Card } from '@/components/ui/card';
import { Award } from 'lucide-react';

const Brands = () => {
  const [cartOpen, setCartOpen] = useState(false);

  // علامات تجارية تجريبية - يمكن ربطها بقاعدة البيانات لاحقاً
  const brands = [
    { id: 1, name: 'Adidas', logo: 'https://images.unsplash.com/photo-1556906781-9a412961c28c' },
    { id: 2, name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
    { id: 3, name: 'Puma', logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5' },
    { id: 4, name: 'Reebok', logo: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329' },
    { id: 5, name: 'Under Armour', logo: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa' },
    { id: 6, name: 'New Balance', logo: 'https://images.unsplash.com/photo-1539185441755-769473a23570' },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <PublicHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

      {/* Header */}
      <section className="bg-gradient-primary text-primary-foreground py-12">
        <div className="container">
          <div className="flex items-center justify-center gap-4 animate-fade-in">
            <Award className="h-12 w-12" />
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">العلامات التجارية</h1>
              <p className="text-lg opacity-90">
                تسوق من أفضل العلامات التجارية العالمية
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {brands.map((brand) => (
              <Card
                key={brand.id}
                className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="aspect-square p-6 flex items-center justify-center bg-white">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 bg-card">
                  <h3 className="font-bold text-center text-lg">{brand.name}</h3>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-12 text-center max-w-2xl mx-auto">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">نوفر لك أفضل العلامات التجارية</h3>
              <p className="text-muted-foreground">
                نحن نعمل مع أشهر العلامات التجارية العالمية لنوفر لك منتجات عالية الجودة وأصلية بأفضل الأسعار
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Brands;