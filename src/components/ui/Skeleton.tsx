import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export default function Skeleton({ 
  className = '', 
  lines = 1,
  height = 'h-4'
}: SkeletonProps) {
  if (lines === 1) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${height} ${className}`} />
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${height} ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
} 