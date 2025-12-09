import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlowingCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  borderGlow?: boolean;
  hoverEffect?: boolean;
}

export const GlowingCard = ({
  children,
  className,
  glowColor = 'hsl(var(--primary))',
  borderGlow = true,
  hoverEffect = true,
}: GlowingCardProps) => {
  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden transition-all duration-500',
        hoverEffect && 'hover:scale-[1.02] hover:-translate-y-1',
        className
      )}
      style={{
        '--glow-color': glowColor,
      } as React.CSSProperties}
    >
      {/* Glowing border effect */}
      {borderGlow && (
        <div
          className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${glowColor}40, transparent 50%, ${glowColor}40)`,
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-border-glow opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative bg-card rounded-2xl border">
        {children}
      </div>

      <style>{`
        @keyframes border-glow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-border-glow {
          background-size: 200% 200%;
          animation: border-glow 3s ease infinite;
        }
      `}</style>
    </div>
  );
};
