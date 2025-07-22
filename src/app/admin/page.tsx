'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Plus,
  Calendar,
  MapPin,
  User,
  CreditCard,
  FileText,
  Shield,
  Mail,
  Phone,
  Copy,
  ExternalLink,
  LogOut,
  Building,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  kycStatus: string;
  emailVerified: boolean;
  createdAt: string;
  accounts: Account[];
  kycDocuments: any[];
  fixedDeposits: any[];
  recentTransactions: any[];
  totalBalance: number;
  totalCards: number;
  totalTransactions: number;
}

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  transactions: any[];
  cards: any[];
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  isSuspicious?: boolean;
  requiresVerification?: boolean;
}

interface DashboardStats {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalCards: number;
  totalFixedDeposits: number;
  totalEchecks: number;
  pendingKYC: number;
  corporateBanks: number;
  totalBankTransfers: number;
  recentTransactions: any[];
  recentKYC: any[];
  corporateBankStats: any[];
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    kycStatus: '',
    accountType: '',
    emailVerified: ''
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    userId: '',
    accountId: '',
    amount: '',
    type: 'CREDIT',
    description: '',
    adminNote: ''
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Check for admin session token
    const sessionToken = localStorage.getItem('adminSessionToken');
    
    if (!sessionToken) {
      router.push('/admin/login');
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      // Get admin session token
      const sessionToken = localStorage.getItem('adminSessionToken');
      
      if (!sessionToken) {
        setLoading(false);
        router.push('/admin/login');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      };

      // Only fetch users data since transactions endpoint doesn't exist
      const usersResponse = await fetch('/api/admin/users', { headers });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      } else {
        const errorText = await usersResponse.text();
        console.error('Failed to fetch users:', errorText);
        
        // If it's an authentication error, redirect to login
        if (usersResponse.status === 401) {
          localStorage.removeItem('adminSessionToken');
          router.push('/admin/login');
          return;
        }
      }

