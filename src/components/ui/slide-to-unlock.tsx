import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, Check } from 'lucide-react';

interface SlideToUnlockProps {
  onUnlock: () => void;
  label?: string;
  unlockLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const SlideToUnlock = ({
  onUnlock,
  label = 'اسحب لإتمام الطلب',
  unlockLabel = 'تم!',
  className,
  disabled = false,
}: SlideToUnlockProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const handleStart = (clientX: number) => {
    if (disabled || isUnlocked) return;
    setIsDragging(true);
    startXRef.current = clientX - position;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !containerRef.current || disabled) return;

    const containerWidth = containerRef.current.offsetWidth;
    const maxPosition = containerWidth - 56; // thumb width
    const newPosition = Math.max(0, Math.min(clientX - startXRef.current, maxPosition));
    setPosition(newPosition);

    // Check if unlocked (90% of the way)
    if (newPosition >= maxPosition * 0.9) {
      setIsUnlocked(true);
      setIsDragging(false);
      setPosition(maxPosition);
      setTimeout(onUnlock, 300);
    }
  };

  const handleEnd = () => {
    if (!isUnlocked) {
      setPosition(0);
    }
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientX);
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleMouseUp = () => handleEnd();

  const handleTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleEnd();

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-14 rounded-full overflow-hidden cursor-pointer select-none',
        isUnlocked
          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
          : 'bg-gradient-to-r from-primary/80 to-primary',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Track background with shimmer */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
            !isUnlocked && 'animate-shimmer'
          )}
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>

      {/* Progress fill */}
      <div
        className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-75"
        style={{ width: position + 56 }}
      />

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
        {isUnlocked ? (
          <span className="flex items-center gap-2 animate-in fade-in duration-300">
            <Check className="h-5 w-5" />
            {unlockLabel}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {label}
            <ChevronLeft className="h-5 w-5 animate-bounce-x" />
          </span>
        )}
      </div>

      {/* Draggable thumb */}
      <div
        className={cn(
          'absolute top-1 bottom-1 w-12 rounded-full flex items-center justify-center transition-all',
          isUnlocked
            ? 'bg-white text-green-600'
            : 'bg-white text-primary shadow-lg',
          isDragging && 'scale-110'
        )}
        style={{
          right: position,
          transition: isDragging ? 'none' : 'right 0.3s ease',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {isUnlocked ? (
          <Check className="h-6 w-6" />
        ) : (
          <ChevronLeft className="h-6 w-6" />
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
      `}</style>
    </div>
  );
};
