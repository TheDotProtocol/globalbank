'use client';

import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface NewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  onSuccess: () => void;
}

export default function NewCardModal({ isOpen, onClose, accounts, onSuccess }: NewCardModalProps) {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [cardType, setCardType] = useState<'VIRTUAL' | 'DEBIT' | 'CREDIT'>('VIRTUAL');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccount) {
      showToast('Please select an account', 'error');
      return;
    }

    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please log in to continue', 'error');
        return;
      }

      const response = await fetch('/api/cards/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardType,
          accountId: selectedAccount
        })
      });

      if (response.ok) {
        const data = await response.json();
        showToast(`${cardType === 'VIRTUAL' ? 'Virtual' : cardType} card created successfully!`, 'success');
        onSuccess();
        onClose();
        setSelectedAccount('');
        setCardType('VIRTUAL');
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to create card', 'error');
      }
    } catch (error) {
      console.error('Create card error:', error);
      showToast('Failed to create card', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Request New Card</h2>
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
                  {account.accountType} - {account.accountNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCardType('VIRTUAL')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  cardType === 'VIRTUAL'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Virtual</div>
                    <div className="text-sm opacity-75">Instant access</div>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setCardType('DEBIT')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  cardType === 'DEBIT'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Debit</div>
                    <div className="text-sm opacity-75">Direct from account</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCardType('CREDIT')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  cardType === 'CREDIT'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Credit</div>
                    <div className="text-sm opacity-75">Credit line</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md">
            <div className="flex items-center space-x-2 text-sm text-yellow-700">
              <Mail className="w-4 h-4" />
              <span>
                {cardType === 'VIRTUAL' 
                  ? 'Virtual card details will be sent to your email immediately'
                  : 'Physical card will be mailed to your registered address'
                }
              </span>
            </div>
          </div>

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
              {loading ? 'Creating...' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 