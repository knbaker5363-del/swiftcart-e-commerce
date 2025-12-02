import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

const BrandsButton = () => {
  return (
    <section className="bg-gradient-to-r from-primary/90 to-primary py-4">
      <div className="container">
        <Link to="/brands">
          <div className="flex items-center justify-center gap-4 text-primary-foreground hover:scale-105 transition-transform cursor-pointer">
            <Store className="h-6 w-6" />
            <div className="text-center">
              <h3 className="text-2xl font-bold">البراندات الخاصة بنا</h3>
              <p className="text-sm opacity-90">تصفح جميع البراندات المتوفرة لدينا</p>
            </div>
            <Store className="h-6 w-6" />
          </div>
        </Link>
      </div>
    </section>
  );
};

export default BrandsButton;
