import { Link } from 'react-router-dom';
import { Package, Award } from 'lucide-react';
import { Button } from './ui/button';

const QuickLinks = () => {
  return (
    <section className="bg-background py-6">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* All Products */}
          <Link to="/products">
            <Button
              variant="outline"
              className="w-full h-20 text-lg font-bold hover:scale-105 transition-transform"
            >
              <Package className="ml-3 h-6 w-6" />
              كافة المنتجات
            </Button>
          </Link>

          {/* Brands */}
          <Link to="/brands">
            <Button
              variant="outline"
              className="w-full h-20 text-lg font-bold hover:scale-105 transition-transform"
            >
              <Award className="ml-3 h-6 w-6" />
              العلامات التجارية
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;