import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'text' | 'icon' | 'full';
  className?: string;
}

export default function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const iconSize = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Image
          src="/logo.png"
          alt="Global Dot Bank"
          width={32}
          height={32}
          className={`${iconSize[size]} object-contain`}
        />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center ${className}`}>
        <span className={`${sizeClasses[size]} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
          Global Dot Bank
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="Global Dot Bank"
        width={32}
        height={32}
        className={`${iconSize[size]} object-contain`}
      />
      <span className={`${sizeClasses[size]} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
        Global Dot Bank
      </span>
    </div>
  );
} 