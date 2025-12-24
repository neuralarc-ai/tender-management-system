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
        return 'bg-white/30 text-neural/60 border-neural/10 backdrop-blur-md';
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
            <span className="font-black tracking-tight text-neural">VECTOR</span>
            <span className="text-neural/30">•</span>
            <span className="text-neural/60">© {new Date().getFullYear()}</span>
            <span className="text-neural/60">All rights reserved by</span>
            <Link
              href="https://neuralarc.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-passion hover:text-passion-dark transition-colors duration-200"
            >
              Neural Arc Inc.
            </Link>
          </div>

          {/* Divider for desktop */}
          <div className="hidden md:block w-px h-4 bg-neural/10"></div>

          {/* Product info */}
          <div className="text-xs text-neural/50 font-medium">
            Tender Management System
          </div>
        </div>
      </div>
    </footer>
  );
}

