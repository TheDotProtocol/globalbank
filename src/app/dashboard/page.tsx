'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  Settings, 
  User, 
  LogOut,
  Menu,
  X,
  Download,
  Upload,
  Plus,
  Eye,
  Globe,
  Sun,
  Moon,
  ArrowRight,
  DollarSign,
  PiggyBank,
  Building,
  GraduationCap,
  Heart,
  UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Skeleton from '@/components/ui/Skeleton';
import NotificationCenter from '@/components/NotificationCenter';
import AddMoneyModal from '@/components/modals/AddMoneyModal';
import NewCardModal from '@/components/modals/NewCardModal';
import FixedDepositModal from '@/components/modals/FixedDepositModal';
import FixedDepositCertificate from '@/components/FixedDepositCertificate';
import MultiCurrencyDisplay, { CurrencyConverter } from '@/components/MultiCurrencyDisplay';
import BankBuggerAI from '@/components/BankBuggerAI';
import { exportStatement, exportTransactions, exportFixedDeposits, exportFixedDepositCertificate } from '@/lib/export-new';
import TransferModal from '@/components/modals/TransferModal';
import Image from "next/image";
import Sidebar from '@/components/Sidebar';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  kycStatus: string;
}

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
}

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

interface FixedDeposit {
  id: string;
  amount: number;
  interestRate: number;
  duration: number;
  maturityDate: string;
  status: string;
}

