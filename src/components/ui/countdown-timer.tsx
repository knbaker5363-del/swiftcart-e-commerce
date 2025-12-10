import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiresAt: string | Date;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
  onExpired?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

const calculateTimeLeft = (expiresAt: Date): TimeLeft => {
  const now = new Date().getTime();
  const target = expiresAt.getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    expired: false,
  };
};

export function CountdownTimer({ 
  expiresAt, 
  size = 'md', 
  showLabels = true,
  className,
  onExpired 
}: CountdownTimerProps) {
  const targetDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.expired && onExpired) {
        onExpired();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpired]);

  if (timeLeft.expired) {
    return (
      <div className={cn(
        "text-destructive font-bold animate-pulse",
        size === 'sm' && "text-xs",
        size === 'md' && "text-sm",
        size === 'lg' && "text-lg",
        className
      )}>
        انتهى العرض
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;
  const isVeryUrgent = timeLeft.days === 0 && timeLeft.hours < 1;

  const sizeClasses = {
    sm: {
      container: "gap-1",
      box: "min-w-[28px] px-1 py-0.5",
      number: "text-xs font-bold",
      label: "text-[8px]",
    },
    md: {
      container: "gap-2",
      box: "min-w-[40px] px-2 py-1",
      number: "text-sm font-bold",
      label: "text-[10px]",
    },
    lg: {
      container: "gap-3",
      box: "min-w-[60px] px-3 py-2",
      number: "text-xl font-bold",
      label: "text-xs",
    },
  };

  const classes = sizeClasses[size];

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className={cn(
        classes.box,
        "rounded-lg text-center transition-all",
        isVeryUrgent 
          ? "bg-destructive text-destructive-foreground animate-pulse" 
          : isUrgent 
            ? "bg-orange-500 text-white" 
            : "bg-primary text-primary-foreground"
      )}>
        <span className={classes.number}>
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      {showLabels && (
        <span className={cn(classes.label, "text-muted-foreground mt-0.5")}>
          {label}
        </span>
      )}
    </div>
  );

  return (
    <div className={cn("flex items-center", classes.container, className)} dir="ltr">
      {timeLeft.days > 0 && <TimeBox value={timeLeft.days} label="يوم" />}
      <TimeBox value={timeLeft.hours} label="ساعة" />
      <TimeBox value={timeLeft.minutes} label="دقيقة" />
      <TimeBox value={timeLeft.seconds} label="ثانية" />
    </div>
  );
}

// Compact version for cards
export function CountdownBadge({ 
  expiresAt, 
  className 
}: { 
  expiresAt: string | Date; 
  className?: string;
}) {
  const targetDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.expired) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive text-destructive-foreground",
        className
      )}>
        انتهى
      </span>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

  const formatTime = () => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days} يوم ${timeLeft.hours} س`;
    }
    if (timeLeft.hours > 0) {
      return `${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`;
    }
    return `${timeLeft.minutes}:${timeLeft.seconds.toString().padStart(2, '0')}`;
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      isUrgent 
        ? "bg-orange-500 text-white animate-pulse" 
        : "bg-primary/10 text-primary",
      className
    )} dir="ltr">
      ⏰ {formatTime()}
    </span>
  );
}
