'use client';

import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Building2, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Image from 'next/image';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  onSuccess: () => void;
}

type PaymentMethod = 'card' | 'bank_transfer';

function CardPaymentForm({ amount, setAmount, selectedAccount, setSelectedAccount, onSuccess, onClose, accounts }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [requiresAction, setRequiresAction] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      showToast('Stripe is not loaded', 'error');
      return;
    }

    if (!amount || !selectedAccount) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
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

      // Create payment intent
      const response = await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: numAmount,
          accountId: selectedAccount,
          paymentMethod: 'card'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      // Confirm card payment with 3D Secure support
      const { error: confirmError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: 'Card Holder',
          },
        },
        setup_future_usage: 'off_session',
      });

      console.log('Payment confirmation result:', { confirmError, confirmedIntent });

      if (confirmError) {
        console.error('Stripe confirmation error:', confirmError);
        if (confirmError.code === 'authentication_required') {
          // Handle 3D Secure authentication
          console.log('3D Secure authentication required');
          setRequiresAction(true);
          setPaymentIntent(confirmedIntent);
          return;
        }
        
        // Handle specific authentication errors
        if (confirmError.code === 'payment_intent_authentication_failure') {
          throw new Error('Payment authentication failed. Please try a different card or contact your bank.');
        }
        
        if (confirmError.code === 'card_declined') {
          throw new Error('Card was declined. Please check your card details and try again.');
        }
        
        if (confirmError.code === 'expired_card') {
          throw new Error('Card has expired. Please use a different card.');
        }
        
        if (confirmError.code === 'incorrect_cvc') {
          throw new Error('Incorrect CVC. Please check your card details and try again.');
        }
        
        if (confirmError.code === 'processing_error') {
          throw new Error('Payment processing error. Please try again or use a different payment method.');
        }
        
        throw new Error(`Payment failed: ${confirmError.message} (Code: ${confirmError.code})`);
      }

      // Check if payment requires additional action (3D Secure)
      if (confirmedIntent && confirmedIntent.status === 'requires_action') {
        console.log('Payment requires action:', confirmedIntent.status);
        setRequiresAction(true);
        setPaymentIntent(confirmedIntent);
        return;
      }

      // Payment succeeded
      if (confirmedIntent && confirmedIntent.status === 'succeeded') {
        console.log('Payment succeeded:', confirmedIntent.id);
        await handlePaymentSuccess(confirmedIntent.id, numAmount, selectedAccount, token);
      } else {
        console.log('Unexpected payment status:', confirmedIntent?.status);
        throw new Error(`Unexpected payment status: ${confirmedIntent?.status}`);
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      showToast(error.message || 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string, amount: number, accountId: string, token: string) => {
    try {
      // Call backend to update account balance immediately
      const updateResponse = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentIntentId,
          amount,
          accountId
        })
      });

      if (!updateResponse.ok) {
        console.warn('Failed to update account balance immediately, but payment was successful');
      }

      showToast('Payment successful! Money added to your account.', 'success');
      onSuccess();
      onClose();
      setAmount('');
      setSelectedAccount('');
    } catch (error) {
      console.error('Error updating account balance:', error);
      showToast('Payment successful but failed to update balance. Please contact support.', 'warning');
    }
  };

  const handle3DSecureAction = async () => {
    if (!stripe || !paymentIntent) return;

    setLoading(true);

    try {
      console.log('Starting 3D Secure authentication...');
      const { error, paymentIntent: updatedIntent } = await stripe.confirmCardPayment(paymentIntent.client_secret);

      console.log('3D Secure result:', { error, updatedIntent });

      if (error) {
        console.error('3D Secure error:', error);
        throw new Error(`3D Secure authentication failed: ${error.message} (Code: ${error.code})`);
      }

      if (updatedIntent && updatedIntent.status === 'succeeded') {
        console.log('3D Secure authentication successful');
        const token = localStorage.getItem('token');
        if (token) {
          await handlePaymentSuccess(updatedIntent.id, parseFloat(amount), selectedAccount, token);
        }
      } else {
        console.log('3D Secure authentication failed - unexpected status:', updatedIntent?.status);
        throw new Error(`Payment authentication failed - Status: ${updatedIntent?.status}`);
      }
    } catch (error: any) {
      console.error('3D Secure error:', error);
      showToast(error.message || '3D Secure authentication failed', 'error');
    } finally {
      setLoading(false);
      setRequiresAction(false);
      setPaymentIntent(null);
    }
  };

  if (requiresAction && paymentIntent) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">3D Secure Authentication Required</h3>
          <p className="text-gray-600 mb-4">
            Your bank requires additional verification. Please complete the authentication in the popup window.
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => {
              setRequiresAction(false);
              setPaymentIntent(null);
            }}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handle3DSecureAction}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Complete Authentication'}
          </button>
        </div>
      </div>
    );
  }

  return (
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
          {accounts.map((account: any) => (
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
          Card Details (Credit or Debit)
        </label>
        <div className="border border-gray-300 rounded-md p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Debit cards may require 3D Secure authentication from your bank.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
          <p className="text-xs text-yellow-800">
            <strong>Testing:</strong> Use Stripe test cards for testing (e.g., 4242424242424242). Real cards will work in production.
          </p>
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
          disabled={loading || !stripe}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Add Money'}
        </button>
      </div>
    </form>
  );
}

function BankTransferForm({ amount, setAmount, selectedAccount, setSelectedAccount, onSuccess, onClose, accounts }: any) {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [transferDetails, setTransferDetails] = useState<any>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !selectedAccount) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
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

      // Create bank transfer payment intent
      const response = await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: numAmount,
          accountId: selectedAccount,
          paymentMethod: 'bank_transfer'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create bank transfer');
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setTransferDetails(data.transferDetails);
      showToast('Bank transfer details generated successfully!', 'success');

    } catch (error: any) {
      console.error('Bank transfer error:', error);
      showToast(error.message || 'Failed to create bank transfer', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (qrCode && transferDetails) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank Transfer Details</h3>
          <p className="text-gray-600 mb-4">
            Use the QR code or transfer details below to complete your payment.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="text-center">
            <Image
              src={qrCode}
              alt="QR Code"
              width={192}
              height={192}
              className="mx-auto w-48 h-48 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Account Number:</span>
              <span className="text-sm text-gray-900">{transferDetails.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Routing Number:</span>
              <span className="text-sm text-gray-900">{transferDetails.routingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Amount:</span>
              <span className="text-sm text-gray-900">${transferDetails.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Reference:</span>
              <span className="text-sm text-gray-900 font-mono">{transferDetails.reference}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> Please include the reference number in your transfer description to ensure proper credit to your account.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => {
              setQrCode('');
              setTransferDetails(null);
            }}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            New Transfer
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
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
          {accounts.map((account: any) => (
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Bank Transfer:</strong> You'll receive a QR code and transfer details to complete your payment through your bank's mobile app or online banking.
        </p>
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
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Transfer Details'}
        </button>
      </div>
    </form>
  );
}

export default function AddMoneyModal({ isOpen, onClose, accounts, onSuccess }: AddMoneyModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add Money</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                paymentMethod === 'card'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-sm font-medium">Credit/Debit Card</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                paymentMethod === 'bank_transfer'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-medium">Bank Transfer</span>
            </button>
          </div>
        </div>

        {/* Payment Forms */}
        {paymentMethod === 'card' ? (
          <Elements stripe={stripePromise}>
            <CardPaymentForm
              amount={amount}
              setAmount={setAmount}
              selectedAccount={selectedAccount}
              setSelectedAccount={setSelectedAccount}
              onSuccess={onSuccess}
              onClose={onClose}
              accounts={accounts}
            />
          </Elements>
        ) : (
          <BankTransferForm
            amount={amount}
            setAmount={setAmount}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            onSuccess={onSuccess}
            onClose={onClose}
            accounts={accounts}
          />
        )}
      </div>
    </div>
  );
} 