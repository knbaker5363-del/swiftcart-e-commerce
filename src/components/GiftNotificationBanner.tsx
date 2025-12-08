import { Gift, Sparkles, PartyPopper } from 'lucide-react';

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
  const progress = Math.min((currentAmount / minimumAmount) * 100, 100);
  const isEligible = currentAmount >= minimumAmount;
  const isClose = progress >= 70 && !isEligible;

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
      
      {/* Confetti effect when eligible */}
      {isEligible && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-4 text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🎊</div>
          <div className="absolute top-3 right-6 text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
          <div className="absolute bottom-2 left-8 text-lg animate-bounce" style={{ animationDelay: '0.4s' }}>🎉</div>
          <div className="absolute bottom-3 right-4 text-xl animate-bounce" style={{ animationDelay: '0.3s' }}>⭐</div>
        </div>
      )}

      <div className="relative z-10 flex items-center gap-4">
        {/* Animated Gift Icon */}
        <div 
          className={`
            relative p-4 rounded-2xl transition-all duration-300
            ${isEligible 
              ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-[0_0_25px_rgba(16,185,129,0.5)]' 
              : 'bg-gradient-to-br from-primary to-purple-600 shadow-[0_0_20px_rgba(var(--primary),0.4)]'
            }
          `}
        >
          {isEligible ? (
            <PartyPopper className="h-7 w-7 text-white animate-bounce" />
          ) : (
            <Gift className={`h-7 w-7 text-white ${isClose ? 'animate-pulse' : 'animate-bounce'}`} />
          )}
          
          {/* Glow ring */}
          <div className={`
            absolute inset-0 rounded-2xl animate-ping opacity-30
            ${isEligible ? 'bg-emerald-400' : 'bg-primary'}
          `} style={{ animationDuration: '2s' }} />
        </div>

        <div className="flex-1">
          {isEligible ? (
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                مبروك! يمكنك اختيار هدية مجانية 🎁
              </p>
            </div>
          ) : (
            <p className="font-bold text-base text-foreground">
              {isClose ? '🔥 ' : '🎁 '}
              أضف منتجات بقيمة <span className="text-primary font-extrabold text-lg">{remainingAmount.toFixed(0)} ₪</span> للحصول على هدية!
            </p>
          )}
        </div>
      </div>
      
      {/* Enhanced Progress Bar */}
      {!isEligible && (
        <div className="relative mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2 font-semibold">
            <span>{currentAmount.toFixed(0)} ₪</span>
            <span className="flex items-center gap-1">
              <Gift className="h-3 w-3" />
              {minimumAmount.toFixed(0)} ₪
            </span>
          </div>
          
          <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden border border-border/50">
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
            
            {/* Milestone markers */}
            <div className="absolute inset-0 flex justify-between px-1">
              {[25, 50, 75].map((milestone) => (
                <div 
                  key={milestone}
                  className={`w-0.5 h-full ${progress >= milestone ? 'bg-white/50' : 'bg-muted-foreground/20'}`}
                  style={{ marginRight: `${milestone}%` }}
                />
              ))}
            </div>
          </div>
          
          {/* Progress percentage */}
          <div className="text-center mt-2">
            <span className={`
              text-sm font-bold px-3 py-1 rounded-full
              ${isClose 
                ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' 
                : 'bg-primary/20 text-primary'
              }
            `}>
              {progress.toFixed(0)}% {isClose ? '🔥 قريب جداً!' : 'من الهدف'}
            </span>
          </div>
        </div>
      )}
      
      {/* Achievement message */}
      <p className={`
        relative z-10 text-sm mt-3 text-center font-medium
        ${isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}
      `}>
        {isEligible 
          ? '✨ ستظهر لك قائمة الهدايا عند إتمام الطلب ✨'
          : `💫 اشترِ بـ ${minimumAmount} ₪ واحصل على هدية مجانية`
        }
      </p>
    </div>
  );
};
