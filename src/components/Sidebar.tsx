"use client";
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  User, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  UserCheck, 
  Settings, 
  X 
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isMobile?: boolean;
  theme?: 'light' | 'dark';
}

export default function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeTab = 'overview',
  setActiveTab,
  isMobile = false,
  theme = 'light',
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard' },
    { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
    { id: 'cards', label: 'Cards', icon: CreditCard, href: '/dashboard/cards' },
    { id: 'transactions', label: 'Transactions', icon: FileText, href: '/dashboard/transactions' },
    { id: 'fixed-deposits', label: 'Fixed Deposits', icon: TrendingUp, href: '/dashboard/fixed-deposits' },
    { id: 'e-checks', label: 'E-Checks', icon: FileText, href: '/dashboard/e-checks' },
    { id: 'kyc', label: 'KYC Verification', icon: UserCheck, href: '/kyc/verification' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const getActiveState = (itemId: string, href: string) => {
    if (itemId === 'overview') {
      return pathname === '/dashboard' && activeTab === 'overview';
    }
    return pathname.startsWith(href);
  };

  const handleNav = (item: typeof navigationItems[0]) => {
    if (item.id === 'overview' && setActiveTab) {
      setActiveTab('overview');
    }
    router.push(item.href);
    if (isMobile) setSidebarOpen(false);
  };

  const sidebarContent = (
    <nav className="dashboard-sidebar-nav">
      {navigationItems.map((item) => {
        const isActive = getActiveState(item.id, item.href);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNav(item)}
            className={`dashboard-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  if (isMobile) {
    return (
      <>
        {sidebarOpen && (
          <div className="dashboard-mobile-overlay">
            <div className="dashboard-mobile-backdrop" onClick={() => setSidebarOpen(false)} />
            <div className={`dashboard-mobile-sidebar ${theme}`}>
              <div className="dashboard-mobile-sidebar-header">
                <Image src="/logo.png" alt="Logo" width={120} height={30} style={{ height: '30px', width: 'auto' }} />
                <button type="button" onClick={() => setSidebarOpen(false)} className="dashboard-icon-btn">
                  <X size={20} />
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <aside className={`dashboard-sidebar ${theme}`}>
      {sidebarContent}
    </aside>
  );
}
