import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface ExclusiveOfferBadgeProps {
  label: string;
  description: string;
  className?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  primary: {
    container: 'border-primary/30 bg-primary/10',
    badge: 'bg-primary text-primary-foreground',
    text: 'text-primary',
  },
  success: {
    container: 'border-green-500/30 bg-green-500/10',
    badge: 'bg-green-500 text-white',
    text: 'text-green-600 dark:text-green-400',
  },
  warning: {
    container: 'border-orange-500/30 bg-orange-500/10',
    badge: 'bg-orange-500 text-white',
    text: 'text-orange-600 dark:text-orange-400',
  },
  danger: {
    container: 'border-red-500/30 bg-red-500/10',
    badge: 'bg-red-500 text-white',
    text: 'text-red-600 dark:text-red-400',
  },
};

export const ExclusiveOfferBadge = ({
  label,
  description,
  className,
  variant = 'primary',
}: ExclusiveOfferBadgeProps) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 border rounded-full p-1 text-sm animate-in fade-in slide-in-from-top-2 duration-500',
        styles.container,
        className
      )}
    >
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium',
          styles.badge
        )}
      >
        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
        <span>{label}</span>
      </div>
      <p className={cn('pr-3 text-sm font-medium', styles.text)}>{description}</p>
    </div>
  );
};
