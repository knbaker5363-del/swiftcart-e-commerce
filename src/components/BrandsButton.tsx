import { Link } from 'react-router-dom';
import { Store, ChevronLeft } from 'lucide-react';

const BrandsButton = () => {
  return (
    <section className="py-6">
      <div className="container">
        <Link to="/brands">
          <div className="bg-accent rounded-2xl px-6 py-4 shadow-lg border-2 border-accent-foreground/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between text-accent-foreground">
              <div className="flex items-center gap-4">
                <div className="bg-accent-foreground/20 p-3 rounded-xl">
                  <Store className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">البراندات الخاصة بنا</h3>
                  <p className="text-sm opacity-90">تصفح جميع البراندات المتوفرة لدينا</p>
                </div>
              </div>
              <div className="bg-accent-foreground/20 p-2 rounded-full group-hover:bg-accent-foreground/30 transition-colors">
                <ChevronLeft className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default BrandsButton;
