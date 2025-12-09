import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface ConfettiEffectProps {
  active?: boolean;
  duration?: number;
  particleCount?: number;
  className?: string;
}

const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#dfe6e9', '#fd79a8', '#a29bfe', '#74b9ff', '#00b894',
];

export const ConfettiEffect = ({
  active = false,
  duration = 3000,
  particleCount = 50,
  className,
}: ConfettiEffectProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setIsVisible(true);
      
      // Generate particles
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 30,
        y: -10,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        speedX: (Math.random() - 0.5) * 8,
        speedY: Math.random() * 3 + 2,
        opacity: 1,
      }));

      setParticles(newParticles);

      // Hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, particleCount]);

  if (!isVisible || particles.length === 0) return null;

  return (
    <div className={cn('fixed inset-0 pointer-events-none z-50 overflow-hidden', className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            '--speed-x': particle.speedX,
            '--speed-y': particle.speedY,
            '--rotation-speed': particle.rotationSpeed,
            animationDuration: `${duration}ms`,
          } as React.CSSProperties}
        />
      ))}
      
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(calc(var(--speed-x) * 50px)) rotate(calc(var(--rotation-speed) * 360deg));
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti-fall var(--duration, 3s) ease-out forwards;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};
