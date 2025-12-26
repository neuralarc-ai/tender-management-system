'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassCardProps {
  children: ReactNode;
  glowIntensity?: 'sm' | 'md' | 'lg';
  shadowIntensity?: 'sm' | 'md' | 'lg';
  borderRadius?: string;
  blurIntensity?: 'sm' | 'md' | 'lg';
  draggable?: boolean;
  className?: string;
}

export function LiquidGlassCard({
  children,
  glowIntensity = 'md',
  shadowIntensity = 'md',
  borderRadius = '24px',
  blurIntensity = 'md',
  draggable = false,
  className = '',
}: LiquidGlassCardProps): JSX.Element {
  const blurMap = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-xl',
  };

  const shadowMap = {
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-2xl',
  };

  const glowMap = {
    sm: 'shadow-white/10',
    md: 'shadow-white/20',
    lg: 'shadow-white/30',
  };

  return (
    <div
      className={cn(
        'relative bg-white/10 border border-white/20',
        blurMap[blurIntensity],
        shadowMap[shadowIntensity],
        glowMap[glowIntensity],
        draggable && 'cursor-move',
        className
      )}
      style={{
        borderRadius,
      }}
      draggable={draggable}
    >
      {/* Liquid glass gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent pointer-events-none"
        style={{
          borderRadius,
        }}
      />

      {/* Top shine effect */}
      <div
        className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"
        style={{
          borderRadius: `${borderRadius} ${borderRadius} 0 0`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}


