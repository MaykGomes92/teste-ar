import React from 'react';
import { cn } from '@/lib/utils';

interface WaveDividerProps {
  className?: string;
  color?: string;
}

const WaveDivider: React.FC<WaveDividerProps> = ({ 
  className,
  color = "hsl(var(--orla-teal))"
}) => {
  return (
    <div className={cn("w-full overflow-hidden relative", className)}>
      <svg
        viewBox="0 0 1200 120"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        {/* Onda principal com transparência */}
        <path
          d="M0,60 C300,100 600,20 900,60 C1000,80 1100,40 1200,60 L1200,120 L0,120 Z"
          fill={color}
          opacity="0.15"
        />
        {/* Linha da onda */}
        <path
          d="M0,60 C300,100 600,20 900,60 C1000,80 1100,40 1200,60"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};

export default WaveDivider;