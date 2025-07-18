'use client';

import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  kycStatus: string;
  country?: string;
  city?: string;
  dateOfBirth?: string;
  createdAt: string;
  accounts: Account[];
}

interface Account {
  id: string;
  accountNumber: string;
  balance: number;
  currency: string;
  accountType: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  isSuspicious: boolean;
  requiresVerification: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    kycStatus: '',
    dateRange: '',
    accountType: ''
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    userId: '',
    accountId: '',
    amount: '',
    type: 'CREDIT',
    description: '',
    adminNote: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersResponse, transactionsResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/transactions')
      ]);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
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
      user.accounts.some(acc => acc.accountNumber.includes(searchTerm));
    
    const matchesCountry = !filters.country || user.country === filters.country;
    const matchesKYC = !filters.kycStatus || user.kycStatus === filters.kycStatus;
    
    return matchesSearch && matchesCountry && matchesKYC;
  });

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/manual-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      }
    } catch (error) {
      console.error('Failed to create manual entry:', error);
    }
  };

  const updateKYCStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/kyc/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to update KYC status:', error);
    }
  };

  const getStats = () => {
    const totalUsers = users.length;
    const verifiedUsers = users.filter(u => u.kycStatus === 'VERIFIED').length;
    const pendingKYC = users.filter(u => u.kycStatus === 'PENDING').length;
    const totalBalance = users.reduce((sum, user) => 
      sum + user.accounts.reduce((accSum, acc) => accSum + acc.balance, 0), 0
    );
    const suspiciousTransactions = transactions.filter(t => t.isSuspicious).length;
    const pendingVerification = transactions.filter(t => t.requiresVerification).length;

    return {
      totalUsers,
      verifiedUsers,
      pendingKYC,
      totalBalance,
      suspiciousTransactions,
      pendingVerification
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, transactions, and system operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified KYC</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspicious Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.suspiciousTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or account number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.country}
                  onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Countries</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India</option>
                  <option value="TH">Thailand</option>
                  <option value="SG">Singapore</option>
                </select>

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

                <button
                  onClick={() => setShowManualEntry(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Manual Entry</span>
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KYC Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accounts
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
                          <div className="text-sm text-gray-500">{user.email}</div>
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
                      {user.city && user.country ? `${user.city}, ${user.country}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.accounts.length} account(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${user.accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user.kycStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateKYCStatus(user.id, 'VERIFIED')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateKYCStatus(user.id, 'REJECTED')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="w-4 h-4" />
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

        {/* Manual Entry Modal */}
        {showManualEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Entry</h3>
              
              <form onSubmit={handleManualEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={manualEntry.userId}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account ID
                  </label>
                  <input
                    type="text"
                    value={manualEntry.accountId}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, accountId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={manualEntry.amount}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={manualEntry.type}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="CREDIT">Credit</option>
                    <option value="DEBIT">Debit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={manualEntry.description}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Note
                  </label>
                  <textarea
                    value={manualEntry.adminNote}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, adminNote: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualEntry(false)}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  User Details: {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">KYC Status:</span>
                      <p className="font-medium">{selectedUser.kycStatus}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Country:</span>
                      <p className="font-medium">{selectedUser.country || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">City:</span>
                      <p className="font-medium">{selectedUser.city || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Accounts</h4>
                  <div className="space-y-2">
                    {selectedUser.accounts.map((account) => (
                      <div key={account.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{account.accountNumber}</p>
                            <p className="text-sm text-gray-600">{account.accountType}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{account.currency} {account.balance.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 