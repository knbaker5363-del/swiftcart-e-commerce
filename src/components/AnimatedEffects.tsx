import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface AnimatedEffectsProps {
  effect: string | null;
}

const AnimatedEffects = ({ effect }: AnimatedEffectsProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!effect || effect === 'none') {
      setParticles([]);
      return;
    }

    const count = effect === 'snow' ? 50 : effect === 'stars' ? 30 : 25;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 4,
      });
    }
    
    setParticles(newParticles);
  }, [effect]);

  if (!effect || effect === 'none' || particles.length === 0) return null;

  const renderParticle = (particle: Particle) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${particle.x}%`,
      top: `-${particle.size}px`,
      animationDelay: `${particle.delay}s`,
      animationDuration: `${particle.duration}s`,
      pointerEvents: 'none',
    };

    switch (effect) {
      case 'snow':
        return (
          <div
            key={particle.id}
            className="animate-fall"
            style={{
              ...baseStyle,
              width: particle.size,
              height: particle.size,
              backgroundColor: 'white',
              borderRadius: '50%',
              boxShadow: '0 0 10px rgba(255,255,255,0.8)',
              opacity: 0.8,
            }}
          />
        );
      case 'stars':
        return (
          <div
            key={particle.id}
            className="animate-twinkle"
            style={{
              ...baseStyle,
              top: `${particle.y}%`,
              fontSize: particle.size,
              color: '#FFD700',
              textShadow: '0 0 10px #FFD700',
            }}
          >
            ★
          </div>
        );
      case 'hearts':
        return (
          <div
            key={particle.id}
            className="animate-fall"
            style={{
              ...baseStyle,
              fontSize: particle.size,
              color: '#FF6B9D',
            }}
          >
            ❤
          </div>
        );
      case 'confetti':
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        return (
          <div
            key={particle.id}
            className="animate-confetti"
            style={{
              ...baseStyle,
              width: particle.size,
              height: particle.size * 0.6,
              backgroundColor: colors[particle.id % colors.length],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      case 'bubbles':
        return (
          <div
            key={particle.id}
            className="animate-bubble"
            style={{
              ...baseStyle,
              top: '100%',
              width: particle.size,
              height: particle.size,
              border: '2px solid rgba(100, 200, 255, 0.5)',
              borderRadius: '50%',
              backgroundColor: 'rgba(100, 200, 255, 0.1)',
            }}
          />
        );
      case 'leaves':
        return (
          <div
            key={particle.id}
            className="animate-leaf"
            style={{
              ...baseStyle,
              fontSize: particle.size,
              color: '#8BC34A',
            }}
          >
            🍃
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none z-50"
      style={{ perspective: '1000px' }}
    >
      {particles.map(renderParticle)}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.3;
          }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes confetti {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes bubble {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) scale(1.5);
            opacity: 0;
          }
        }
        @keyframes leaf {
          0% {
            transform: translateY(-10px) translateX(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) translateX(30px) rotate(180deg);
          }
          100% {
            transform: translateY(100vh) translateX(-30px) rotate(360deg);
            opacity: 0.3;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
        .animate-confetti {
          animation: confetti linear infinite;
        }
        .animate-bubble {
          animation: bubble ease-out infinite;
        }
        .animate-leaf {
          animation: leaf ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedEffects;
