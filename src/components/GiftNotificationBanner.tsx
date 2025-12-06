import { Gift } from 'lucide-react';

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

  return (
    <div className={`rounded-lg p-4 mb-4 ${isEligible ? 'bg-green-50 border border-green-200' : 'bg-primary/5 border border-primary/20'}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-full ${isEligible ? 'bg-green-100' : 'bg-primary/10'}`}>
          <Gift className={`h-5 w-5 ${isEligible ? 'text-green-600' : 'text-primary'}`} />
        </div>
        <div className="flex-1">
          {isEligible ? (
            <p className="font-semibold text-green-700">
              🎉 مبروك! يمكنك اختيار هدية مجانية
            </p>
          ) : (
            <p className="font-semibold text-foreground">
              أضف منتجات بقيمة {remainingAmount.toFixed(0)} ₪ للحصول على هدية!
            </p>
          )}
        </div>
      </div>
      
      {!isEligible && (
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 right-0 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {isEligible 
          ? 'ستظهر لك قائمة الهدايا عند إتمام الطلب'
          : `اشترِ بـ ${minimumAmount} ₪ واحصل على هدية مجانية`
        }
      </p>
    </div>
  );
};
