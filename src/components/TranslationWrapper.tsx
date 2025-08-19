'use client';

import React from 'react';

interface TranslationWrapperProps {
  children: React.ReactNode;
  translate?: boolean;
  className?: string;
}

export default function TranslationWrapper({ 
  children, 
  translate = true, 
  className = '' 
}: TranslationWrapperProps) {
  return (
    <div 
      className={className}
      translate={translate ? 'yes' : 'no'}
    >
      {children}
    </div>
  );
}

// Helper component for elements that should never be translated
export function NoTranslate({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={className} translate="no">
      {children}
    </span>
  );
}

// Helper component for elements that should always be translated
export function Translate({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={className} translate="yes">
      {children}
    </span>
  );
} 