interface AccountDetails {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  statistics: {
    totalTransactions: number;
    totalCredits: number;
    totalDebits: number;
    averageTransactionAmount: number;
  };
  transactions: Transaction[];
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Modal states
  const [addMoneyModalOpen, setAddMoneyModalOpen] = useState(false);
  const [newCardModalOpen, setNewCardModalOpen] = useState(false);
  const [fixedDepositModalOpen, setFixedDepositModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [accountDetailsModalOpen, setAccountDetailsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountDetails | null>(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  
  // AI Chat states
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{
    id: number;
    type: 'ai' | 'user';
    content: string;
    timestamp: Date;
  }>>([
    {
      id: 1,
      type: 'ai',
      content: 'Hey there! 👋 I\'m your virtual banker, how\'s it going? I\'m here to help you with anything banking-related - from checking your account details to investment advice, or even just chatting about your financial goals. What can I help you with today?',
      timestamp: new Date()
    }
  ]);
  
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update AI message when user data is loaded
  useEffect(() => {
    if (user?.firstName) {
      setAiMessages(prev => {
        const updatedMessages = [...prev];
        if (updatedMessages[0] && updatedMessages[0].type === 'ai') {
          updatedMessages[0] = {
            ...updatedMessages[0],
            content: `Hey ${user.firstName}! 👋 I'm your virtual banker, how's it going? I'm here to help you with anything banking-related - from checking your account details to investment advice, or even just chatting about your financial goals. What can I help you with today?`
          };
        }
        return updatedMessages;
      });
    }
  }, [user?.firstName]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Fetch user data
      const userResponse = await fetch('/api/user/profile', { headers });
      
      if (!userResponse.ok) {
        router.push('/login');
        return;
      }
      
      const userData = await userResponse.json();
      setUser(userData.user);

      // Check if user needs to complete KYC
      if (userData.user.kycStatus === 'PENDING') {
        showToast('Please complete your KYC verification to access all features', 'info');
        // Don't redirect immediately, let user see the dashboard but show KYC prompt
      }

      // Fetch accounts
      const accountsResponse = await fetch('/api/user/accounts', { headers });
      const accountsData = await accountsResponse.json();
      setAccounts(accountsData.accounts);

      // Fetch recent transactions
      const transactionsResponse = await fetch('/api/transactions?limit=5', { headers });
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData.transactions);

      // Fetch fixed deposits
      const depositsResponse = await fetch('/api/fixed-deposits', { headers });
      const depositsData = await depositsResponse.json();
      setFixedDeposits(depositsData.fixedDeposits);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
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

  const handleExport = async (type: 'transactions' | 'deposits', format: 'pdf' | 'csv') => {
    try {
      if (type === 'transactions') {
        if (format === 'pdf' && user && accounts.length > 0) {
          // Use professional statement export for PDF
          await exportStatement(user, accounts[0], transactions, format);
          showToast('Professional statement PDF generated', 'success');
        } else {
          // Use regular export for CSV
          await exportTransactions(transactions, format);
          showToast(`${format.toUpperCase()} export completed`, 'success');
        }
      } else {
        await exportFixedDeposits(fixedDeposits, format);
        showToast(`${format.toUpperCase()} export completed`, 'success');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast('Export failed', 'error');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-money':
        setAddMoneyModalOpen(true);
        break;
      case 'transfer':
        setTransferModalOpen(true);
        break;
      case 'new-card':
        setNewCardModalOpen(true);
        break;
      case 'fixed-deposit':
        setFixedDepositModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleAccountClick = async (accountId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const accountData = await response.json();
        setSelectedAccount(accountData.account);
        setAccountDetailsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
      showToast('Error loading account details', 'error');
    }
  };

  const testAuthentication = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found in localStorage');
        return false;
      }

      console.log('🔍 Testing authentication...');
      
      const response = await fetch('/api/test-auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Test auth response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Authentication test successful:', data);
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Authentication test failed:', errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Authentication test error:', error);
      return false;
    }
  };

  const handleCertificateGeneration = async (depositId: string) => {
    try {
      // First test authentication
      const isAuthenticated = await testAuthentication();
      
      if (!isAuthenticated) {
        showToast('Authentication failed. Please log in again.', 'error');
        router.push('/login');
        return;
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        showToast('Please log in to generate certificates', 'error');
        router.push('/login');
        return;
      }

      console.log('🔍 Generating certificate for deposit:', depositId);
      console.log('🔍 Token exists:', !!token);
      console.log('🔍 Token length:', token.length);
      console.log('🔍 Token starts with:', token.substring(0, 20) + '...');

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('🔍 Request headers:', headers);

      const response = await fetch(`/api/fixed-deposits/${depositId}/certificate`, {
        method: 'GET',
        headers: headers
      });

      console.log('🔍 Certificate API response status:', response.status);
      console.log('🔍 Certificate API response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const certificateData = await response.json();
        console.log('✅ Certificate data received:', certificateData);
        // Export the certificate directly
        await exportFixedDepositCertificate(certificateData.certificate, 'pdf');
        showToast('Fixed Deposit Certificate generated successfully', 'success');
      } else {
        const errorText = await response.text();
        console.error('❌ Certificate generation error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        
        let errorMessage = 'Error generating certificate';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${errorText}`;
        }
        
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('❌ Error generating certificate:', error);
      showToast('Error generating certificate', 'error');
    }
  };

  const handleGenerateAllCertificates = async () => {
    try {
      showToast('Generating certificates for all fixed deposits...', 'info');
      
      for (const deposit of fixedDeposits) {
        await handleCertificateGeneration(deposit.id);
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      showToast('All certificates generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating all certificates:', error);
      showToast('Error generating certificates', 'error');
    }
  };

  if (loading) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-all duration-500 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse delay-1000"></div>
            <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-300 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse delay-2000"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 w-full mb-6" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div>
                <Skeleton className="h-48 w-full mb-6" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, account) => {
    const balance = typeof account?.balance === 'string' ? parseFloat(account.balance) : (account?.balance || 0);
    return sum + balance;
  }, 0);

  const getAccountIcon = (accountType: string) => {
    switch (accountType.toLowerCase()) {
      case 'savings':
        return <PiggyBank className="h-6 w-6" />;
      case 'current':
        return <TrendingUp className="h-6 w-6" />;
      case 'fixed-deposit':
        return <DollarSign className="h-6 w-6" />;
      case 'corporate':
        return <Building className="h-6 w-6" />;
      case 'junior':
        return <GraduationCap className="h-6 w-6" />;
      case 'pension':
        return <Heart className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getAccountColor = (accountType: string) => {
    switch (accountType.toLowerCase()) {
      case 'savings':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400';
      case 'current':
        return 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400';
      case 'fixed-deposit':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400';
      case 'corporate':
        return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400';
      case 'junior':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400';
      case 'pension':
        return 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      content: aiInput,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: aiInput,
          userContext: {
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
            accounts: accounts,
            fixedDeposits: fixedDeposits,
            recentTransactions: transactions
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai' as const,
          content: data.response,
          timestamp: new Date()
        };
        setAiMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai' as const,
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to contact our support team if you need immediate assistance.",
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, errorResponse]);
    } finally {
      setAiLoading(false);
    }
  };

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
                  Global Dot Bank
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 dark:text-gray-300 hidden md:block">
                  Welcome, {user?.firstName || 'User'} {user?.lastName || ''}
                </span>
                <NotificationCenter />
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
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:block">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar */}
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobile={true}
        />

        {/* Desktop Sidebar */}
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobile={false}
        />

        {/* Main Content */}
        <div className={`relative z-10 ${sidebarOpen ? 'lg:ml-64' : ''} lg:ml-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Here's your financial overview for today
            </p>
          </div>

          {/* Bank Bugger AI */}
          <div className="mb-8">
            <BankBuggerAI userId={user?.id || ''} className="w-full" />
          </div>

          {/* Total Balance Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Total Balance</h2>
                <p className="text-blue-100 mb-4">Across all your accounts</p>
                <div className="text-4xl font-bold">
                  ${totalBalance.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-100 text-sm">Active Accounts</div>
                <div className="text-2xl font-bold">{accounts.length}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => handleQuickAction('add-money')}
              className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Add Money</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Deposit funds</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleQuickAction('transfer')}
              className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Transfer</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Send money</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleQuickAction('new-card')}
              className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Plus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">New Card</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Request card</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleQuickAction('fixed-deposit')}
              className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Fixed Deposit</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Invest money</div>
                </div>
              </div>
            </button>
          </div>

          {/* Accounts and Transactions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Accounts Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Accounts</h2>
                  <button 
                    onClick={() => router.push('/profile')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      onClick={() => handleAccountClick(account.id)}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getAccountColor(account.accountType)}`}>
                          {getAccountIcon(account.accountType)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {account.accountType} Account
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            ****{account.accountNumber.slice(-4)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">
                          ${(typeof account.balance === 'string' ? parseFloat(account.balance) : account.balance).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {account.currency}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
                  <button 
                    onClick={() => router.push('/dashboard/transactions')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.type === 'CREDIT' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}${Math.abs(typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Deposits Section */}
          {fixedDeposits.length > 0 && (
            <div className="mt-8">
              <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fixed Deposits</h2>
                  <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                    View All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fixedDeposits.map((deposit) => (
                    <div key={deposit.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                          <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          deposit.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {deposit.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="font-bold text-gray-900 dark:text-white">
                          ${(typeof deposit.amount === 'string' ? parseFloat(deposit.amount) : deposit.amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {deposit.interestRate}% for {deposit.duration} months
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Matures: {new Date(deposit.maturityDate).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => handleCertificateGeneration(deposit.id)}
                          className="mt-2 w-full bg-purple-600 text-white py-1 px-3 rounded-lg text-xs hover:bg-purple-700 transition-colors"
                        >
                          Generate Certificate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {fixedDeposits.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleGenerateAllCertificates}
                      className="bg-purple-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                    >
                      Generate All Certificates
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {addMoneyModalOpen && (
          <AddMoneyModal
            isOpen={addMoneyModalOpen}
            onClose={() => setAddMoneyModalOpen(false)}
            accounts={accounts}
            onSuccess={() => {
              setAddMoneyModalOpen(false);
              fetchDashboardData();
            }}
          />
        )}

        {newCardModalOpen && (
          <NewCardModal
            isOpen={newCardModalOpen}
            onClose={() => setNewCardModalOpen(false)}
            accounts={accounts}
            onSuccess={() => {
              setNewCardModalOpen(false);
              showToast('Card request submitted successfully', 'success');
            }}
          />
        )}

        {fixedDepositModalOpen && (
          <FixedDepositModal
            isOpen={fixedDepositModalOpen}
            onClose={() => setFixedDepositModalOpen(false)}
            accounts={accounts}
            userId={user?.id || ''}
            onSuccess={() => {
              setFixedDepositModalOpen(false);
              fetchDashboardData();
            }}
          />
        )}

        {transferModalOpen && (
          <TransferModal
            isOpen={transferModalOpen}
            onClose={() => setTransferModalOpen(false)}
            accounts={accounts}
            onSuccess={() => {
              setTransferModalOpen(false);
              fetchDashboardData();
            }}
          />
        )}

        {accountDetailsModalOpen && selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setAccountDetailsModalOpen(false)} />
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Account Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Number</label>
                  <p className="text-lg font-semibold">{selectedAccount.accountNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance</label>
                  <p className="text-lg font-semibold">${selectedAccount.balance.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <p className="text-lg font-semibold">{selectedAccount.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
              <button
                onClick={() => setAccountDetailsModalOpen(false)}
                className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {certificateModalOpen && selectedCertificate && (
          <FixedDepositCertificate
            certificate={selectedCertificate}
            onClose={() => setCertificateModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
} 