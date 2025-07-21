'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Settings,
  CreditCard,
  Home,
  UserCheck,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { exportTransactions } from '@/lib/export';
import Image from "next/image";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  reference?: string;
  transferMode?: string;
  sourceAccountNumber?: string;
  destinationAccountNumber?: string;
  transferFee?: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchTransactions();
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

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/transactions?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        showToast('Error loading transactions', 'error');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast('Error loading transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      await exportTransactions(transactions, format);
      showToast(`${format.toUpperCase()} export completed`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Export failed', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || transaction.type === filterType.toUpperCase();
    
    return matchesSearch && matchesType;
  });

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'debit':
        return <DollarSign className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
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
                  Transactions
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
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/transactions')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 transition-colors"
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
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <CreditCard className="h-5 w-5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/transactions')}
              className="w-full flex items-center space-x-3 p-3 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 transition-colors"
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
              Transaction History
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              View and manage your transaction history
            </p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Transactions ({filteredTransactions.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No transactions found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filters.' : 'You haven\'t made any transactions yet.'}
                  </p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'CREDIT' 
                            ? 'bg-green-100 dark:bg-green-900/50' 
                            : 'bg-red-100 dark:bg-red-900/50'
                        }`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(transaction.createdAt).toLocaleDateString()} • {new Date(transaction.createdAt).toLocaleTimeString()}
                          </div>
                          {transaction.reference && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Ref: {transaction.reference}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${
                          transaction.type === 'CREDIT' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'CREDIT' ? '+' : '-'}${(typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount).toLocaleString()}
                        </div>
                        <div className={`text-sm px-2 py-1 rounded-full inline-block ${
                          transaction.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : transaction.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 