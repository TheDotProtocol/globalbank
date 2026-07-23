'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Shield, Building2, FileCheck, LogOut, Sun, Moon, Menu, X, Users,
  ScrollText, Landmark, FileWarning,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import '@/app/dashboard.css';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/licensing', label: 'Licensing', icon: Building2 },
  { href: '/admin/compliance', label: 'Compliance', icon: Shield },
  { href: '/admin/aml-cases', label: 'AML Cases', icon: FileWarning },
  { href: '/admin/reconciliation', label: 'Reconciliation', icon: Landmark },
  { href: '/admin/lending', label: 'Lending', icon: FileCheck },
  { href: '/admin/regulatory', label: 'Regulatory', icon: FileWarning },
  { href: '/admin/audit', label: 'Audit Log', icon: ScrollText },
  { href: '/admin/settlements', label: 'Settlements', icon: Landmark },
  { href: '/admin/branches', label: 'Branches', icon: Building2 },
  { href: '/admin/kyc', label: 'KYC Review', icon: FileCheck },
];

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export function getAdminHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('adminSessionToken') || '' : '';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { darkMode, theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [adminRole, setAdminRole] = useState('');
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('adminSessionToken');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    setAdminRole(sessionStorage.getItem('adminRole') || 'ADMIN');
    setAdminName(sessionStorage.getItem('adminUsername') || 'Admin');
    setAuthReady(true);
  }, [router]);

  const logout = () => {
    sessionStorage.removeItem('adminSessionToken');
    sessionStorage.removeItem('adminRole');
    sessionStorage.removeItem('adminUsername');
    router.replace('/admin/login');
  };

  if (!authReady) {
    return (
      <div className={`App dashboard-app ${theme}`}>
        <div className="dashboard-loading-wrap" style={{ minHeight: '100vh' }}>
          <div className="dashboard-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className={`App dashboard-app ${theme}`}>
      <header className="dashboard-top-header">
        <div className="dashboard-header-content">
          <div className="dashboard-header-left">
            <button type="button" className="dashboard-icon-btn dashboard-mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <Link href="/admin" className="dashboard-logo-link">
              <Image src="/logo.png" alt="Global Dot Bank" width={140} height={36} style={{ height: '36px', width: 'auto' }} />
            </Link>
            <span className="dashboard-header-title">Admin Portal</span>
          </div>
          <div className="dashboard-header-right">
            <span className="dashboard-welcome-text">{adminName} ({adminRole})</span>
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button type="button" className="dashboard-logout-btn" onClick={logout}>
              <LogOut size={18} /><span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="dashboard-sidebar-header">
            <span className="dashboard-sidebar-title">Operations</span>
            <button type="button" className="dashboard-icon-btn dashboard-mobile-menu" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <nav className="dashboard-sidebar-nav">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`dashboard-sidebar-link ${pathname === href || (href !== '/admin' && pathname.startsWith(href)) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          {title && <h1 className="dashboard-page-title">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  );
}

export function useAdminAuth() {
  const getHeaders = useCallback(() => getAdminHeaders(), []);
  return { getHeaders };
}
