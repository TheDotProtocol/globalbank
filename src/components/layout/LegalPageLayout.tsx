'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MarketingLayout from '@/components/layout/MarketingLayout';
import PageHero from '@/components/layout/PageHero';
import { useTheme } from '@/hooks/useTheme';

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function LegalPageLayout({ title, subtitle, children }: LegalPageLayoutProps) {
  const { theme } = useTheme();

  return (
    <MarketingLayout>
      <PageHero title={title} subtitle={subtitle} theme={theme} minHeight="40vh" />
      <section className="content-section">
        <div className="content-container" style={{ maxWidth: '900px' }}>
          <Link href="/" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="content-card">{children}</div>
        </div>
      </section>
    </MarketingLayout>
  );
}
