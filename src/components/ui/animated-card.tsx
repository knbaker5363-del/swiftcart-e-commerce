import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: string;
  enableTilt?: boolean;
  enableGlow?: boolean;
  enableBorderGlow?: boolean;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, glowColor = "primary", enableTilt = true, enableGlow = true, enableBorderGlow = false, ...props }, ref) => {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const [transform, setTransform] = React.useState("");
    const [glowPosition, setGlowPosition] = React.useState({ x: 50, y: 50 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !enableTilt) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
      setGlowPosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    };

    const handleMouseLeave = () => {
      setTransform("");
      setGlowPosition({ x: 50, y: 50 });
    };

    return (
      <div
        ref={cardRef}
        className={cn(
          "relative group overflow-hidden rounded-xl transition-all duration-300 ease-out",
          enableBorderGlow && "animated-border-glow",
          className
        )}
        style={{ transform }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Glow effect */}
        {enableGlow && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
            style={{
              background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, hsl(var(--${glowColor}) / 0.15) 0%, transparent 50%)`,
            }}
          />
        )}
        
        {/* Content */}
        <div ref={ref} className="relative z-20">
          {children}
        </div>
      </div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };
