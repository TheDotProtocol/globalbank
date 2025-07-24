'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building, 
  Banknote, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Eye,
  Download,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface CorporateBank {
  id: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  currency: string;
  isActive: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  transferFee: number;
  apiEnabled: boolean;
  createdAt: string;
  _count: {
    bankTransfers: number;
  };
}

interface BankTransfer {
  id: string;
  toAccountNumber: string;
  toAccountName: string;
  amount: number;
  currency: string;
  transferType: string;
  status: string;
  reference: string;
  description: string;
  fee: number;
  netAmount: number;
  processedAt: string;
  createdAt: string;
}

export default function CorporateBankPage() {
  const [corporateBanks, setCorporateBanks] = useState<CorporateBank[]>([]);
  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState<CorporateBank | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchCorporateBankData();
  }, []);

  const fetchCorporateBankData = async () => {
    setLoading(true);
    try {
      const sessionToken = localStorage.getItem('adminSessionToken');
      
      if (!sessionToken) {
        router.push('/admin/login');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      };

      // Fetch corporate bank data
      const response = await fetch('/api/admin/corporate-bank', { headers });
      
      if (response.ok) {
        const data = await response.json();
        setCorporateBanks(data.corporateBanks || []);
        setBankTransfers(data.bankTransfers || []);
        
        if (data.corporateBanks && data.corporateBanks.length > 0) {
          setSelectedBank(data.corporateBanks[0]);
        }
      } else {
        console.error('Failed to fetch corporate bank data:', await response.text());
        showToast('Failed to load corporate bank data', 'error');
      }
    } catch (error) {
      console.error('Error fetching corporate bank data:', error);
      showToast('Error loading corporate bank data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSessionToken');
    localStorage.removeItem('adminInfo');
    router.push('/admin/login');
  };

  const getTotalTransfers = () => {
    return bankTransfers.length;
  };

  const getTotalAmount = () => {
    return bankTransfers.reduce((sum, transfer) => sum + transfer.amount, 0);
  };

  const getTotalFees = () => {
    return bankTransfers.reduce((sum, transfer) => sum + transfer.fee, 0);
  };

  const getRecentTransfers = () => {
    return bankTransfers
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading corporate bank data...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building className="w-8 h-8 mr-3 text-blue-600" />
                Corporate Bank Management
              </h1>
              <p className="text-gray-600">Monitor corporate bank accounts, transactions, and balances</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchCorporateBankData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Corporate Bank Overview */}
        {corporateBanks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Corporate Banks</p>
                  <p className="text-2xl font-bold text-gray-900">{corporateBanks.length}</p>
                  <p className="text-xs text-gray-500">Active accounts</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Banknote className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transfers</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalTransfers()}</p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getTotalAmount().toLocaleString()} THB
                  </p>
                  <p className="text-xs text-gray-500">Transferred</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Fees</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getTotalFees().toLocaleString()} THB
                  </p>
                  <p className="text-xs text-gray-500">Collected</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Corporate Bank Details */}
        {corporateBanks.map((bank) => (
          <div key={bank.id} className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{bank.bankName}</h2>
                    <p className="text-sm text-gray-500">{bank.accountHolderName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    bank.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {bank.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-500">{bank.currency}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">Account Number</p>
                  <p className="text-lg font-semibold text-gray-900">{bank.accountNumber}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">Daily Limit</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {bank.dailyLimit.toLocaleString()} {bank.currency}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">Monthly Limit</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {bank.monthlyLimit.toLocaleString()} {bank.currency}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-500">Transfer Fee</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {bank.transferFee.toLocaleString()} {bank.currency}
                  </p>
                </div>
              </div>

              {/* Recent Transfers */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transfers</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          To Account
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getRecentTransfers().map((transfer) => (
                        <tr key={transfer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transfer.reference}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{transfer.toAccountName}</div>
                              <div className="text-gray-500">{transfer.toAccountNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              {transfer.transferType === 'INBOUND' ? (
                                <ArrowDownRight className="w-4 h-4 text-green-600 mr-1" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-red-600 mr-1" />
                              )}
                              {transfer.amount.toLocaleString()} {transfer.currency}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transfer.fee.toLocaleString()} {transfer.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transfer.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              transfer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transfer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transfer.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}

        {corporateBanks.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Corporate Banks</h3>
            <p className="text-gray-500 mb-4">No corporate bank accounts have been configured yet.</p>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 