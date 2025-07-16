'use client';

import React, { useState } from 'react';
import { X, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface FixedDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  userId: string;
  onSuccess: () => void;
}

export default function FixedDepositModal({ isOpen, onClose, accounts, userId, onSuccess }: FixedDepositModalProps) {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('12');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !selectedAccount || !duration) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const numAmount = parseFloat(amount);
    const numDuration = parseInt(duration);

    if (numAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    // Check if account has sufficient balance
    const account = accounts.find(acc => acc.id === selectedAccount);
    if (account && account.balance < numAmount) {
      showToast('Insufficient balance in selected account', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/fixed-deposits/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          accountId: selectedAccount,
          amount: numAmount,
          duration: numDuration
        })
      });

      if (response.ok) {
        const data = await response.json();
        showToast('Fixed deposit created successfully!', 'success');
        onSuccess();
        onClose();
        setAmount('');
        setSelectedAccount('');
        setDuration('12');
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to create fixed deposit', 'error');
      }
    } catch (error) {
      console.error('Create fixed deposit error:', error);
      showToast('Failed to create fixed deposit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateInterest = () => {
    if (!amount || !duration) return 0;
    const numAmount = parseFloat(amount);
    const numDuration = parseInt(duration);
    const interestRate = 5.5; // 5.5% annual interest
    return (numAmount * interestRate * numDuration) / (12 * 100);
  };

  const maturityAmount = parseFloat(amount) + calculateInterest();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create Fixed Deposit</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose an account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountType} - {account.accountNumber} (${account.balance})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (Months)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
              </select>
            </div>
          </div>

          {amount && duration && (
            <div className="bg-green-50 p-4 rounded-md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Interest Rate:</span>
                  <span className="font-medium text-green-900">5.5% p.a.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Interest Earned:</span>
                  <span className="font-medium text-green-900">${calculateInterest().toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Maturity Amount:</span>
                  <span className="font-medium text-green-900">${maturityAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Fixed Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 