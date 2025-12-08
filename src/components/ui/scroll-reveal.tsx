import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "zoom" | "fade";
  delay?: number;
  duration?: number;
  once?: boolean;
}

const ScrollReveal = React.forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({ className, children, direction = "up", delay = 0, duration = 600, once = true, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const elementRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once && elementRef.current) {
              observer.unobserve(elementRef.current);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }, [once]);

    const getInitialStyles = () => {
      switch (direction) {
        case "up": return { transform: "translateY(40px)", opacity: 0 };
        case "down": return { transform: "translateY(-40px)", opacity: 0 };
        case "left": return { transform: "translateX(40px)", opacity: 0 };
        case "right": return { transform: "translateX(-40px)", opacity: 0 };
        case "zoom": return { transform: "scale(0.8)", opacity: 0 };
        case "fade": return { opacity: 0 };
        default: return { opacity: 0 };
      }
    };

    const getVisibleStyles = () => ({
      transform: "translateY(0) translateX(0) scale(1)",
      opacity: 1,
    });

    return (
      <div
        ref={elementRef}
        className={cn("transition-all ease-out", className)}
        style={{
          ...(isVisible ? getVisibleStyles() : getInitialStyles()),
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollReveal.displayName = "ScrollReveal";

export { ScrollReveal };
