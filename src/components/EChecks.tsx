'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface ECheck {
  id: string;
  checkNumber: string;
  payeeName: string;
  amount: number;
  memo?: string;
  status: 'PENDING' | 'CLEARED' | 'REJECTED';
  clearedAt?: string;
  createdAt: string;
  account: {
    accountNumber: string;
    accountType: string;
  };
}

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
}

export default function EChecks() {
  const [eChecks, setEChecks] = useState<ECheck[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    accountId: '',
    payeeName: '',
    amount: '',
    memo: ''
  });

  useEffect(() => {
    fetchEChecks();
    fetchAccounts();
  }, []);

  const fetchEChecks = async () => {
    try {
      const response = await fetch('/api/e-checks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEChecks(data.eChecks);
      }
    } catch (error) {
      console.error('Error fetching e-checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/user/accounts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleCreateECheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/e-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setEChecks(prev => [data.eCheck, ...prev]);
        setShowCreateForm(false);
        setFormData({
          accountId: '',
          payeeName: '',
          amount: '',
          memo: ''
        });
        alert('E-Check created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create e-check');
      }
    } catch (error) {
      console.error('Error creating e-check:', error);
      alert('Failed to create e-check');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CLEARED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLEARED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEChecks = eChecks.filter(check => {
    const matchesStatus = !filterStatus || check.status === filterStatus;
    const matchesSearch = !searchTerm || 
      check.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.checkNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">E-Checks</h2>
          <p className="text-gray-600">Manage your digital checks</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New E-Check</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by payee or check number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CLEARED">Cleared</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* E-Checks List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent E-Checks</h3>
          
          {filteredEChecks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No e-checks found</p>
              <p className="text-sm text-gray-500">Create your first e-check to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEChecks.map((check) => (
                <div key={check.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">#{check.checkNumber}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                            {check.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Payee: {check.payeeName}</p>
                        <p className="text-xs text-gray-500">Account: {check.account.accountNumber}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${check.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(check.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {check.memo && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Memo:</span> {check.memo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create E-Check Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New E-Check</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateECheck} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account
                </label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountType} - {account.accountNumber} (${account.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payee Name
                </label>
                <input
                  type="text"
                  value={formData.payeeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, payeeName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter payee name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Memo (Optional)
                </label>
                <input
                  type="text"
                  value={formData.memo}
                  onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter memo"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create E-Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 