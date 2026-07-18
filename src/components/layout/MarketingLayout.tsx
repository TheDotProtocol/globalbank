'use client';

import { ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';
import MarketingHeader from './MarketingHeader';
import MarketingFooter from './MarketingFooter';

interface MarketingLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  variant?: 'default' | 'auth';
}

export default function MarketingLayout({
  children,
  showFooter = true,
  variant = 'default',
}: MarketingLayoutProps) {
  const { darkMode, theme, toggleTheme } = useTheme();

  return (
    <div className={`App ${theme}`}>
      <MarketingHeader theme={theme} darkMode={darkMode} onToggleTheme={toggleTheme} />
      <main className={variant === 'auth' ? 'auth-page-content' : 'page-content'}>
        {children}
      </main>
      {showFooter && <MarketingFooter />}
    </div>
  );
}
