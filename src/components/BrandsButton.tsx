import { Link } from 'react-router-dom';
import { Store, ArrowLeft, Award } from 'lucide-react';

const BrandsButton = () => {
  return (
    <section className="py-6">
      <div className="container">
        <Link to="/brands">
          <div className="relative bg-accent rounded-2xl px-6 py-5 shadow-lg border-4 border-accent-foreground/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent-foreground rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-foreground rounded-full -translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative flex items-center justify-between text-accent-foreground">
              <div className="flex items-center gap-4">
                <div className="bg-accent-foreground/25 p-3 rounded-xl border-2 border-accent-foreground/40 shadow-md">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">البراندات الخاصة بنا</h3>
                  <p className="text-sm opacity-90 mt-1">تصفح جميع البراندات المتوفرة لدينا</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-sm font-medium opacity-90">اضغط للمشاهدة</span>
                <div className="bg-accent-foreground/25 p-2.5 rounded-full border-2 border-accent-foreground/40 group-hover:bg-accent-foreground/40 transition-all group-hover:translate-x-1">
                  <ArrowLeft className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default BrandsButton;
