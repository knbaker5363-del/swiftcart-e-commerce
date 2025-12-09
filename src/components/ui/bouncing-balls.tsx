import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface BouncingBallsProps {
  className?: string;
  ballCount?: number;
  colors?: string[];
  minRadius?: number;
  maxRadius?: number;
  speed?: number;
}

export const BouncingBalls = ({
  className,
  ballCount = 5,
  colors = ['#6366f1', '#8b5cf6', '#60a5fa', '#34d399', '#f472b6'],
  minRadius = 20,
  maxRadius = 40,
  speed = 1,
}: BouncingBallsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize balls
    ballsRef.current = Array.from({ length: ballCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2 * speed,
      vy: (Math.random() - 0.5) * 2 * speed,
      radius: Math.random() * (maxRadius - minRadius) + minRadius,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ballsRef.current.forEach((ball) => {
        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off walls
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
          ball.vx *= -1;
          ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
        }
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
          ball.vy *= -1;
          ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
        }

        // Draw ball with gradient
        const gradient = ctx.createRadialGradient(
          ball.x - ball.radius * 0.3,
          ball.y - ball.radius * 0.3,
          0,
          ball.x,
          ball.y,
          ball.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, ball.color);
        gradient.addColorStop(1, ball.color);

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();

        // Add glow effect
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ballCount, colors, minRadius, maxRadius, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 w-full h-full pointer-events-none opacity-30', className)}
    />
  );
};