      // Set empty transactions array since endpoint doesn't exist
      setTransactions([]);
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/dashboard', { headers });
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data);
      } else {
        console.error('Failed to fetch dashboard stats:', await statsResponse.text());
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.accounts.some(acc => acc.accountNumber.includes(searchTerm));
    
    const matchesKYC = !filters.kycStatus || user.kycStatus === filters.kycStatus;
    const matchesEmailVerified = filters.emailVerified === '' || 
      (filters.emailVerified === 'true' ? user.emailVerified : !user.emailVerified);
    
    return matchesSearch && matchesKYC && matchesEmailVerified;
  });

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const sessionToken = localStorage.getItem('adminSessionToken');
      
      if (!sessionToken) {
        console.error('No admin session token found');
        return;
      }

      const response = await fetch('/api/admin/manual-entry', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(manualEntry)
      });

      if (response.ok) {
        setShowManualEntry(false);
        setManualEntry({
          userId: '',
          accountId: '',
          amount: '',
          type: 'CREDIT',
          description: '',
          adminNote: ''
        });
        fetchDashboardData(); // Refresh data
      } else {
        console.error('Failed to create manual entry:', await response.text());
      }
    } catch (error) {
      console.error('Failed to create manual entry:', error);
    }
  };

  const updateKYCStatus = async (userId: string, status: string) => {
    try {
      const sessionToken = localStorage.getItem('adminSessionToken');
      
      if (!sessionToken) {
        console.error('No admin session token found');
        return;
      }

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ userId, kycStatus: status })
      });

      if (response.ok) {
        console.log('KYC status updated successfully');
        fetchDashboardData(); // Refresh data
      } else {
        console.error('Failed to update KYC status:', await response.text());
      }
    } catch (error) {
      console.error('Failed to update KYC status:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSessionToken');
    router.push('/admin/login');
  };

  const getStats = () => {
    if (!stats) return {
      totalUsers: 0,
      totalAccounts: 0,
      totalTransactions: 0,
      totalCards: 0,
      totalFixedDeposits: 0,
      totalEchecks: 0,
      pendingKYC: 0,
      corporateBanks: 0,
      totalBankTransfers: 0,
      recentTransactions: [],
      recentKYC: [],
      corporateBankStats: []
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentStats = getStats();

  if (!currentStats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users, transactions, and system operations</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{currentStats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified KYC</p>
                <p className="text-2xl font-bold text-gray-900">{currentStats.totalUsers - currentStats.pendingKYC}</p>
                <p className="text-xs text-gray-500">{currentStats.pendingKYC} pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${users.reduce((sum, user) => sum + user.totalBalance, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-gray-900">{currentStats.totalCards}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">KYC Documents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((sum, user) => sum + user.kycDocuments.length, 0)}
                </p>
                <p className="text-xs text-gray-500">Total uploaded</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Email Verified</p>
                <p className="text-2xl font-bold text-gray-900">{currentStats.totalUsers - currentStats.pendingKYC}</p>
                <p className="text-xs text-gray-500">Users verified</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentStats.pendingKYC}
                </p>
                <p className="text-xs text-gray-500">Documents pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
              >
                User Management
              </button>
              <button
                onClick={() => router.push('/admin/kyc')}
                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                KYC Management
              </button>
            </nav>
          </div>
        </div>

        {/* Users Management Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium text-gray-900">User Management</h2>
                <p className="text-sm text-gray-500">Manage user accounts, KYC status, and account details</p>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 sm:mt-0">
                <select
                  value={filters.kycStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, kycStatus: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All KYC Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <select
                  value={filters.emailVerified}
                  onChange={(e) => setFilters(prev => ({ ...prev, emailVerified: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Email Status</option>
                  <option value="true">Email Verified</option>
                  <option value="false">Email Not Verified</option>
                </select>

                <button
                  onClick={() => setShowManualEntry(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Manual Entry</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, account number, or card number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KYC Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accounts & Cards
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                            {user.emailVerified && <Shield className="w-3 h-3 text-green-500" />}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <Phone className="w-3 h-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                        user.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        {user.accounts.map(account => (
                          <div key={account.id} className="border-l-2 border-blue-200 pl-2">
                            <div className="font-medium">{account.accountType} Account</div>
                            <div className="text-xs text-gray-500 flex items-center space-x-1">
                              <span>{account.accountNumber}</span>
                              <button
                                onClick={() => copyToClipboard(account.accountNumber)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center space-x-2">
                              <span className="flex items-center space-x-1">
                                <CreditCard className="w-3 h-3" />
                                <span>{account.cards.length} card(s)</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FileText className="w-3 h-3" />
                                <span>{user.kycDocuments.length} KYC doc(s)</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">${user.totalBalance.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {user.accounts.length} account(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Details</span>
                        </button>
                        {user.kycStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateKYCStatus(user.id, 'VERIFIED')}
                              className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Verify</span>
                            </button>
                            <button
                              onClick={() => updateKYCStatus(user.id, 'REJECTED')}
                              className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  User Details: {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setManualEntry(prev => ({
                        ...prev,
                        userId: selectedUser.id,
                        accountId: selectedUser.accounts[0]?.id || ''
                      }));
                      setShowUserDetails(false);
                      setShowManualEntry(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Manual Entry
                  </button>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>User ID:</strong> <span className="font-mono text-gray-600">{selectedUser.id}</span></div>
                    <div><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</div>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    <div><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</div>
                    <div><strong>KYC Status:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        selectedUser.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                        selectedUser.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.kycStatus}
                      </span>
                    </div>
                    <div><strong>Email Verified:</strong> {selectedUser.emailVerified ? 'Yes' : 'No'}</div>
                    <div><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                {/* Account Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Account Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total Balance:</strong> ${selectedUser.totalBalance.toLocaleString()}</div>
                    <div><strong>Total Accounts:</strong> {selectedUser.accounts.length}</div>
                    <div><strong>Total Cards:</strong> {selectedUser.totalCards}</div>
                    <div><strong>Total Transactions:</strong> {selectedUser.totalTransactions}</div>
                    <div><strong>Fixed Deposits:</strong> {selectedUser.fixedDeposits.length}</div>
                  </div>
                </div>
              </div>

              {/* KYC Status Summary */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">KYC Status Summary</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700">Overall Status</div>
                      <div className={`inline-flex px-2 py-1 text-xs rounded-full font-medium mt-1 ${
                        selectedUser.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                        selectedUser.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.kycStatus}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Documents Uploaded</div>
                      <div className="text-lg font-bold text-blue-600 mt-1">
                        {selectedUser.kycDocuments.length}/3
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Documents Verified</div>
                      <div className="text-lg font-bold text-green-600 mt-1">
                        {selectedUser.kycDocuments.filter(doc => doc.status === 'VERIFIED').length}
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Type Breakdown */}
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Document Breakdown:</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span>Government ID:</span>
                        <span className={`px-2 py-1 rounded ${
                          selectedUser.kycDocuments.some(doc => doc.documentType === 'ID_PROOF' && doc.status === 'VERIFIED') 
                            ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedUser.kycDocuments.some(doc => doc.documentType === 'ID_PROOF' && doc.status === 'VERIFIED') ? '✓ Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Proof of Address:</span>
                        <span className={`px-2 py-1 rounded ${
                          selectedUser.kycDocuments.some(doc => doc.documentType === 'ADDRESS_PROOF' && doc.status === 'VERIFIED') 
                            ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedUser.kycDocuments.some(doc => doc.documentType === 'ADDRESS_PROOF' && doc.status === 'VERIFIED') ? '✓ Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Selfie:</span>
                        <span className={`px-2 py-1 rounded ${
                          selectedUser.kycDocuments.some(doc => doc.documentType === 'SELFIE_PHOTO' && doc.status === 'VERIFIED') 
                            ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedUser.kycDocuments.some(doc => doc.documentType === 'SELFIE_PHOTO' && doc.status === 'VERIFIED') ? '✓ Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accounts Details */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Account Details</h4>
                <div className="space-y-4">
                  {selectedUser.accounts.map(account => (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium">{account.accountType} Account</h5>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span>Account: {account.accountNumber}</span>
                            <button
                              onClick={() => copyToClipboard(account.accountNumber)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            Account ID: {account.id}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${account.balance.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{account.currency}</div>
                        </div>
                      </div>

                      {/* Cards */}
                      {account.cards.length > 0 && (
                        <div className="mt-3">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">Cards ({account.cards.length})</h6>
                          <div className="space-y-2">
                            {account.cards.map(card => (
                              <div key={card.id} className="bg-gray-50 p-3 rounded-lg border">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <CreditCard className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium text-sm">{card.cardType} Card</span>
                                    </div>
                                    <div className="font-mono text-sm text-gray-900 mb-1">
                                      {card.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
                                    </div>
                                    <div className="text-xs text-gray-500 space-y-1">
                                      <div>Expires: {new Date(card.expiryDate).toLocaleDateString()}</div>
                                      <div>CVV: {card.cvv}</div>
                                      <div>Type: {card.isVirtual ? 'Virtual' : 'Physical'}</div>
                                      <div>Daily Limit: ${Number(card.dailyLimit).toLocaleString()}</div>
                                      <div>Monthly Limit: ${Number(card.monthlyLimit).toLocaleString()}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`px-2 py-1 text-xs rounded-full font-medium ${
                                      card.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                      card.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {card.status}
                                    </div>
                                    <div className={`mt-1 px-2 py-1 text-xs rounded-full ${
                                      card.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {card.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                  Created: {new Date(card.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {account.cards.length === 0 && (
                        <div className="mt-3">
                          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg text-center">
                            No cards issued for this account
                          </div>
                        </div>
                      )}

                      {/* Recent Transactions */}
                      {account.transactions.length > 0 && (
                        <div className="mt-3">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">Recent Transactions</h6>
                          <div className="space-y-1">
                            {account.transactions.slice(0, 3).map(tx => (
                              <div key={tx.id} className="flex justify-between items-center text-sm">
                                <div>
                                  <div className="font-medium">{tx.description}</div>
                                  <div className="text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className={`font-medium ${
                                  tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* KYC Documents */}
              {selectedUser.kycDocuments.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">KYC Documents ({selectedUser.kycDocuments.length})</h4>
                  <div className="space-y-3">
                    {selectedUser.kycDocuments.map(doc => (
                      <div key={doc.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-sm">
                                {doc.documentType === 'ID_PROOF' ? 'Government ID' :
                                 doc.documentType === 'ADDRESS_PROOF' ? 'Proof of Address' :
                                 doc.documentType === 'SELFIE_PHOTO' ? 'Selfie' : doc.documentType}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                              {doc.verifiedAt && <div>Verified: {new Date(doc.verifiedAt).toLocaleDateString()}</div>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`px-2 py-1 text-xs rounded-full font-medium ${
                              doc.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                              doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </a>
                          <a
                            href={doc.fileUrl}
                            download
                            className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.kycDocuments.length === 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">KYC Documents</h4>
                  <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
                    No KYC documents uploaded yet
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Entry Modal */}
        {showManualEntry && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Manual Transaction Entry</h3>
                <button
                  onClick={() => setShowManualEntry(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleManualEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <input
                    type="text"
                    value={manualEntry.userId}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, userId: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Account ID</label>
                  <input
                    type="text"
                    value={manualEntry.accountId}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, accountId: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualEntry.amount}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, amount: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={manualEntry.type}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, type: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="CREDIT">Credit</option>
                    <option value="DEBIT">Debit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={manualEntry.description}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Note</label>
                  <textarea
                    value={manualEntry.adminNote}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, adminNote: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowManualEntry(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Create Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 