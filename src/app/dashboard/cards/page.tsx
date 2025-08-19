'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Eye, 
  EyeOff, 
  Download, 
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Settings,
  FileText,
  Home,
  UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Image from "next/image";

interface Card {
  id: string;
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  cvv: string;
  status: string;
  isActive: boolean;
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState<{[key: string]: boolean}>({});
  const [user, setUser] = useState<User | null>(null);
  
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchCards();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchCards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/cards', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      } else {
        showToast('Error loading cards', 'error');
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      showToast('Error loading cards', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCardDetails = (cardId: string) => {
    setShowCardDetails(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatCardNumber = (cardNumber: string, showFull: boolean = false) => {
    if (showFull) {
      return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
    }
    return `**** **** **** ${cardNumber.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-all duration-500 relative overflow-hidden">
          <div className="flex items-center justify-center h-screen">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-all duration-500 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-300 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse delay-2000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-50 bg-white/90 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="h-10 w-10 relative bg-white rounded-lg p-1 shadow-sm">
                  <Image
                    src="/logo.png"
                    alt="Global Dot Bank Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Cards
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 dark:text-gray-300 hidden md:block">
                  Welcome, {user?.firstName || 'User'} {user?.lastName || ''}
                </span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span className="hidden md:block">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar */}
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
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/cards')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 transition-colors"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/transactions')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  <span>Transactions</span>
                </button>
                <button
                  onClick={() => router.push('/kyc/verification')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <UserCheck className="h-5 w-5" />
                  <span>KYC Verification</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/cards')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 transition-colors"
            >
              <CreditCard className="h-5 w-5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/transactions')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span>Transactions</span>
            </button>
            <button
              onClick={() => router.push('/kyc/verification')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <UserCheck className="h-5 w-5" />
              <span>KYC Verification</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className={`relative z-10 ${sidebarOpen ? 'lg:ml-64' : ''} lg:ml-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Cards
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your debit and credit cards
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div key={card.id} className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {card.cardType} Card
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {card.status}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCardDetails(card.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {showCardDetails[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Card Number</div>
                    <div className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCardNumber(card.cardNumber, showCardDetails[card.id])}
                    </div>
                  </div>

                  {showCardDetails[card.id] && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Expiry Date</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {card.expiryDate}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">CVV</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {card.cvv}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          card.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                          {card.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Block Card
                    </button>
                    <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                      Report Lost
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Card */}
            <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 transition-colors cursor-pointer">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
                  <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Request New Card
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Apply for a new debit or credit card
                </p>
                <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          {cards.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Cards Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You haven't requested any cards yet. Start by requesting your first card.
              </p>
              <button className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                Request Your First Card
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 