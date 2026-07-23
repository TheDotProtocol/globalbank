'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Download,
  Upload,
  Globe,
  DollarSign,
  PiggyBank,
  Building,
  GraduationCap,
  Heart,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
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
import InternationalTransferModal from '@/components/modals/InternationalTransferModal';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InterestRatesDisplay from '@/components/InterestRatesDisplay';
import TranslationPrompt from "@/components/TranslationPrompt";
import CurrencyBalanceGrid from '@/components/CurrencyBalanceGrid';
import StatementExportButtons from '@/components/StatementExportButtons';
import TransactionDetailModal, { TransactionDetail, InternationalTransferDetail } from '@/components/modals/TransactionDetailModal';

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
  
  // Modal states
  const [addMoneyModalOpen, setAddMoneyModalOpen] = useState(false);
  const [newCardModalOpen, setNewCardModalOpen] = useState(false);
  const [fixedDepositModalOpen, setFixedDepositModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [internationalTransferModalOpen, setInternationalTransferModalOpen] = useState(false);
  const [accountDetailsModalOpen, setAccountDetailsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountDetails | null>(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionDetail | null>(null);
  const [intlTransfer, setIntlTransfer] = useState<InternationalTransferDetail | null>(null);
  const [relatedTransfer, setRelatedTransfer] = useState<{ id: string; type: string; amount: number; account: { accountNumber: string } } | null>(null);
  const [primaryIntlTx, setPrimaryIntlTx] = useState<import('@/components/modals/TransactionDetailModal').PrimaryIntlTransaction | null>(null);
  const [txDetailLoading, setTxDetailLoading] = useState(false);
  
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

  const handleTransactionClick = async (tx: Transaction) => {
    setTxDetailLoading(true);
    setSelectedTx({
      ...tx,
      reference: tx.reference || null,
      account: { accountNumber: accounts[0]?.accountNumber || '', accountType: accounts[0]?.accountType || '', currency: 'USD' },
    });
    setIntlTransfer(null);
    setRelatedTransfer(null);
    setPrimaryIntlTx(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/transactions/${tx.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedTx(data.transaction);
        setIntlTransfer(data.internationalTransfer);
        setRelatedTransfer(data.relatedTransfer);
        setPrimaryIntlTx(data.primaryIntlTransaction);
      }
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
    } finally {
      setTxDetailLoading(false);
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
      case 'international-transfer':
        setInternationalTransferModalOpen(true);
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
      <DashboardLayout onLogout={handleLogout}>
        <div className="dashboard-loading-wrap">
          <div className="dashboard-grid-2-1">
            <div>
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div>
              <Skeleton className="h-48 w-full mb-6" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
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
    <DashboardLayout
      userName={user ? `${user.firstName} ${user.lastName}` : undefined}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      headerExtra={<NotificationCenter />}
    >
      <TranslationPrompt />

      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Welcome back, {user?.firstName || 'User'}</h1>
        <p className="dashboard-page-subtitle">Here&apos;s your financial overview for today</p>
      </div>

      <div className="mb-8">
        <BankBuggerAI userId={user?.id || ''} className="w-full" />
      </div>

      <div className="dashboard-balance-hero">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>Global Balance</h2>
            <p style={{ opacity: 0.85 }}>Your money in all major world currencies</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.85 }}>Active Accounts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{accounts.length}</div>
          </div>
        </div>

        <MultiCurrencyDisplay usdAmount={totalBalance} className="text-white" showSettings={true} />

        <CurrencyBalanceGrid usdAmount={totalBalance} />

        <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Globe size={18} />
            <span style={{ fontWeight: 600 }}>Borderless Banking</span>
          </div>
          <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>
            Make payments in any currency worldwide with just 1% transaction fee.
            No hidden charges, no complex conversion rates.
          </p>
        </div>
      </div>

      <div className="dashboard-quick-actions">
        <button type="button" onClick={() => handleQuickAction('add-money')} className="dashboard-quick-action">
          <div className="dashboard-quick-action-title">Add Money</div>
          <div className="dashboard-quick-action-desc">Deposit funds</div>
        </button>
        <button type="button" onClick={() => handleQuickAction('transfer')} className="dashboard-quick-action">
          <div className="dashboard-quick-action-title">Transfer</div>
          <div className="dashboard-quick-action-desc">Send money</div>
        </button>
        <button type="button" onClick={() => handleQuickAction('international-transfer')} className="dashboard-quick-action">
          <div className="dashboard-quick-action-title">International</div>
          <div className="dashboard-quick-action-desc">Global transfer</div>
        </button>
        <button type="button" onClick={() => handleQuickAction('new-card')} className="dashboard-quick-action">
          <div className="dashboard-quick-action-title">New Card</div>
          <div className="dashboard-quick-action-desc">Request card</div>
        </button>
        <button type="button" onClick={() => handleQuickAction('fixed-deposit')} className="dashboard-quick-action">
          <div className="dashboard-quick-action-title">Fixed Deposit</div>
          <div className="dashboard-quick-action-desc">Invest money</div>
        </button>
      </div>

      <div className="dashboard-grid-2-1">
        <div className="dashboard-card">
          <div className="dashboard-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="dashboard-card-title">Your Accounts</h2>
            <button type="button" onClick={() => router.push('/profile')} className="dashboard-link-btn">View All</button>
          </div>
          <div>
            {accounts.map((account) => (
              <div key={account.id} onClick={() => handleAccountClick(account.id)} className="dashboard-list-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className={`p-2 rounded-lg ${getAccountColor(account.accountType)}`}>
                    {getAccountIcon(account.accountType)}
                  </div>
                  <div>
                    <div className="dashboard-quick-action-title">{account.accountType} Account</div>
                    <div className="dashboard-quick-action-desc">****{account.accountNumber.slice(-4)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="dashboard-quick-action-title">
                    ${(typeof account.balance === 'string' ? parseFloat(account.balance) : account.balance).toLocaleString()}
                  </div>
                  <div className="dashboard-quick-action-desc">{account.currency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <InterestRatesDisplay userBalance={totalBalance} />

          <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
            <div className="dashboard-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 className="dashboard-card-title">Recent Transactions</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <StatementExportButtons days={365} />
                <button type="button" onClick={() => router.push('/dashboard/transactions')} className="dashboard-link-btn">View All</button>
              </div>
            </div>
            <div>
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="dashboard-list-item dashboard-list-item-clickable"
                  onClick={() => handleTransactionClick(transaction)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {transaction.type === 'CREDIT' ? (
                      <Upload size={16} style={{ color: '#059669' }} />
                    ) : (
                      <Download size={16} style={{ color: '#dc2626' }} />
                    )}
                    <div>
                      <div className="dashboard-quick-action-title" style={{ fontSize: '0.9rem' }}>{transaction.description}</div>
                      <div className="dashboard-quick-action-desc">{new Date(transaction.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="dashboard-quick-action-title" style={{ color: transaction.type === 'CREDIT' ? '#059669' : '#dc2626' }}>
                      {transaction.type === 'CREDIT' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                    <div className="dashboard-quick-action-desc">{transaction.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {fixedDeposits.length > 0 && (
        <div className="dashboard-card" style={{ marginTop: '2rem' }}>
          <div className="dashboard-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="dashboard-card-title">Fixed Deposits</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {fixedDeposits.map((deposit) => (
              <div key={deposit.id} className="dashboard-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'default' }}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <DollarSign size={20} />
                  <span className={`dashboard-stat-pill ${deposit.status === 'ACTIVE' ? 'success' : ''}`}>{deposit.status}</span>
                </div>
                <div className="dashboard-quick-action-title">
                  ${(typeof deposit.amount === 'string' ? parseFloat(deposit.amount) : deposit.amount).toLocaleString()}
                </div>
                <div className="dashboard-quick-action-desc">{deposit.interestRate}% for {deposit.duration} months</div>
                <div className="dashboard-quick-action-desc">Matures: {new Date(deposit.maturityDate).toLocaleDateString()}</div>
                <button type="button" onClick={() => handleCertificateGeneration(deposit.id)} className="btn-secondary" style={{ marginTop: '0.75rem', width: '100%', padding: '0.5rem' }}>
                  Generate Certificate
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleGenerateAllCertificates} className="btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
              Generate All Certificates
            </button>
          </div>
        </div>
      )}

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

        {internationalTransferModalOpen && (
          <InternationalTransferModal
            isOpen={internationalTransferModalOpen}
            onClose={() => setInternationalTransferModalOpen(false)}
            accounts={accounts}
            onSuccess={() => {
              setInternationalTransferModalOpen(false);
              fetchDashboardData();
            }}
          />
        )}

        {accountDetailsModalOpen && selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setAccountDetailsModalOpen(false)} />
            <div className="auth-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 className="auth-card-title" style={{ fontSize: '1.5rem', textAlign: 'left' }}>Account Details</h3>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="dashboard-form-label">Account Number</label>
                  <p className="dashboard-quick-action-title">{selectedAccount.accountNumber}</p>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="dashboard-form-label">Balance</label>
                  <p className="dashboard-quick-action-title">${selectedAccount.balance.toLocaleString()}</p>
                </div>
                <div>
                  <label className="dashboard-form-label">Status</label>
                  <p className="dashboard-quick-action-title">{selectedAccount.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
              <button type="button" onClick={() => setAccountDetailsModalOpen(false)} className="btn-primary auth-submit-btn" style={{ marginTop: '1.5rem' }}>
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

        {(selectedTx || txDetailLoading) && (
          <TransactionDetailModal
            transaction={selectedTx}
            internationalTransfer={intlTransfer}
            primaryIntlTransaction={primaryIntlTx}
            relatedTransfer={relatedTransfer}
            loading={txDetailLoading}
            onClose={() => { setSelectedTx(null); setIntlTransfer(null); setRelatedTransfer(null); setPrimaryIntlTx(null); }}
          />
        )}
    </DashboardLayout>
  );
} 