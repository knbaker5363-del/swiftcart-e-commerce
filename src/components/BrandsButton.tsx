import { Link } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';

interface BrandsButtonProps {
  visible?: boolean;
}

const BrandsButton = ({ visible = true }: BrandsButtonProps) => {
  if (!visible) return null;
  
  return (
    <Link to="/brands" className="block">
      <div className="relative bg-accent rounded-xl px-4 py-3 md:px-6 md:py-5 shadow-lg border-2 border-accent-foreground/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-pointer group overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-accent-foreground rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-accent-foreground rounded-full -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative flex items-center justify-between text-accent-foreground">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-accent-foreground/25 p-2 md:p-3 rounded-xl border-2 border-accent-foreground/40 shadow-md">
              <Award className="h-5 w-5 md:h-8 md:w-8" />
            </div>
            <div>
              <h3 className="text-lg md:text-2xl font-bold">البراندات الخاصة بنا</h3>
              <p className="text-xs md:text-sm opacity-90 mt-0.5 md:mt-1 hidden sm:block">تصفح جميع البراندات المتوفرة لدينا</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-sm font-medium opacity-90">اضغط للمشاهدة</span>
            <div className="bg-accent-foreground/25 p-1.5 md:p-2.5 rounded-full border-2 border-accent-foreground/40 group-hover:bg-accent-foreground/40 transition-all group-hover:translate-x-1">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BrandsButton;
