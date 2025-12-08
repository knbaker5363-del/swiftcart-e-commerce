import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  delay?: number;
  type?: "fade" | "slide" | "typewriter" | "gradient" | "wave";
}

const AnimatedText = React.forwardRef<HTMLSpanElement, AnimatedTextProps>(
  ({ className, text, delay = 0, type = "fade", ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [typedText, setTypedText] = React.useState("");
    const elementRef = React.useRef<HTMLSpanElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay);
          }
        },
        { threshold: 0.1 }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }, [delay]);

    React.useEffect(() => {
      if (type === "typewriter" && isVisible) {
        let index = 0;
        const interval = setInterval(() => {
          setTypedText(text.slice(0, index + 1));
          index++;
          if (index >= text.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
      }
    }, [isVisible, text, type]);

    if (type === "wave") {
      return (
        <span ref={elementRef} className={cn("inline-flex", className)} {...props}>
          {text.split("").map((char, index) => (
            <span
              key={index}
              className={cn(
                "inline-block transition-transform",
                isVisible && "animate-wave"
              )}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                opacity: isVisible ? 1 : 0
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      );
    }

    if (type === "gradient") {
      return (
        <span
          ref={elementRef}
          className={cn(
            "inline-block bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-x",
            "bg-clip-text text-transparent",
            className
          )}
          {...props}
        >
          {text}
        </span>
      );
    }

    if (type === "typewriter") {
      return (
        <span ref={elementRef} className={cn("inline-block", className)} {...props}>
          {typedText}
          <span className="animate-blink">|</span>
        </span>
      );
    }

    return (
      <span
        ref={elementRef}
        className={cn(
          "inline-block transition-all duration-700",
          type === "fade" && (isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"),
          type === "slide" && (isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"),
          className
        )}
        {...props}
      >
        {text}
      </span>
    );
  }
);

AnimatedText.displayName = "AnimatedText";

export { AnimatedText };
