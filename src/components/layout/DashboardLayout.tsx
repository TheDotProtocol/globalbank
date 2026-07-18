'use client';

import { ReactNode, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import Sidebar from '@/components/Sidebar';
import { NoTranslate } from '@/components/TranslationWrapper';

interface DashboardLayoutProps {
  children: ReactNode;
  userName?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onLogout: () => void;
  headerExtra?: ReactNode;
}

export default function DashboardLayout({
  children,
  userName,
  activeTab = 'overview',
  setActiveTab,
  onLogout,
  headerExtra,
}: DashboardLayoutProps) {
  const { darkMode, theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`App dashboard-app ${theme}`}>
      <header className="dashboard-top-header">
        <div className="dashboard-header-content">
          <div className="dashboard-header-left">
            <button
              type="button"
              className="dashboard-icon-btn dashboard-mobile-menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <Link href="/dashboard" className="dashboard-logo-link">
              <Image
                src="/logo.png"
                alt="Global Dot Bank"
                width={140}
                height={36}
                style={{ height: '36px', width: 'auto' }}
              />
            </Link>
            <span className="dashboard-header-title">
              <NoTranslate>Banking</NoTranslate>
            </span>
          </div>

          <div className="dashboard-header-right">
            {userName && (
              <span className="dashboard-welcome-text">
                Welcome, {userName}
              </span>
            )}
            {headerExtra}
            <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button type="button" className="dashboard-logout-btn" onClick={onLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobile={true}
          theme={theme}
        />
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobile={false}
          theme={theme}
        />

        <main className="dashboard-main-area">
          <div className="dashboard-main-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
