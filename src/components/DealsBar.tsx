import { Link } from 'react-router-dom';
import { Tag, Percent, ArrowLeft, Sparkles, Gift, Flame, Star, Zap } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const iconMap: Record<string, any> = {
  Percent,
  Tag,
  Sparkles,
  Gift,
  Flame,
  Star,
  Zap,
};

const DealsBar = () => {
  const { settings } = useSettings();
  const showButton = (settings as any)?.show_deals_button !== false;
  const buttonName = (settings as any)?.deals_button_name || 'كافة الخصومات';
  const iconName = (settings as any)?.deals_button_icon || 'Percent';

  if (!showButton) return null;

  const IconComponent = iconMap[iconName] || Percent;

  return (
    <Link to="/deals" className="block flex-1">
      <div className="relative bg-gradient-to-l from-red-500 to-rose-600 rounded-xl px-3 py-2.5 md:px-4 md:py-3 shadow-lg border-2 border-red-400/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden h-full">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-12 h-12 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative flex items-center justify-between text-white h-full">
          <div className="flex items-center gap-2">
            <div className="bg-white/25 p-1.5 md:p-2 rounded-lg border border-white/40 shadow-md">
              <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <h3 className="text-sm md:text-base font-bold">{buttonName}</h3>
          </div>
          <div className="bg-white/25 p-1 md:p-1.5 rounded-full border border-white/40 group-hover:bg-white/40 transition-all group-hover:translate-x-1">
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DealsBar;
