'use client';

import { ReactNode } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Skeleton from '@/components/ui/Skeleton';
import { useDashboardSession } from '@/hooks/useDashboardSession';

interface DashboardPageShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  activeTab?: string;
  headerExtra?: ReactNode;
}

export default function DashboardPageShell({
  children,
  title,
  subtitle,
  activeTab,
  headerExtra,
}: DashboardPageShellProps) {
  const { user, loading, handleLogout, userName } = useDashboardSession();

  if (loading) {
    return (
      <DashboardLayout onLogout={handleLogout} activeTab={activeTab}>
        <div className="dashboard-loading-wrap">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={userName}
      activeTab={activeTab}
      onLogout={handleLogout}
      headerExtra={headerExtra}
    >
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">{title}</h1>
        {subtitle && <p className="dashboard-page-subtitle">{subtitle}</p>}
      </div>
      {children}
    </DashboardLayout>
  );
}
