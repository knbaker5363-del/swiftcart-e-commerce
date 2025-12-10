import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Gift, Flame, Star, Zap, Heart, Crown } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const iconMap: Record<string, any> = {
  Sparkles,
  Gift,
  Flame,
  Star,
  Zap,
  Heart,
  Crown,
};

const OffersButton = () => {
  const { settings } = useSettings();
  const showButton = (settings as any)?.show_offers_button !== false;
  const buttonName = (settings as any)?.offers_button_name || 'العروض الخاصة بنا';
  const iconName = (settings as any)?.offers_button_icon || 'Sparkles';
  const buttonLink = '/special-offers';

  if (!showButton) return null;

  const IconComponent = iconMap[iconName] || Sparkles;

  return (
    <Link to={buttonLink} className="block flex-1">
      <div className="relative bg-gradient-to-l from-amber-500 to-orange-500 rounded-xl px-4 py-3 md:px-5 md:py-4 shadow-lg border-2 border-amber-400/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden h-full">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-12 h-12 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative flex items-center justify-between text-white h-full">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/25 p-2 md:p-2.5 rounded-lg border border-white/40 shadow-md">
              <IconComponent className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <h3 className="text-base md:text-lg font-bold">{buttonName}</h3>
          </div>
          <div className="bg-white/25 p-1.5 md:p-2 rounded-full border border-white/40 group-hover:bg-white/40 transition-all group-hover:translate-x-1">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OffersButton;
