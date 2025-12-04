import { Link } from 'react-router-dom';
import { Tag, Sparkles, ChevronLeft, ArrowLeft } from 'lucide-react';

const DealsBar = () => {
  return (
    <section className="py-6">
      <div className="container">
        <Link to="/deals">
          <div className="relative bg-primary rounded-2xl px-6 py-5 shadow-lg border-4 border-primary-foreground/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-20 h-20 bg-primary-foreground rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-foreground rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-4">
                <div className="bg-primary-foreground/25 p-3 rounded-xl border-2 border-primary-foreground/40 shadow-md">
                  <Tag className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    <h3 className="text-2xl font-bold">العروض الخاصة</h3>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <p className="text-sm opacity-90 mt-1">اكتشف أفضل الخصومات والعروض الحصرية</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-sm font-medium opacity-90">اضغط للمشاهدة</span>
                <div className="bg-primary-foreground/25 p-2.5 rounded-full border-2 border-primary-foreground/40 group-hover:bg-primary-foreground/40 transition-all group-hover:translate-x-1">
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

export default DealsBar;
