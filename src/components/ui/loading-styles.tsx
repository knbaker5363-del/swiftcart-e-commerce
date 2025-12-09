import React from 'react';

// Style 1: Bouncing Balls Loader (proud-ladybug-46)
export const BouncingBallsLoader = () => (
  <div className="bouncing-loader flex gap-2">
    <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
    <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
    <div className="w-4 h-4 rounded-full bg-primary animate-bounce" />
  </div>
);

// Style 2: Pulse Rings Loader (calm-earwig-94)
export const PulseRingsLoader = () => (
  <div className="relative w-16 h-16">
    <div className="absolute inset-0 rounded-full border-4 border-primary opacity-75 animate-ping" />
    <div className="absolute inset-2 rounded-full border-4 border-primary opacity-50 animate-ping [animation-delay:0.3s]" />
    <div className="absolute inset-4 rounded-full border-4 border-primary opacity-25 animate-ping [animation-delay:0.6s]" />
  </div>
);

// Style 3: Spinning Dots (rare-cow-16)
export const SpinningDotsLoader = () => (
  <div className="relative w-16 h-16 animate-spin [animation-duration:1.5s]">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute w-3 h-3 bg-primary rounded-full"
        style={{
          top: '50%',
          left: '50%',
          transform: `rotate(${i * 45}deg) translateY(-24px)`,
          opacity: 1 - i * 0.1,
        }}
      />
    ))}
  </div>
);

// Style 4: Wave Bars Loader (big-octopus-60)
export const WaveBarsLoader = () => (
  <div className="flex gap-1 items-end h-12">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="w-2 bg-primary rounded-full animate-pulse"
        style={{
          height: `${20 + Math.random() * 28}px`,
          animationDelay: `${i * 0.15}s`,
          animationDuration: '0.8s',
        }}
      />
    ))}
  </div>
);

// Style 5: Default Spinner
export const DefaultSpinner = () => (
  <div className="relative">
    <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

interface LoaderProps {
  style: string;
}

export const Loader: React.FC<LoaderProps> = ({ style }) => {
  switch (style) {
    case 'bouncing':
      return <BouncingBallsLoader />;
    case 'pulse':
      return <PulseRingsLoader />;
    case 'dots':
      return <SpinningDotsLoader />;
    case 'wave':
      return <WaveBarsLoader />;
    default:
      return <DefaultSpinner />;
  }
};

export default Loader;
