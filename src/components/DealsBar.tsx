import { Link } from 'react-router-dom';
import { Tag, Sparkles } from 'lucide-react';

const DealsBar = () => {
  return (
    <section className="bg-gradient-primary py-4">
      <div className="container">
        <Link to="/deals">
          <div className="flex items-center justify-center gap-4 text-primary-foreground hover:scale-105 transition-transform cursor-pointer">
            <Sparkles className="h-6 w-6 animate-pulse" />
            <div className="flex items-center gap-3">
              <Tag className="h-8 w-8" />
              <div>
                <h3 className="text-2xl font-bold">العروض الخاصة</h3>
                <p className="text-sm opacity-90">اكتشف أفضل الخصومات والعروض الحصرية</p>
              </div>
            </div>
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
        </Link>
      </div>
    </section>
  );
};

export default DealsBar;