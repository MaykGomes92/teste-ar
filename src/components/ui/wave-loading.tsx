import React from 'react';
import { cn } from '@/lib/utils';

interface WaveLoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const WaveLoading: React.FC<WaveLoadingProps> = ({ 
  className, 
  size = 'md', 
  text 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-8',
    md: 'w-24 h-12',
    lg: 'w-32 h-16'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative overflow-hidden", sizeClasses[size])}>
        <svg
          viewBox="0 0 120 60"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Primeira onda */}
          <path
            d="M0,30 Q15,10 30,30 T60,30 T90,30 T120,30 V60 H0 Z"
            fill="hsl(var(--orla-teal-dark))"
            opacity="0.8"
            className="animate-wave-1"
          />
          
          {/* Segunda onda */}
          <path
            d="M0,35 Q20,15 40,35 T80,35 T120,35 V60 H0 Z"
            fill="hsl(var(--orla-teal))"
            opacity="0.6"
            className="animate-wave-2"
          />
          
          {/* Terceira onda */}
          <path
            d="M0,40 Q25,20 50,40 T100,40 T150,40 V60 H0 Z"
            fill="hsl(var(--orla-teal-light))"
            opacity="0.4"
            className="animate-wave-3"
          />
        </svg>
      </div>
      
      {text && (
        <p className="mt-4 text-sm text-muted-foreground font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default WaveLoading;