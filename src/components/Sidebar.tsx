"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
}

export default function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeTab = 'overview',
  setActiveTab,
  isMobile = false 
}: SidebarProps) {
  const router = useRouter();

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      onClick: () => {
        if (setActiveTab) {
          setActiveTab('overview');
        } else {
          router.push('/dashboard');
        }
        if (isMobile) setSidebarOpen(false);
      }
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      onClick: () => {
        router.push('/profile');
        if (isMobile) setSidebarOpen(false);
      }
    },
    {
      id: 'cards',
      label: 'Cards',
      icon: CreditCard,
      onClick: () => {
        router.push('/dashboard/cards');
        if (isMobile) setSidebarOpen(false);
      }
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: FileText,
      onClick: () => {
        router.push('/dashboard/transactions');
        if (isMobile) setSidebarOpen(false);
      }
    },
    {
      id: 'fixed-deposits',
      label: 'Fixed Deposits',
      icon: TrendingUp,
      onClick: () => {
        router.push('/dashboard/fixed-deposits');
        if (isMobile) setSidebarOpen(false);
      }
    },
    {
      id: 'e-checks',
      label: 'E-Checks',
      icon: FileText,
      onClick: () => {
        router.push('/dashboard/e-checks');
        if (isMobile) setSidebarOpen(false);
      }
    },
    {
      id: 'kyc',
      label: 'KYC Verification',
      icon: UserCheck,
      onClick: () => {
        router.push('/kyc/verification');
        if (isMobile) setSidebarOpen(false);
      }
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => {
        router.push('/dashboard/settings');
        if (isMobile) setSidebarOpen(false);
      }
    }
  ];

  const getActiveState = (itemId: string) => {
    if (itemId === 'overview' && activeTab === 'overview') return true;
    if (itemId === 'fixed-deposits' && activeTab === 'fixed-deposits') return true;
    if (itemId === 'e-checks' && activeTab === 'e-checks') return true;
    if (itemId === 'transactions' && window.location.pathname.includes('/transactions')) return true;
    if (itemId === 'cards' && window.location.pathname.includes('/cards')) return true;
    if (itemId === 'profile' && window.location.pathname.includes('/profile')) return true;
    if (itemId === 'kyc' && window.location.pathname.includes('/kyc')) return true;
    if (itemId === 'settings' && window.location.pathname.includes('/settings')) return true;
    return false;
  };

  const sidebarContent = (
    <nav className="p-4 space-y-2">
      {navigationItems.map((item) => {
        const isActive = getActiveState(item.id);
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon className="h-5 w-5" />
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
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 relative bg-white rounded-lg p-1 shadow-sm">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
                  </div>
                  <span className="text-lg font-bold">Menu</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                  <X className="h-5 w-5" />
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
    <div className="hidden lg:block fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700">
      {sidebarContent}
    </div>
  );
} 