import { Link } from 'react-router-dom';
import { Tag, Sparkles, ChevronLeft } from 'lucide-react';

const DealsBar = () => {
  return (
    <section className="py-6">
      <div className="container">
        <Link to="/deals">
          <div className="bg-primary rounded-2xl px-6 py-4 shadow-lg border-2 border-primary-foreground/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-4">
                <div className="bg-primary-foreground/20 p-3 rounded-xl">
                  <Tag className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    <h3 className="text-2xl font-bold">العروض الخاصة</h3>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <p className="text-sm opacity-90">اكتشف أفضل الخصومات والعروض الحصرية</p>
                </div>
              </div>
              <div className="bg-primary-foreground/20 p-2 rounded-full group-hover:bg-primary-foreground/30 transition-colors">
                <ChevronLeft className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default DealsBar;
