import { HiSparkles } from 'react-icons/hi2';
import { PiGiftFill, PiStarFourFill, PiFireFill, PiCrownFill } from 'react-icons/pi';
import { IoSparkles, IoRibbonSharp } from 'react-icons/io5';
import { GiftIcon, GiftIconStyleType } from '@/components/ui/gift-icon';
import { useSettings } from '@/contexts/SettingsContext';

interface GiftNotificationBannerProps {
  currentAmount: number;
  minimumAmount: number;
  remainingAmount: number;
}

export const GiftNotificationBanner = ({
  currentAmount,
  minimumAmount,
  remainingAmount,
}: GiftNotificationBannerProps) => {
  const { settings } = useSettings();
  const progress = Math.min((currentAmount / minimumAmount) * 100, 100);
  const isEligible = currentAmount >= minimumAmount;
  const isClose = progress >= 70 && !isEligible;
  
  const giftIconStyle = ((settings as any)?.gift_icon_style || 'pink-gold') as GiftIconStyleType;

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl p-5 mb-4 
        backdrop-blur-sm border-2 transition-all duration-500
        ${isEligible 
          ? 'bg-gradient-to-r from-emerald-500/20 via-green-400/20 to-teal-500/20 border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
          : 'bg-gradient-to-r from-primary/15 via-purple-500/15 to-pink-500/15 border-primary/30 shadow-lg'
        }
      `}
    >
      {/* Animated background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

      <div className="relative z-10 flex items-center gap-4">
        {/* Gift Icon */}
        <div 
          className={`
            relative transition-all duration-300 flex-shrink-0
            ${isEligible ? 'scale-110' : isClose ? 'scale-105' : 'scale-100'}
          `}
        >
          <GiftIcon 
            size="md" 
            animated={true}
            style={giftIconStyle}
            glowColor={isEligible ? '#10B981' : isClose ? '#F97316' : undefined}
          />
          
          {/* Extra sparkle effect when eligible */}
          {isEligible && (
            <div className="absolute -inset-2">
              <HiSparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
              <HiSparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-amber-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          )}
        </div>

        <div className="flex-1">
          {isEligible ? (
            <div className="flex items-center gap-2 flex-wrap">
              <HiSparkles className="h-5 w-5 text-yellow-400" />
              <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                مبروك! يمكنك اختيار هدية مجانية
              </p>
              <PiCrownFill className="h-5 w-5 text-yellow-500" />
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {isClose && <PiFireFill className="h-5 w-5 text-orange-500" />}
              <p className="font-bold text-base text-foreground">
                أضف منتجات بقيمة <span className={`font-extrabold text-lg ${isClose ? 'text-orange-500' : 'text-primary'}`}>{remainingAmount.toFixed(0)} ₪</span> للحصول على هدية!
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Progress Bar */}
      {!isEligible && (
        <div className="relative mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2 font-semibold">
            <span className="flex items-center gap-1">
              <IoRibbonSharp className="h-3 w-3" />
              {currentAmount.toFixed(0)} ₪
            </span>
            <span className="flex items-center gap-1">
              <PiGiftFill className="h-4 w-4 text-primary" />
              {minimumAmount.toFixed(0)} ₪
            </span>
          </div>
          
          <div className="relative h-4 bg-muted/50 rounded-full overflow-hidden border border-border/50">
            {/* Progress fill */}
            <div
              className={`
                absolute inset-y-0 right-0 rounded-full transition-all duration-500 ease-out
                ${isClose 
                  ? 'bg-gradient-to-l from-orange-500 via-amber-400 to-yellow-500' 
                  : 'bg-gradient-to-l from-primary via-purple-500 to-pink-500'
                }
              `}
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect on progress */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>
            
            {/* Gift icon at the end of progress */}
            {progress > 0 && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 z-10"
                style={{ left: `calc(${Math.min(progress, 92)}% - 10px)` }}
              >
                <GiftIcon size="sm" animated={false} style={giftIconStyle} glowColor="transparent" />
              </div>
            )}
          </div>
          
          {/* Progress percentage */}
          <div className="text-center mt-3">
            <span className={`
              inline-flex items-center gap-2 text-sm font-bold px-4 py-1.5 rounded-full
              ${isClose 
                ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400 border border-orange-400/30' 
                : 'bg-primary/10 text-primary border border-primary/20'
              }
            `}>
              {isClose ? <PiFireFill className="h-4 w-4" /> : <PiStarFourFill className="h-4 w-4" />}
              {progress.toFixed(0)}% {isClose ? 'قريب جداً!' : 'من الهدف'}
            </span>
          </div>
        </div>
      )}
      
      {/* Achievement message */}
      <div className={`
        relative z-10 flex items-center justify-center gap-2 mt-3 text-sm font-medium
        ${isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}
      `}>
        {isEligible ? (
          <>
            <IoSparkles className="h-4 w-4 text-yellow-400" />
            <span>ستظهر لك قائمة الهدايا عند إتمام الطلب</span>
            <IoSparkles className="h-4 w-4 text-yellow-400" />
          </>
        ) : (
          <>
            <PiStarFourFill className="h-4 w-4 text-primary" />
            <span>اشترِ بـ {minimumAmount} ₪ واحصل على هدية مجانية</span>
            <PiGiftFill className="h-4 w-4 text-primary" />
          </>
        )}
      </div>
    </div>
  );
};