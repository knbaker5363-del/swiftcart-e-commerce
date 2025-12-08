import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glowButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border-2 border-primary bg-transparent text-primary",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-lg px-10",
        icon: "h-10 w-10",
      },
      glowEffect: {
        none: "",
        subtle: "hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
        medium: "hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]",
        strong: "hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)]",
        pulse: "animate-glow-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glowEffect: "medium",
    },
  }
);

export interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glowButtonVariants> {
  asChild?: boolean;
  showRipple?: boolean;
}

const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant, size, glowEffect, asChild = false, showRipple = true, children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<{ x: number; y: number; id: number }[]>([]);
    const Comp = asChild ? Slot : "button";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (showRipple) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        
        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }
      
      onClick?.(e);
    };

    return (
      <Comp
        className={cn(
          glowButtonVariants({ variant, size, glowEffect, className }),
          "transform hover:scale-105 active:scale-95"
        )}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {/* Shine effect */}
        <span className="absolute inset-0 overflow-hidden">
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </span>
        
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
        
        {/* Content */}
        <span className="relative z-10">{children}</span>
      </Comp>
    );
  }
);

GlowButton.displayName = "GlowButton";

export { GlowButton, glowButtonVariants };
