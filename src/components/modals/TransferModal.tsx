'use client';

import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  onSuccess: () => void;
}

export default function TransferModal({ isOpen, onClose, accounts, onSuccess }: TransferModalProps) {
  const [formData, setFormData] = useState({
    sourceAccountId: '',
    destinationAccountNumber: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [transferDetails, setTransferDetails] = useState<any>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sourceAccountId || !formData.destinationAccountNumber || !formData.amount || !formData.description) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    // Find source account to check balance
    const sourceAccount = accounts.find(acc => acc.id === formData.sourceAccountId);
    if (sourceAccount && sourceAccount.balance < amount) {
      showToast('Insufficient balance', 'error');
      return;
    }

    // Find destination account
    const destinationAccount = accounts.find(acc => acc.accountNumber === formData.destinationAccountNumber);
    if (!destinationAccount) {
      showToast('Destination account not found', 'error');
      return;
    }

    // Show transfer details for confirmation
    setTransferDetails({
      sourceAccount,
      destinationAccount,
      amount,
      description: formData.description,
      transferFee: 0, // Internal transfer has no fee
      netAmount: amount
    });
    setStep(2);
  };

  const confirmTransfer = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Authentication required', 'error');
        return;
      }

      const response = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceAccountId: formData.sourceAccountId,
          destinationAccountNumber: formData.destinationAccountNumber,
          amount: formData.amount,
          description: formData.description,
          transferMode: 'INTERNAL_TRANSFER'
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Transfer completed successfully', 'success');
        onSuccess();
        handleClose();
      } else {
        showToast(data.error || 'Transfer failed', 'error');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      showToast('Transfer failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      sourceAccountId: '',
      destinationAccountNumber: '',
      amount: '',
      description: ''
    });
    setStep(1);
    setTransferDetails(null);
    setLoading(false);
    onClose();
  };

  const sourceAccount = accounts.find(acc => acc.id === formData.sourceAccountId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 1 ? 'Transfer Money' : 'Confirm Transfer'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Account
              </label>
              <select
                name="sourceAccountId"
                value={formData.sourceAccountId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountNumber} - ${account.balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Account Number
              </label>
              <input
                type="text"
                name="destinationAccountNumber"
                value={formData.destinationAccountNumber}
                onChange={handleInputChange}
                placeholder="Enter account number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {sourceAccount && formData.amount && (
                <p className="text-sm text-gray-500 mt-1">
                  Available: ${sourceAccount.balance.toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What's this transfer for?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Transfer Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">From:</span>
                  <span className="text-sm font-medium">
                    {transferDetails?.sourceAccount?.accountNumber}
                  </span>
                </div>
                
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">To:</span>
                  <span className="text-sm font-medium">
                    {transferDetails?.destinationAccount?.accountNumber}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${transferDetails?.amount?.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fee:</span>
                    <span className="text-sm text-gray-900">
                      ${transferDetails?.transferFee?.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm font-medium text-gray-900">Net Amount:</span>
                    <span className="text-lg font-bold text-blue-600">
                      ${transferDetails?.netAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className="text-sm text-gray-600">Description:</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {transferDetails?.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Please confirm your transfer</p>
                  <p className="mt-1">This action cannot be undone once completed.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={confirmTransfer}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 