import React from 'react';
import Link from 'next/link';

interface FooterProps {
  variant?: 'light' | 'dark' | 'transparent';
  className?: string;
}

export function Footer({ variant = 'light', className = '' }: FooterProps): JSX.Element {
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'dark':
        return 'bg-neural/95 text-white/70 border-white/10';
      case 'transparent':
        return 'bg-white/5 text-white border-white/10 backdrop-blur-xl shadow-lg';
      case 'light':
      default:
        return 'bg-white/80 text-neural/70 border-gray-200/50 backdrop-blur-sm';
    }
  };

  return (
    <footer className={`w-full border-t py-6 ${getVariantClasses()} ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-3">
          {/* Product Name & Copyright */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm">
            <span className={`font-black tracking-tight ${variant === 'transparent' ? 'text-white' : 'text-neural'}`}>VECTOR</span>
            <span className={variant === 'transparent' ? 'text-white/40' : 'text-neural/30'}>•</span>
            <span className={variant === 'transparent' ? 'text-white/80' : 'text-neural/60'}>© {new Date().getFullYear()}</span>
            <span className={variant === 'transparent' ? 'text-white/80' : 'text-neural/60'}>All rights reserved by</span>
            <Link
              href="https://neuralarc.ai"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-bold transition-colors duration-200 ${
                variant === 'transparent' 
                  ? 'text-white hover:text-white/80' 
                  : 'text-passion hover:text-passion-dark'
              }`}
            >
              Neural Arc Inc.
            </Link>
          </div>

          {/* Divider for desktop */}
          <div className={`hidden md:block w-px h-4 ${variant === 'transparent' ? 'bg-white/20' : 'bg-neural/10'}`}></div>

          {/* Product info */}
          <div className={`text-xs font-medium ${variant === 'transparent' ? 'text-white/70' : 'text-neural/50'}`}>
            Tender Management System
          </div>
        </div>
      </div>
    </footer>
  );
}

